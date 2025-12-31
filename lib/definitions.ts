import { z } from 'zod';

export const UserRole = z.enum(['student', 'teacher']);

export const RegisterSchema = z.object({
    username: z.string().min(3, { message: 'Username phải có ít nhất 3 ký tự' }),
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    full_name: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
    email: z.string().email({ message: 'Email không hợp lệ' }),
    phone: z.string().regex(/^[0-9]+$/, { message: 'Số điện thoại chỉ được chứa số' }).optional().or(z.literal('')),
    address: z.string().optional(),
    date_of_birth: z.string().optional(), // YYYY-MM-DD
    role: UserRole,
});

export const LoginSchema = z.object({
    username: z.string().min(1, { message: 'Vui lòng nhập Username' }),
    password: z.string().min(1, { message: 'Vui lòng nhập Mật khẩu' }),
});

export const UpdateUserSchema = z.object({
    full_name: z.string().min(2).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().regex(/^[0-9]+$/).optional().or(z.literal('')),
    address: z.string().optional(),
    date_of_birth: z.string().optional(),
});

export type User = {
    id: string;
    username: string;
    role: 'student' | 'teacher';
    full_name?: string;
    email?: string;
    // ... other fields
};

export type SessionPayload = {
    userId: string;
    role: 'student' | 'teacher';
    expiresAt: Date;
};
