import { signOut } from '@/auth';
import { revokeRefreshToken } from '@/lib/auth-store';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (refreshToken) {
        await revokeRefreshToken(refreshToken);
    }

    // NextAuth signOut will clean up the session cookie
    await signOut({ redirect: false });

    const response = NextResponse.json({ message: 'Đăng xuất thành công' });
    response.cookies.delete('refresh_token');

    return response;
}
