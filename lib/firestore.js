import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { generateAuditEventsForEmail } from './gmail';

// ─── Generic Helpers ──────────────────────────────────────────────────────────

export async function getCollection(collectionName, constraints = []) {
  if (isFirebaseConfigured() && db) {
    try {
      const ref = collection(db, collectionName);
      const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {
      console.error(`[Firestore Error] getCollection (${collectionName}) failed:`, e.message || e);
    }
  }
  return [];
}

export async function getDocument(collectionName, docId) {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, collectionName, docId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
    } catch (e) {
      console.error(`[Firestore Error] getDocument (${collectionName}/${docId}) failed:`, e.message || e);
    }
  }
  return null;
}

export async function addDocument(collectionName, data) {
  if (isFirebaseConfigured() && db) {
    try {
      const ref = collection(db, collectionName);
      const docRef = await addDoc(ref, {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (e) {
      console.error(`[Firestore Error] addDocument (${collectionName}) failed:`, e.message || e);
    }
  }
  return `doc_${Date.now()}`;
}

export async function updateDocument(collectionName, docId, data) {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
      return;
    } catch (e) {
      console.error(`[Firestore Error] updateDocument (${collectionName}/${docId}) failed:`, e.message || e);
    }
  }
}

export async function deleteDocument(collectionName, docId) {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return;
    } catch (e) {
      console.error(`[Firestore Error] deleteDocument (${collectionName}/${docId}) failed:`, e.message || e);
    }
  }
}

// ─── Email-specific helpers with strict User Data Isolation ───────────────────

/**
 * Returns live synchronized emails strictly for the authenticated user (userId).
 * Strict isolation: never queries or falls back to any other user's data.
 */
export async function getEmails(userId) {
  if (!userId) return [];

  // 1. Attempt direct Firestore read from users/{userId}/emails
  if (isFirebaseConfigured() && db) {
    try {
      const subRef = collection(db, 'users', userId, 'emails');
      const subSnapshot = await getDocs(subRef);
      if (!subSnapshot.empty) {
        const emails = subSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return emails.sort((a, b) => new Date(b.receivedAt || b.timestamp || 0) - new Date(a.receivedAt || a.timestamp || 0));
      }
    } catch (e) {
      console.warn(`[Firestore getEmails notice] (users/${userId}/emails):`, e.message || e);
    }
  }

  // 2. Read from UID-scoped client local storage
  if (typeof window !== 'undefined') {
    try {
      const localSynced = localStorage.getItem(`mailops_synced_emails_${userId}`);
      if (localSynced) {
        const parsed = JSON.parse(localSynced);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => new Date(b.receivedAt || b.timestamp || 0) - new Date(a.receivedAt || a.timestamp || 0));
        }
      }
    } catch (e) {
      console.warn('[LocalStorage read notice]:', e);
    }

    // 3. Query the server-side sync GET endpoint for this specific userId
    try {
      const res = await fetch(`/api/gmail/sync?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.emails && data.emails.length > 0) {
          localStorage.setItem(`mailops_synced_emails_${userId}`, JSON.stringify(data.emails));
          return data.emails.sort((a, b) => new Date(b.receivedAt || b.timestamp || 0) - new Date(a.receivedAt || a.timestamp || 0));
        }
      }
    } catch (e) {
      console.warn('[API fetch notice]:', e);
    }
  }

  return [];
}

export async function getEmailById(emailId, userId) {
  if (!userId || !emailId) return null;

  // 1. Try Firestore users/{userId}/emails/{emailId}
  if (isFirebaseConfigured() && db) {
    try {
      const subDocRef = doc(db, 'users', userId, 'emails', emailId);
      const subDoc = await getDoc(subDocRef);
      if (subDoc.exists()) {
        return { id: subDoc.id, ...subDoc.data() };
      }
    } catch (e) {}
  }

  // 2. Try loaded emails list for this user
  const all = await getEmails(userId);
  const found = all.find((e) => e.id === emailId || e.messageId === emailId);
  return found || null;
}

export async function getEmailsByHandler(userId, handler) {
  if (!userId) return [];
  const allEmails = await getEmails(userId);
  return allEmails.filter((e) => e.handler === handler);
}

// ─── Audit-specific helpers ──────────────────────────────────────────────────

/**
 * Returns genuine audit logs derived exclusively from the authenticated user's emails.
 */
export async function getAuditLogs(userId) {
  if (!userId) return [];
  const emails = await getEmails(userId);

  const derivedEvents = [];
  for (const email of emails) {
    const events = generateAuditEventsForEmail(email);
    derivedEvents.push(...events);
  }

  return derivedEvents.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
}

export async function addAuditLog(data) {
  return addDocument('audit_logs', data);
}

// ─── Dashboard stats ─────────────────────────────────────────────────────────

/**
 * Calculates live dashboard analytics strictly from the authenticated user's synchronized emails dataset.
 */
export async function getDashboardStats(userId) {
  if (!userId) {
    return {
      isRealData: true,
      totalEmails: 0,
      processedEmails: 0,
      autoResolvedRate: 0,
      actionsTaken: 0,
      humanReviews: 0,
      spamFiltered: 0,
      avgConfidence: 0,
      intentCounts: { invoice: 0, payment: 0, dispute: 0, spam: 0, review: 0, general: 0 },
      recentEmails: [],
      recentAudit: [],
    };
  }

  const emails = await getEmails(userId);
  const auditLogs = await getAuditLogs(userId);

  const totalEmails = emails.length;
  const processedEmails = emails.filter((e) => e.status === 'processed' || e.status === 'Completed').length;
  const automatedActions = emails.filter((e) => e.action === 'automated' || e.policyDecision === 'auto_approve').length;
  const humanReviews = emails.filter((e) => e.action === 'human_review' || e.policyDecision === 'human_review').length;
  const spamFiltered = emails.filter((e) => e.intent === 'spam' || e.labels?.includes('SPAM')).length;
  const avgConfidence =
    totalEmails > 0
      ? Math.round(emails.reduce((sum, e) => sum + (e.confidence || 0), 0) / totalEmails)
      : 0;

  const intentCounts = {
    invoice: emails.filter((e) => e.intent === 'invoice' || e.handler === 'invoice').length,
    payment: emails.filter((e) => e.intent === 'payment_confirmation' || e.intent === 'payment_request' || e.intent === 'inquiry' || e.handler === 'payment').length,
    dispute: emails.filter((e) => e.intent === 'dispute' || e.intent === 'compliance' || e.intent === 'security' || e.handler === 'dispute').length,
    spam: spamFiltered,
    review: humanReviews,
    general: emails.filter((e) => e.intent === 'general').length,
  };

  return {
    isRealData: true,
    totalEmails,
    processedEmails,
    autoResolvedRate: totalEmails > 0 ? Math.round((automatedActions / totalEmails) * 100) : 0,
    actionsTaken: automatedActions,
    humanReviews,
    spamFiltered,
    avgConfidence,
    intentCounts,
    recentEmails: emails.slice(0, 8),
    recentAudit: auditLogs.slice(0, 8),
  };
}

export { where, orderBy, limit };
