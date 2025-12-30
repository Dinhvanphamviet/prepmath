import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

export default NextAuth(authConfig).auth;

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

// Note: NextAuth middleware handles session extension automatically.
// For the custom "Refresh Token in DB" requirement:
// 1. The main session is stateless JWT (1 hour).
// 2. If JWT is expired, Auth.js might clear session.
// 3. To "auto-resume" session using the HTTP-only Refresh Token (15 mins inactive limit), we would ideally:
//    - Intercept requests here.
//    - If Session is invalid BUT Refresh Token cookie exists:
//      -> Verify Refresh Token in DB (this requires Edge-compatible DB adapter or direct fetch if allowed).
//      -> If valid, we allow through? No, Middleware can't easily "log them in" and set a new JWT without a roundtrip.
// Approach: The user hits an endpoint, gets 401. Client (frontend) sees 401, calls /api/auth/refresh (or login) to swap REFRESH TOKEN for NEW ACCESS TOKEN?
// BUT Requirement 2 says "JWT Session (stateless)".
// Requirement 5 says "Refresh token (15 mins) to... logout cưỡng bức...".

// Implementation Clarification:
// The "Refresh Token" mechanism usually works alongside Short-Lived Access Tokens.
// If NextAuth session (Access Token) expires, the Client (Provider) usually handles rotation.
// However, since we used a Custom Refresh Token flow in `login` API (manually setting cookie),
// The client-side code would need to handle the re-auth.
// Since I am only assigned "Module Authentication" and APIs, I provided the backend primitives.
// The Middleware here primarily protects routes based on the *current* Access Token status.
