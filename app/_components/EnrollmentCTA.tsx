"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EnrollmentCTA() {
    return (
        <section className="py-24 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="bg-primary rounded-3xl shadow-[8px_8px_16px_0px_rgba(0,0,0,0.2),-4px_-4px_12px_0px_rgba(255,255,255,0.3)] p-12 md:p-20 text-center space-y-8 relative overflow-hidden border border-white/20">
                    {/* Background Decoration */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>

                    <h2 className="text-4xl md:text-6xl font-extrabold text-white relative z-10 text-shadow-clay">
                        Sẵn Sàng Chinh Phục Kỳ Thi?
                    </h2>
                    <p className="text-xl text-green-50 max-w-2xl mx-auto relative z-10 font-medium">
                        Tham gia cộng đồng học tập ngay hôm nay. Truy cập không giới hạn các bài kiểm tra, theo dõi tiến độ và niềm vui học tập!
                    </p>

                    <div className="relative z-10">
                        <Link href="/login">
                            <Button className="clay-button bg-[#F97316] text-white hover:bg-[#EA580C] text-xl md:text-2xl px-8 py-6 md:px-12 md:py-10 font-extrabold shadow-xl hover:scale-105 transition-transform w-full md:w-auto break-words whitespace-normal h-auto">
                                Tham Gia Miễn Phí Ngay!
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
