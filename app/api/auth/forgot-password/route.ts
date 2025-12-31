
import { query } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ message: 'Email là bắt buộc' }, { status: 400 });
        }

        // Check if user exists
        const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rowCount === 0) {
            return NextResponse.json({ message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.' });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        await query('DELETE FROM password_reset_tokens WHERE email = $1', [email]);

        await query(
            'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
            [email, token, expiresAt]
        );

        // Send email
        const sent = await sendPasswordResetEmail(email, token);

        if (sent) {
            return NextResponse.json({ message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.' });
        } else {
            return NextResponse.json({ message: 'Lỗi gửi email' }, { status: 500 });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ message: 'Lỗi hệ thống' }, { status: 500 });
    }
}
