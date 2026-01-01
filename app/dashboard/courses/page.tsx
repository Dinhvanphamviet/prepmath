import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { CourseCard } from "@/components/courses/course-card";

import { JoinCourseDialog } from "@/components/courses/join-course-dialog";
import { Separator } from "@/components/ui/separator";

export default async function CoursesPage() {
    const session = await auth();

    if (!session?.user) {
        return redirect("/login");
    }

    const isTeacher = session.user.role === "teacher";
    let courses = [];

    try {
        if (isTeacher) {
            // Teacher sees courses they created
            const result = await query(
                `SELECT c.*, u.full_name as teacher_name 
                 FROM courses c
                 JOIN users u ON c.teacher_id = u.id
                 WHERE teacher_id = $1 
                 ORDER BY created_at DESC`,
                [session.user.id]
            );
            courses = result.rows;
        } else {
            // Student sees enrolled courses
            const result = await query(
                `SELECT c.*, ce.status as enrollment_status, ce.progress, u.full_name as teacher_name
            FROM courses c
            JOIN course_enrollments ce ON c.id = ce.course_id
            JOIN users u ON c.teacher_id = u.id
            WHERE ce.student_id = $1 AND ce.status = 'active'
            ORDER BY ce.enrolled_at DESC`,
                [session.user.id]
            );
            courses = result.rows;
        }
    } catch (error) {
        console.error("Failed to fetch courses", error);
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-game">Khóa học của tôi</h2>
                    <p className="text-muted-foreground">
                        {isTeacher
                            ? "Quản lý và tạo mới các khóa học của bạn."
                            : "Danh sách các khóa học bạn đã đăng ký."}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {!isTeacher && <JoinCourseDialog />}

                </div>
            </div>
            <Separator />

            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Chưa có khóa học nào</h3>
                    <p className="text-muted-foreground mb-4">
                        {isTeacher
                            ? "Bắt đầu bằng cách tạo khóa học đầu tiên của bạn."
                            : "Bạn chưa đăng ký khóa học nào. Hãy nhập mã để tham gia."}
                    </p>

                    {!isTeacher && <JoinCourseDialog />}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {courses.map((course: any) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isTeacher={isTeacher}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
