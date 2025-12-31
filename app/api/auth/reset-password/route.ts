
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ message: 'Token và mật khẩu mới là bắt buộc' }, { status: 400 });
        }

        // Verify token
        const result = await query(
            'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
            [token]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 400 });
        }

        const record = result.rows[0];
        const email = record.email;

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        await query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

        // Delete token
        await query('DELETE FROM password_reset_tokens WHERE email = $1', [email]);

        return NextResponse.json({ message: 'Đặt lại mật khẩu thành công' });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ message: 'Lỗi hệ thống' }, { status: 500 });
    }
}
