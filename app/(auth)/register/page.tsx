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
import { signIn } from 'next-auth/react';

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

    const [successMessage, setSuccessMessage] = useState('');

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
                    if (data.requireVerification) {
                        setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.');
                    } else {
                        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
                        router.push('/login');
                    }
                } else {
                    if (data.errors) {
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

    if (successMessage) {
        return (
            <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
                <div className="hidden lg:block relative h-full w-full">
                    <img
                        src="/hero3.gif"
                        alt="Hero"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </div>
                <div className="flex items-center justify-center py-10 px-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center font-game text-green-600">Kiểm tra Email</CardTitle>
                            <CardDescription className="text-center font-game text-lg mt-4">
                                {successMessage}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-center">
                            <Button onClick={() => router.push('/login')} className="font-game">
                                Quay lại đăng nhập
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            <div className="hidden lg:block relative h-full w-full">
                <img
                    src="/hero3.gif"
                    alt="Hero"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
            <div className="flex items-center justify-center py-10 px-4">
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
                                            <FormLabel className="font-game text-xl">Email (*)</FormLabel>
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
                                    Đăng ký bằng Google
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
            </div>

        </div>
    );
}
