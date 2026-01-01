"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseCard } from "@/components/courses/course-card";
import { JoinCourseDialog } from "@/components/courses/join-course-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PixelLoading, PixelError, PixelCardSkeleton, PixelEmptyState } from "@/components/ui/pixel-states";

export default function DashboardPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCourses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/courses/catalog');
            if (!res.ok) {
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error('Không thể tải danh sách khóa học');
            }
            const data = await res.json();
            setCourses(data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Grouping Logic
    const levelMap: Record<string, string> = {
        '9': 'LỘ TRÌNH LUYỆN THI DÀNH CHO LỚP 9',
        '12': 'LỘ TRÌNH LUYỆN THI DÀNH CHO LỚP 12',
        '11': 'LỘ TRÌNH LUYỆN THI DÀNH CHO LỚP 11',
        '10': 'LỘ TRÌNH LUYỆN THI DÀNH CHO LỚP 10',
        'HSA': 'LUYỆN THI ĐÁNH GIÁ NĂNG LỰC (HSA/TSA)',
        'other': 'CÁC KHÓA HỌC KHÁC'
    };

    const getLevelKey = (lvl: string) => {
        if (!lvl) return 'other';
        const norm = lvl.toUpperCase();
        if (['12', '11', '10', '9', 'HSA'].includes(norm)) return norm;
        return 'other';
    };

    // Filter courses based on search query
    const filteredCourses = courses.filter(course => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            course.title?.toLowerCase().includes(query) ||
            course.description?.toLowerCase().includes(query) ||
            course.category?.toLowerCase().includes(query)
        );
    });

    // Group filtered courses by level
    const grouped: Record<string, any[]> = {
        '9': [], '12': [], '11': [], '10': [], 'HSA': [], 'other': []
    };

    filteredCourses.forEach(course => {
        const key = getLevelKey(course.level);
        grouped[key].push(course);
    });

    const CourseSection = ({ levelKey, title }: { levelKey: string, title: string }) => {
        const items = grouped[levelKey];
        if (items.length === 0) return null;

        return (
            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-center relative">
                    <h3 className="text-2xl font-bold font-game uppercase text-center text-blue-700 dark:text-blue-400 pb-2 border-b-4 border-blue-600 inline-block">
                        {title}
                    </h3>
                    <div className="absolute inset-x-0 bottom-0 border-b border-gray-200 -z-10 bg-transparent"></div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((course: any) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                        />
                    ))}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-8 pt-6">
                <div className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight font-game">Tất cả các khóa học</h2>
                        <p className="text-muted-foreground">
                            Khám phá các khóa học và bắt đầu hành trình chinh phục tri thức.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <PixelCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <PixelError
                    title="Oops!"
                    message={error}
                    onRetry={fetchCourses}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-game">Tất cả các khóa học</h2>
                    <p className="text-muted-foreground">
                        Khám phá các khóa học và bắt đầu hành trình chinh phục tri thức.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <JoinCourseDialog />
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Course Sections */}
            <div className="space-y-12 pb-10">
                {searchQuery.trim() ? (
                    // Show all filtered results when searching
                    filteredCourses.length > 0 ? (
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-center relative">
                                <h3 className="text-2xl font-bold font-game uppercase text-center text-blue-700 dark:text-blue-400 pb-2 border-b-4 border-blue-600 inline-block">
                                    Kết quả tìm kiếm ({filteredCourses.length})
                                </h3>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredCourses.map((course: any) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <PixelEmptyState
                            icon="🔍"
                            title="Không tìm thấy"
                            message={`Không có khóa học nào phù hợp với "${searchQuery}"`}
                        />
                    )
                ) : (
                    // Show grouped by level when not searching
                    <>
                        <CourseSection levelKey="9" title={levelMap['9']} />
                        <CourseSection levelKey="12" title={levelMap['12']} />
                        <CourseSection levelKey="11" title={levelMap['11']} />
                        <CourseSection levelKey="10" title={levelMap['10']} />
                        <CourseSection levelKey="HSA" title={levelMap['HSA']} />
                        <CourseSection levelKey="other" title={levelMap['other']} />

                        {courses.length === 0 && (
                            <PixelEmptyState
                                icon="📚"
                                title="Chưa có khóa học"
                                message="Chưa có khóa học nào được xuất bản. Hãy quay lại sau nhé!"
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
