import { NextResponse } from 'next/server';
import { RegisterSchema } from '@/lib/definitions';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsedData = RegisterSchema.safeParse(body);

        if (!parsedData.success) {
            return NextResponse.json(
                { message: 'Dữ liệu không hợp lệ', errors: parsedData.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { username, password, full_name, email, phone, address, date_of_birth, role } = parsedData.data;

        // Check if username exists
        const existingUser = await query('SELECT id FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return NextResponse.json({ message: 'Tên đăng nhập đã tồn tại' }, { status: 409 });
        }

        // Check if email exists
        const existingEmail = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingEmail.rows.length > 0) {
            return NextResponse.json({ message: 'Email đã tồn tại' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Force role to 'student' if not specified or trying to be 'teacher' via public API (logic tweak from request: "Không cho học sinh tự chọn role")
        // In schema validation we allowed it but here we can enforce strictly if this is the PUBLIC register endpoint.
        // Assuming this is public registration for students:
        const finalRole = 'student';

        const safeDateOfBirth = date_of_birth === '' ? null : date_of_birth;

        await query(
            `INSERT INTO users (username, password, role, full_name, email, phone, address, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [username, hashedPassword, finalRole, full_name, email, phone, address, safeDateOfBirth]
        );

        return NextResponse.json({ message: 'Đăng ký thành công' }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
    }
}
