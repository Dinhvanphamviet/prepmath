import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login', // Trang login custom của bạn (nếu có)
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; 
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
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id;
                token.role = (user as any).role;
            }

            // Support updating session manually
            if (trigger === "update" && session) {
                token = { ...token, ...session };
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
