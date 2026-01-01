import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAuth = nextUrl.pathname.startsWith('/api/auth');
            if (isOnAuth) return true; // Always allow auth routes

            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard'); // Or any other protected student route

            if (isOnAdmin) {
                if (isLoggedIn && auth.user?.role === 'teacher') return true;
                return false; // Redirect unauthenticated or unauthorized to login (or 404/403 if handled by Pages)
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated to login
            }

            return true;
        },
        async session({ session, token }) {
            // Add userId and role to session from token
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                session.user.role = token.role as "student" | "teacher";
            }
            if (token.image && session.user) {
                session.user.image = token.image as string;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id;
                token.role = (user as any).role;
                token.image = user.image || (user as any).picture;
            }

            // Support updating session manually
            if (trigger === "update" && session) {
                if (session?.user?.image) {
                    token.image = session.user.image;
                }
            }

            return token;
        },
    },
    providers: [],
    session: {
        strategy: 'jwt',
        maxAge: 60 * 60,
    },
} satisfies NextAuthConfig;
