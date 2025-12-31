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
import { signIn } from 'next-auth/react';

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
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">

            <div className="flex items-center justify-center py-10 px-4">
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
                                <div className="flex justify-end">
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:underline font-game"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <Button type="submit" className="w-full mt-6 font-game text-2xl py-6" disabled={isPending}>
                                    {isPending ? 'Đang xử lý...' : 'Đăng nhập'}
                                </Button>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground font-game">
                                            Hoặc
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full font-game"
                                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                                >
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                    Đăng nhập bằng Google
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
            <div className="hidden lg:block relative h-full w-full">
                <img
                    src="/hero3.gif"
                    alt="Hero"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
        </div>
    );
}
