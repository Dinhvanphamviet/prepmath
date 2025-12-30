'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/lib/definitions';
import { z } from 'zod';
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
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof LoginSchema>) {
        startTransition(async () => {
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: { 'Content-Type': 'application/json' },
                });

                const data = await res.json();

                if (res.ok) {
                    toast.success('Đăng nhập thành công');
                    router.push('/');
                    router.refresh();
                } else {
                    toast.error(data.message || 'Có lỗi xảy ra');
                }
            } catch (error) {
                toast.error('Lỗi kết nối máy chủ');
            }
        });
    }

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold text-center font-game text-primary">Đăng nhập</CardTitle>
                    <CardDescription className="text-center font-game text-lg">
                        Nhập thông tin đăng nhập của bạn để truy cập hệ thống
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-game text-xl">Tên đăng nhập</FormLabel>
                                        <FormControl>
                                            <Input placeholder="hocsinh123" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-game text-xl">Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full mt-6 font-game text-2xl py-6" disabled={isPending}>
                                {isPending ? 'Đang xử lý...' : 'Đăng nhập'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-base text-muted-foreground font-game">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="text-primary hover:underline font-game">
                            Đăng ký ngay
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
