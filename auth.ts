import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '@/lib/definitions';

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
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = LoginSchema.safeParse(credentials);

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data;
                    const user = await getUser(username);
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        // Return user object for JWT callback
                        return {
                            id: user.id,
                            name: user.full_name,
                            email: user.email,
                            role: user.role, // Custom field
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
