import { NextResponse } from 'next/server';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required to disconnect Gmail.',
      }, { status: 400 });
    }

    // 1. Delete Firestore integration document users/{userId}/integrations/gmail
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'integrations', 'gmail'));
      } catch (e) {
        console.warn('Firestore integration deletion error:', e);
      }

      // 2. Delete all synchronized emails in users/{userId}/emails
      try {
        const emailsRef = collection(db, 'users', userId, 'emails');
        const snapshot = await getDocs(emailsRef);
        for (const d of snapshot.docs) {
          await deleteDoc(doc(db, 'users', userId, 'emails', d.id));
        }
      } catch (e) {
        console.warn('Firestore emails collection deletion error:', e);
      }
    }

    // 3. Clear server in-memory cache for this user
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
      await fetch(`${appUrl}/api/gmail/sync?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Server cache clear notice:', e);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Gmail disconnected and email pipeline cleared successfully',
    });

    // 4. Clear user-scoped auth cookie
    response.cookies.delete(`mailops_gmail_${userId}`);

    return response;
  } catch (error) {
    console.error('Gmail disconnect error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
