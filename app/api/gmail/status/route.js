import { NextResponse } from 'next/server';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({
      connected: false,
      email: null,
      lastSyncedAt: null,
    });
  }

  // Check Firestore users/{userId}/integrations/gmail
  if (isFirebaseConfigured() && db) {
    try {
      const integrationDoc = await getDoc(doc(db, 'users', userId, 'integrations', 'gmail'));
      if (integrationDoc.exists()) {
        const data = integrationDoc.data();
        return NextResponse.json({
          connected: Boolean(data.connected),
          email: data.email || null,
          lastSyncedAt: data.lastSyncedAt || null,
          connectedAt: data.connectedAt || null,
        });
      }
    } catch (e) {
      console.warn('Firestore integration check error:', e);
    }
  }

  // Check user-scoped cookie
  const cookie = request.cookies.get(`mailops_gmail_${userId}`);
  if (cookie) {
    try {
      const parsed = JSON.parse(cookie.value);
      return NextResponse.json({
        connected: Boolean(parsed.connected),
        email: parsed.email || null,
        lastSyncedAt: parsed.lastSyncedAt || null,
        connectedAt: parsed.connectedAt || null,
      });
    } catch (e) {}
  }

  return NextResponse.json({
    connected: false,
    email: null,
    lastSyncedAt: null,
  });
}
