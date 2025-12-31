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

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        async signIn({ user, account, profile }) {
            // Allow OAuth without email verification check (we verify it here)
            if (account?.provider === 'google') {
                if (!user.email) return false;

                try {
                    // Check if user exists
                    const existingUserRes = await query('SELECT * FROM users WHERE email = $1', [user.email]);
                    const existingUser = existingUserRes.rows[0];

                    if (existingUser) {
                        // If user exists but unverified, verify them (since Google is trusted)
                        if (!existingUser.email_verified) {
                            await query('UPDATE users SET email_verified = NOW() WHERE email = $1', [user.email]);
                        }
                        return true;
                    }

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
                        `INSERT INTO users (username, password, role, full_name, email, email_verified, created_at, updated_at)
                         VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())`,
                        [username, hashedPassword, 'student', user.name, user.email]
                    );

                    return true;

                } catch (error) {
                    console.error("Error during Google Signin:", error);
                    return false;
                }
            }

            // Allow default for Credentials (managed by authorize/middleware config)
            return true;
        },
    }
});

