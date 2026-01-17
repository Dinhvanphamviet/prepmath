import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Zap, ArrowRight, Star } from 'lucide-react';
import { query } from '@/lib/db';

export default async function Features() {
    // 1. Fetch real courses from database
    const { rows: courses } = await query(
        `SELECT c.id, c.title, c.description,
         (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) as student_count
         FROM courses c
         WHERE c.is_published = TRUE
         ORDER BY c.created_at DESC
         LIMIT 6`
    );

    // 2. Helper for UI styles (cycling through a "palette")
    const getStyle = (index: number) => {
        const styles = [
            { color: "bg-blue-100", icon: <BookOpen className="w-8 h-8 text-blue-600" />, delay: "delay-100" },
            { color: "bg-emerald-100", icon: <Brain className="w-8 h-8 text-emerald-600" />, delay: "delay-200" },
            { color: "bg-purple-100", icon: <Zap className="w-8 h-8 text-purple-600" />, delay: "delay-300" },
            { color: "bg-orange-100", icon: <Star className="w-8 h-8 text-orange-600" />, delay: "delay-100" },
            { color: "bg-pink-100", icon: <BookOpen className="w-8 h-8 text-pink-600" />, delay: "delay-200" },
            { color: "bg-cyan-100", icon: <Brain className="w-8 h-8 text-cyan-600" />, delay: "delay-300" },
        ];
        return styles[index % styles.length];
    };

    return (
        <section id="courses" className="py-24 px-4 bg-background relative z-10">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <span className="text-secondary dark:text-blue-400 font-bold tracking-wider uppercase text-sm">Danh Mục Khóa Học</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Khóa Học <span className="text-primary">Nổi Bật</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Chọn khóa học phù hợp với mục tiêu của bạn.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {courses.length > 0 ? (
                        courses.map((course: any, index: number) => {
                            const style = getStyle(index);
                            return (
                                <div
                                    key={course.id}
                                    className={`clay-card group p-8 space-y-6 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden ${style.delay}`}
                                >
                                    <div className={`p-4 rounded-2xl w-fit ${style.color} shadow-inner`}>
                                        {style.icon}
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 min-h-[4rem]">
                                            {course.title}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 min-h-[4.5rem]">
                                            {course.description || "Khóa học chất lượng cao dành cho học sinh THPT."}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span>5.0</span>
                                        </div>
                                        <div>•</div>
                                        <div>{course.student_count || 0} Học viên</div>
                                    </div>

                                    <div className="pt-4 w-full mt-auto">
                                        <Link href="/login" className="block w-full">
                                            <Button className="w-full clay-button bg-white text-slate-900 hover:bg-gray-50 border border-gray-200 justify-between group-hover:border-primary/50 transition-colors">
                                                Đăng ký ngay
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-3 text-center py-12 text-muted-foreground">
                            Chưa có khóa học nào được xuất bản.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
