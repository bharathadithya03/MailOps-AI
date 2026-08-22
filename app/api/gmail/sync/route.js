import { NextResponse } from 'next/server';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { normalizeGmailMessage, generateAuditEventsForEmail } from '@/lib/gmail';

// In-memory server-side persistence store strictly scoped by userId
const serverEmailCache = new Map();
const serverAuditCache = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
  }

  let emails = [];
  let firestoreError = null;

  // 1. Try reading from Firestore users/{userId}/emails
  if (isFirebaseConfigured() && db && userId) {
    try {
      const subRef = collection(db, 'users', userId, 'emails');
      const subSnapshot = await getDocs(subRef);
      if (!subSnapshot.empty) {
        emails = subSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      firestoreError = e.message;
    }
  }

  // 2. Fallback to server cache strictly for this specific userId
  if (emails.length === 0 && serverEmailCache.has(userId)) {
    emails = serverEmailCache.get(userId) || [];
  }

  const auditLogs = serverAuditCache.get(userId) || [];

  return NextResponse.json({
    success: true,
    count: emails.length,
    firestoreError,
    emails,
    auditLogs,
  });
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Clear server in-memory caches
    serverEmailCache.delete(userId);
    serverAuditCache.delete(userId);

    // Delete all documents in users/{userId}/emails
    if (isFirebaseConfigured() && db) {
      try {
        const subRef = collection(db, 'users', userId, 'emails');
        const subSnapshot = await getDocs(subRef);
        for (const emailDoc of subSnapshot.docs) {
          await deleteDoc(doc(db, 'users', userId, 'emails', emailDoc.id));
        }
      } catch (e) {
        console.warn('Firestore email deletion error:', e);
      }
    }

    return NextResponse.json({ success: true, message: `Pipeline cleared for user ${userId}` });
  } catch (error) {
    console.error('Delete sync cache error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication error: User ID is required to sync emails.',
      }, { status: 400 });
    }

    let accessToken = null;
    let refreshToken = null;

    // 1. Get tokens from Firestore users/{userId}/integrations/gmail
    if (isFirebaseConfigured() && db && userId) {
      try {
        const integrationDoc = await getDoc(doc(db, 'users', userId, 'integrations', 'gmail'));
        if (integrationDoc.exists()) {
          const data = integrationDoc.data();
          accessToken = data.accessToken;
          refreshToken = data.refreshToken;
        }
      } catch (e) {
        console.warn('Firestore integration fetch notice:', e.message);
      }
    }

    // 2. Fallback token strictly from user-scoped cookie
    if (!accessToken) {
      const cookie = request.cookies.get(`mailops_gmail_${userId}`);
      if (cookie) {
        try {
          const parsed = JSON.parse(cookie.value);
          accessToken = parsed.accessToken;
        } catch (e) {}
      }
    }

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Gmail is not connected for this account. Please connect Gmail in Settings.',
      }, { status: 400 });
    }

    // Fetch message IDs list from Gmail API
    const listRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        error: err.error?.message || 'Failed to fetch messages from Gmail API. Token may be expired.',
      }, { status: 401 });
    }

    const listData = await listRes.json();
    const messages = listData.messages || [];
    const normalizedEmails = [];
    const allAuditEvents = [];

    // Fetch individual message details and normalize
    for (const item of messages.slice(0, 15)) {
      try {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (msgRes.ok) {
          const rawMsg = await msgRes.json();
          const normalized = normalizeGmailMessage(rawMsg, userId);
          normalizedEmails.push(normalized);

          // Generate genuine audit events for this email
          const events = generateAuditEventsForEmail(normalized);
          allAuditEvents.push(...events);

          // Store in Firestore users/{userId}/emails/{id}
          if (isFirebaseConfigured() && db && userId) {
            try {
              await setDoc(doc(db, 'users', userId, 'emails', normalized.id), normalized);
            } catch (e) {
              console.warn(`[Gmail Sync] Firestore setDoc error for email ${normalized.id}:`, e.message);
            }
          }
        }
      } catch (e) {
        console.warn('Error fetching message detail:', e);
      }
    }

    // Sort descending by timestamp
    normalizedEmails.sort((a, b) => new Date(b.receivedAt || 0) - new Date(a.receivedAt || 0));
    allAuditEvents.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    // Save to server in-memory cache strictly for this userId
    serverEmailCache.set(userId, normalizedEmails);
    serverAuditCache.set(userId, allAuditEvents);

    const now = new Date().toISOString();
    // Update lastSyncedAt in Firestore integration
    if (isFirebaseConfigured() && db && userId) {
      try {
        await updateDoc(doc(db, 'users', userId, 'integrations', 'gmail'), {
          lastSyncedAt: now,
          syncedCount: normalizedEmails.length,
        });
      } catch (e) {}
    }

    console.log(`[Gmail Sync] Successfully synchronized ${normalizedEmails.length} real Gmail emails for user ${userId}`);

    return NextResponse.json({
      success: true,
      count: normalizedEmails.length,
      syncedAt: now,
      emails: normalizedEmails,
      auditLogs: allAuditEvents,
    });
  } catch (error) {
    console.error('Gmail sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error during Gmail sync',
    }, { status: 500 });
  }
}
