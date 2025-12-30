import { signIn } from '@/auth';
import { NextResponse } from 'next/server';
import { AuthError } from 'next-auth';
import { createRefreshToken, revokeAllUserRefreshTokens } from '@/lib/auth-store';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body;

        // 1. Authenticate with NextAuth Credentials provider
        const result = await signIn('credentials', {
            redirect: false,
            username,
            password,
        });

        if (result?.error) {
            return NextResponse.json({ message: 'Đăng nhập thất bại' }, { status: 401 });
        }

        // Note: In NextAuth v5 stateless JWT mode, `signIn` might not return the user object directly if redirect is false.
        // However, since we authenticated successfully (no throw/error), we proceed to manage Refresh Token.

        // We need the User ID. Since signIn doesn't easily return it in this flow without session, 
        // let's fetch the user again to generate the Refresh Token.
        // Optimization: We could move this logic into the `signIn` callback in auth.config.ts if we wanted to attach it to the cookie there,
        // but the requirement asks for API structure.

        const userRes = await query('SELECT id FROM users WHERE username = $1', [username]);
        const user = userRes.rows[0];

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // 2. Refresh Token Logic
        // Revoke old tokens (Single Session Rule: "giới hạn 1 user = 1 session")
        await revokeAllUserRefreshTokens(user.id);

        // Create new Refresh Token
        const refreshToken = await createRefreshToken(user.id);

        // 3. Set Refresh Token HTTP Cookie (or return in body? Requirement says "JWT lưu trong cookie", implies Access Token. 
        // Usually Refresh Token is ALSO in cookie for security, or body for mobile. Let's start with Cookie for security.)
        // However, requirement 4 says "JWT payload chỉ chứa userId, role".
        // Requirement 5 says "Refresh token (15 phút)".

        // Let's attach Refresh Token as a cookie manually here since NextAuth handles the Session Token (JWT).
        const response = NextResponse.json({ message: 'Đăng nhập thành công' });

        response.cookies.set('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
        });

        return response;

    } catch (error) {
        if (error instanceof AuthError) {
            if (error.type === 'CredentialsSignin') {
                return NextResponse.json({ message: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 });
            }
            return NextResponse.json({ message: 'Lỗi xác thực' }, { status: 500 });
        }
        console.error(error);
        return NextResponse.json({ message: 'Lỗi hệ thống' }, { status: 500 });
    }
}
