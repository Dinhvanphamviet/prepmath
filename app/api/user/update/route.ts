import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UpdateUserSchema } from '@/lib/definitions';
import { query } from '@/lib/db';

export async function PATCH(req: Request) {
    try {
        const session = await auth();

        // 1. Check Authentication
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await req.json();

        // 2. Validate Input
        const parsedData = UpdateUserSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json(
                { message: 'Dữ liệu không hợp lệ', errors: parsedData.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { full_name, email, phone, address, date_of_birth } = parsedData.data;

        // 3. Update User (Only specific fields allowed)
        // Dynamic query construction is safer to avoid overwriting with nulls if not provided, 
        // but here we know Zod structure. Let's build a simple dynamic set.

        // Simplification: We update all provided fields. 
        // If a field is undefined in parsedData, we shouldn't wipe it out. 
        // However, my Zod schema uses .optional(), so undefined means "do not update".

        const fieldsToUpdate = [];
        const values = [];
        let queryIndex = 1;

        if (full_name !== undefined) {
            fieldsToUpdate.push(`full_name = $${queryIndex++}`);
            values.push(full_name);
        }
        if (email !== undefined) {
            // Optional: Check email uniqueness if changing email
            fieldsToUpdate.push(`email = $${queryIndex++}`);
            values.push(email);
        }
        if (phone !== undefined) {
            fieldsToUpdate.push(`phone = $${queryIndex++}`);
            values.push(phone);
        }
        if (address !== undefined) {
            fieldsToUpdate.push(`address = $${queryIndex++}`);
            values.push(address);
        }
        if (date_of_birth !== undefined) {
            fieldsToUpdate.push(`date_of_birth = $${queryIndex++}`);
            values.push(date_of_birth);
        }

        if (fieldsToUpdate.length === 0) {
            return NextResponse.json({ message: 'Không có dữ liệu nào để cập nhật' }, { status: 400 });
        }

        values.push(userId); // Add userId as last param

        const updateQuery = `
        UPDATE users 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id = $${queryIndex}
        RETURNING id, full_name, email, phone, address, date_of_birth
    `;

        const result = await query(updateQuery, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Cập nhật thành công',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
    }
}
