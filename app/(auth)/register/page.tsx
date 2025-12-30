'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema } from '@/lib/definitions';
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

export default function RegisterPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            username: '',
            password: '',
            full_name: '',
            email: '',
            phone: '',
            address: '',
            date_of_birth: '',
            role: 'student',
        },
    });

    async function onSubmit(values: z.infer<typeof RegisterSchema>) {
        startTransition(async () => {
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: { 'Content-Type': 'application/json' },
                });

                const data = await res.json();

                if (res.ok) {
                    toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
                    router.push('/login');
                } else {
                    // Handle validation errors from API if any
                    if (data.errors) {
                        // Manually set errors if fields match
                        // For simplicity, we just toast the message
                        toast.error(data.message || 'Đăng ký thất bại');
                    } else {
                        toast.error(data.message || 'Đăng ký thất bại');
                    }
                }
            } catch (error) {
                toast.error('Lỗi kết nối máy chủ');
            }
        });
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center py-10 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold text-center font-game text-primary">Đăng ký tài khoản</CardTitle>
                    <CardDescription className="text-center font-game text-lg">
                        Tạo tài khoản mới để bắt đầu thi thử
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
                                        <FormLabel className="font-game text-xl">Tên đăng nhập (*)</FormLabel>
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
                                        <FormLabel className="font-game text-xl">Mật khẩu (*)</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-game text-xl">Họ và tên (*)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nguyễn Văn A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-game text-xl">Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-game text-xl">Số điện thoại</FormLabel>
                                            <FormControl>
                                                <Input placeholder="09xxxxxxx" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date_of_birth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-game text-xl">Ngày sinh</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-game text-xl">Địa chỉ</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Hà Nội, Việt Nam" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full mt-6 font-game text-2xl py-6" disabled={isPending}>
                                {isPending ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-base text-muted-foreground font-game">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-primary hover:underline font-game">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div >
    );
}
