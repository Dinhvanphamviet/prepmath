"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Target, TrendingUp } from 'lucide-react';

export default function ProgressDemo() {
    return (
        <section className="py-24 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <span className="px-4 py-2 rounded-full bg-accent text-accent-foreground font-bold text-sm shadow-sm inline-block">
                        📈 Theo Dõi Sự Tiến Bộ
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
                        Thấy Kỹ Năng Của Bạn <br />
                        <span className="text-primary">Tăng Vọt!</span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Bảng điều khiển trực quan hóa hành trình học tập. Nhận huy hiệu, giữ chuỗi học tập và chinh phục từng chủ đề một.
                    </p>
                    <Button className="clay-button bg-secondary text-secondary-foreground px-8 py-6 text-lg font-bold">
                        Xem Demo
                    </Button>
                </div>

                <div className="relative clay-card p-8 bg-white dark:bg-slate-950 rotate-2 hover:rotate-0 transition-transform duration-500">
                    {/* Fake Dashboard View */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tiến Độ Của Tôi</h3>
                            <p className="text-slate-500 dark:text-slate-400">Báo Cáo Toán Học Tuần</p>
                        </div>
                        <Trophy className="text-yellow-500 h-10 w-10 animate-bounce" />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
                                <span>Đại Số</span>
                                <span>85%</span>
                            </div>
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[85%] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
                                <span>Giải Tích</span>
                                <span>60%</span>
                            </div>
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-secondary w-[60%] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
                                <span>Hình Học</span>
                                <span>92%</span>
                            </div>
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-accent w-[92%] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="clay-button bg-blue-50 p-4 text-center dark:bg-slate-900 dark:border-slate-800 border border-blue-100">
                            <Target className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                            <div className="font-bold text-blue-700 dark:text-blue-300">Mục Tiêu Ngày</div>
                            <div className="text-xs text-blue-400">Hoàn Thành</div>
                        </div>
                        <div className="clay-button bg-green-50 p-4 text-center dark:bg-slate-900 dark:border-slate-800 border border-green-100">
                            <TrendingUp className="mx-auto h-8 w-8 text-green-500 mb-2" />
                            <div className="font-bold text-green-700 dark:text-green-300">Chuỗi</div>
                            <div className="text-xs text-green-400">12 Ngày 🔥</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
