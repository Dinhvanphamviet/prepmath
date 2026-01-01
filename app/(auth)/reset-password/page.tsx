
'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Suspense, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

const ResetPasswordSchema = z.object({
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    confirmPassword: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    function onSubmit(values: z.infer<typeof ResetPasswordSchema>) {
        if (!token) {
            toast.error("Token không hợp lệ");
            return;
        }

        startTransition(async () => {
            try {
                const res = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    body: JSON.stringify({ token, password: values.password }),
                    headers: { 'Content-Type': 'application/json' },
                });

                const data = await res.json();

                if (res.ok) {
                    toast.success(data.message);
                    router.push('/login');
                } else {
                    toast.error(data.message || 'Có lỗi xảy ra');
                }
            } catch (error) {
                toast.error('Lỗi kết nối');
            }
        });
    }

    if (!token) {
        return (
            <div className="flex h-screen w-full items-center justify-center px-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-center text-red-500 font-game">Lỗi Link</CardTitle>
                        <CardDescription className="text-center font-game">Link đặt lại mật khẩu không hợp lệ hoặc bị thiếu.</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline font-game">
                            Yêu cầu link mới
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center font-game text-primary">Đặt lại mật khẩu</CardTitle>
                    <CardDescription className="text-center font-game">
                        Nhập mật khẩu mới của bạn
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-game">Mật khẩu mới</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-game">Xác nhận mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full mt-4 font-game" disabled={isPending}>
                                {isPending ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center">
                <div className="animate-pulse font-game text-primary">Đang tải...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
