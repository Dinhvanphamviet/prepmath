
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
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';

const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
});

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    function onSubmit(values: z.infer<typeof ForgotPasswordSchema>) {
        startTransition(async () => {
            try {
                const res = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: { 'Content-Type': 'application/json' },
                });

                const data = await res.json();

                if (res.ok) {
                    toast.success(data.message);
                } else {
                    toast.error(data.message || 'Có lỗi xảy ra');
                }
            } catch (error) {
                toast.error('Lỗi kết nối');
            }
        });
    }

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            <div className="hidden lg:block relative h-full w-full">
                <img
                    src="/hero6.gif"
                    alt="Hero"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
            <div className="flex items-center justify-center py-10 px-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center font-game text-primary">Quên mật khẩu</CardTitle>
                        <CardDescription className="text-center font-game">
                            Nhập email của bạn để nhận link đặt lại mật khẩu
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-game">Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="email@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full mt-4 font-game" disabled={isPending}>
                                    {isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link href="/login" className="text-sm text-primary hover:underline font-game">
                            Quay lại đăng nhập
                        </Link>
                    </CardFooter>
                </Card>
            </div>

        </div>
    );
}
