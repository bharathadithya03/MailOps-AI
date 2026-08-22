import { NextResponse } from 'next/server';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(request) {
  const result = {
    isFirebaseConfigured: isFirebaseConfigured(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    users: [],
    integrationsFound: [],
    emailsFound: [],
    errors: [],
  };

  if (!db) {
    result.errors.push('db is null or undefined');
    return NextResponse.json(result);
  }

  try {
    // 1. Check all users in `users` collection
    const usersSnapshot = await getDocs(collection(db, 'users')).catch((e) => {
      result.errors.push('Error reading users collection: ' + e.message);
      return { empty: true, docs: [] };
    });

    for (const userDoc of usersSnapshot.docs) {
      const uId = userDoc.id;
      const uData = userDoc.data();
      result.users.push({ id: uId, email: uData.email, displayName: uData.displayName });

      // Check subcollection users/{uId}/integrations/gmail
      try {
        const intDoc = await getDoc(doc(db, 'users', uId, 'integrations', 'gmail'));
        if (intDoc.exists()) {
          result.integrationsFound.push({ userId: uId, ...intDoc.data() });
        }
      } catch (e) {
        result.errors.push(`Error checking integration for ${uId}: ${e.message}`);
      }

      // Check subcollection users/{uId}/emails
      try {
        const emailsSnapshot = await getDocs(collection(db, 'users', uId, 'emails'));
        if (!emailsSnapshot.empty) {
          result.emailsFound.push({
            userId: uId,
            count: emailsSnapshot.docs.length,
            sample: emailsSnapshot.docs.map((d) => ({
              id: d.id,
              subject: d.data().subject,
              from: d.data().from,
              fromName: d.data().fromName,
              receivedAt: d.data().receivedAt,
            })),
          });
        }
      } catch (e) {
        result.errors.push(`Error checking emails for ${uId}: ${e.message}`);
      }
    }

    // Also check default_user specifically if not in users
    try {
      const defEmailsSnapshot = await getDocs(collection(db, 'users', 'default_user', 'emails'));
      if (!defEmailsSnapshot.empty && !result.emailsFound.some((e) => e.userId === 'default_user')) {
        result.emailsFound.push({
          userId: 'default_user',
          count: defEmailsSnapshot.docs.length,
          sample: defEmailsSnapshot.docs.map((d) => ({
            id: d.id,
            subject: d.data().subject,
            from: d.data().from,
            fromName: d.data().fromName,
            receivedAt: d.data().receivedAt,
          })),
        });
      }
    } catch (e) {}

    // Check top-level emails collection
    try {
      const topEmails = await getDocs(collection(db, 'emails'));
      if (!topEmails.empty) {
        result.topLevelEmails = {
          count: topEmails.docs.length,
          sample: topEmails.docs.map((d) => ({ id: d.id, subject: d.data().subject, userId: d.data().userId })),
        };
      }
    } catch (e) {}
  } catch (err) {
    result.errors.push('General debug error: ' + err.message);
  }

  return NextResponse.json(result);
}
