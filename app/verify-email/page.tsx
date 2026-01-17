
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';


function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Đang xác thực...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token không hợp lệ hoặc bị thiếu.');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    body: JSON.stringify({ token }),
                    headers: { 'Content-Type': 'application/json' },
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage('Xác thực tài khoản thành công!');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Xác thực thất bại.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Lỗi kết nối máy chủ.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className={`text-2xl font-bold text-center ${status === 'error' ? 'text-destructive' : 'text-primary'}`}>
                        {status === 'loading' ? 'Đang xác thực...' : status === 'success' ? 'Thành công' : 'Lỗi'}
                    </CardTitle>
                    <CardDescription className="text-center text-base mt-2">
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    {status === 'success' && (
                        <Button onClick={() => router.push('/login')} className="w-full">
                            Đăng nhập ngay
                        </Button>
                    )}
                    {status === 'error' && (
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Đăng ký lại
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center">
                <div className="animate-pulse text-primary font-medium">Đang tải...</div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
