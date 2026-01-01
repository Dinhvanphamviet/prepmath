"use client";

import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface CourseCardProps {
    course: any;
    isTeacher?: boolean;
}

export function CourseCard({ course, isTeacher }: CourseCardProps) {
    const isEnrolled = course.enrollment_status === 'active';
    const href = `/dashboard/courses/${course.id}`;
    const router = useRouter();

    const handleCardClick = () => {
        router.push(href);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md h-full hover:ring-2 hover:ring-primary/20 cursor-pointer"
        >
            {/* 1. Image Area (Top) */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                {course.thumbnail_url ? (
                    <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={course.thumbnail_url?.includes('.gif')}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-teal-400">
                        <span className="text-4xl font-bold text-white/50">{course.title.charAt(0)}</span>
                    </div>
                )}
            </div>

            {/* 2. Content Area (Bottom) */}
            <div className="flex flex-1 flex-col justify-between p-4 bg-white dark:bg-card">
                <div className="space-y-3">
                    <div className="block">
                        <h3 className="line-clamp-2 text-xl md:text-2xl font-bold font-game text-blue-600 dark:text-blue-400 uppercase leading-snug min-h-[3.5rem]">
                            {course.title}
                        </h3>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Giáo viên: <span className="font-medium text-foreground">{course.teacher_name || "Unknown"}</span>
                    </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    {/* Progress for enrolled students */}
                    {!isTeacher && isEnrolled ? (
                        <div className="flex-1 mr-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <span>Đã học {course.progress || 0}%</span>
                            </div>
                            <Progress value={course.progress || 0} className="h-1.5" />
                        </div>
                    ) : <div />}

                    {/* Visual Button - Always "Xem thêm" */}
                    <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 font-game bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80">
                        Xem thêm
                    </div>
                </div>
            </div>
        </div>
    );
}
