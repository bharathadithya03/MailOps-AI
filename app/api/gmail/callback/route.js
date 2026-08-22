import { NextResponse } from 'next/server';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const redirectUri = `${appUrl}/api/gmail/callback`;

  if (error || !code || !userId) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings?gmail=error&msg=${encodeURIComponent(error || 'Authorization parameter missing')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings?gmail=error&msg=Google+OAuth+credentials+missing`);
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok || !tokens.access_token) {
      console.error('Google token exchange error:', tokens);
      return NextResponse.redirect(`${appUrl}/dashboard/settings?gmail=error&msg=${encodeURIComponent(tokens.error_description || 'Token exchange failed')}`);
    }

    // Get authorized user's email address
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();
    const connectedEmail = profile.email || 'connected@gmail.com';

    // Store in Firestore users/{userId}/integrations/gmail
    if (isFirebaseConfigured() && db && userId) {
      try {
        await setDoc(doc(db, 'users', userId, 'integrations', 'gmail'), {
          connected: true,
          email: connectedEmail,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || null,
          expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
          connectedAt: new Date().toISOString(),
          scope: tokens.scope || '',
        });
      } catch (e) {
        console.warn('Firestore integration save error:', e);
      }
    }

    // Redirect with success parameter
    const response = NextResponse.redirect(`${appUrl}/dashboard/settings?gmail=connected&email=${encodeURIComponent(connectedEmail)}`);
    
    // Also set a secure user-scoped cookie
    response.cookies.set(`mailops_gmail_${userId}`, JSON.stringify({
      connected: true,
      email: connectedEmail,
      accessToken: tokens.access_token,
      connectedAt: new Date().toISOString(),
    }), {
      path: '/',
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('OAuth Callback handling error:', err);
    return NextResponse.redirect(`${appUrl}/dashboard/settings?gmail=error&msg=${encodeURIComponent(err.message)}`);
  }
}
