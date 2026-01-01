import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '@/lib/definitions';
import crypto from 'crypto';

// Hàm helper để lầy user từ DB
async function getUser(username: string) {
    try {
        const result = await query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

async function getUserById(id: string) {
    try {
        const result = await query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Failed to fetch user by id:', error);
        return null;
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = LoginSchema.safeParse(credentials);

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data;
                    const user = await getUser(username);
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        // Check if email is verified
                        if (!user.email_verified) {
                            console.log('Email not verified');
                            return null;
                        }

                        // Return user object for JWT callback
                        return {
                            id: user.id,
                            name: user.full_name,
                            email: user.email,
                            role: user.role,
                            image: user.image,
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                // For Google login, user.id is Google ID, but we need DB UUID.
                // Fetch user from DB by email to get real UUID.
                if (user.email) {
                    const dbUserRes = await query('SELECT * FROM users WHERE email = $1', [user.email]);
                    const dbUser = dbUserRes.rows[0];
                    if (dbUser) {
                        token.sub = dbUser.id;
                        token.role = dbUser.role;
                        token.image = dbUser.image;
                        token.name = dbUser.full_name;
                        token.email = dbUser.email;
                    }
                }
            }

            // Subsequent requests: fetch fresh data from DB using the UUID we (hopefully) set above
            if (token.sub) {
                // Ensure token.sub is a valid UUID before querying to avoid "invalid input syntax" errors
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token.sub);

                if (isUuid) {
                    const existingUser = await getUserById(token.sub);
                    if (existingUser) {
                        token.image = existingUser.image;
                        token.role = existingUser.role;
                        token.name = existingUser.full_name;
                        token.email = existingUser.email;
                    }
                }
            }

            // Allow manual update override if needed (though DB fetch above supersedes this mostly)
            if (trigger === "update" && session) {
                if (session?.user?.image) {
                    token.image = session.user.image;
                }
            }

            return token;
        },
        async signIn({ user, account, profile }) {
            console.log("SignIn Callback Triggered", { provider: account?.provider, email: user.email });

            // Allow OAuth without email verification check (we verify it here)
            if (account?.provider === 'google') {
                if (!user.email) {
                    console.error("Google SignIn: No email provided");
                    return false;
                }

                try {
                    // Check if user exists
                    const existingUserRes = await query('SELECT * FROM users WHERE email = $1', [user.email]);
                    const existingUser = existingUserRes.rows[0];

                    if (existingUser) {
                        // If user exists but unverified, verify them (since Google is trusted)
                        if (!existingUser.email_verified) {
                            await query('UPDATE users SET email_verified = NOW() WHERE email = $1', [user.email]);
                        }
                        // Update image if missing in DB
                        if (!existingUser.image && user.image) {
                            await query('UPDATE users SET image = $1 WHERE email = $2', [user.image, user.email]);
                        }
                        return true;
                    }

                    console.log("Google SignIn: Creating new user for", user.email);

                    // Create new user
                    // Generate a random password (user can't use it, must use Google or reset)
                    const randomPassword = crypto.randomBytes(16).toString('hex');
                    const hashedPassword = await bcrypt.hash(randomPassword, 10);

                    // Generate username from email + random suffix to avoid collision
                    let username = user.email.split('@')[0];
                    const checkUsername = await query('SELECT id FROM users WHERE username = $1', [username]);
                    if (checkUsername.rows.length > 0) {
                        username += '_' + crypto.randomBytes(4).toString('hex');
                    }

                    await query(
                        `INSERT INTO users (username, password, role, full_name, email, image, email_verified, created_at, updated_at)
                         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())`,
                        [username, hashedPassword, 'student', user.name, user.email, user.image]
                    );

                    console.log("Google SignIn: User created successfully");
                    return true;

                } catch (error: any) {
                    console.error("Error during Google Signin:", error);
                    // Redirect to login with custom error query param
                    return `/login?error=DatabaseCreationError&details=${encodeURIComponent(error.message)}`;
                }
            }

            // Allow default for Credentials (managed by authorize/middleware config)
            return true;
        },
    }
});

