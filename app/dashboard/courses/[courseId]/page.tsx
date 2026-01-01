import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { CourseEditor } from "@/components/courses/course-editor";
import { CourseSyllabus } from "@/components/courses/course-syllabus";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();

    if (!session?.user) {
        return redirect("/login");
    }

    const { courseId } = await params;

    // Fetch course details
    const courseResult = await query(
        `SELECT * FROM courses WHERE id = $1`,
        [courseId]
    );

    if (courseResult.rows.length === 0) {
        return redirect("/dashboard/courses");
    }

    const course = courseResult.rows[0];

    // Check enrollment - ALL users must be enrolled
    const userId = session.user.id;
    let isEnrolled = false;

    const enrollmentResult = await query(
        `SELECT status FROM course_enrollments WHERE course_id = $1 AND student_id = $2`,
        [courseId, userId]
    );

    if (enrollmentResult.rows.length > 0 && enrollmentResult.rows[0].status === 'active') {
        isEnrolled = true;
    }

    // Fetch chapters and lessons
    const chaptersResult = await query(
        `SELECT * FROM chapters WHERE course_id = $1 ORDER BY order_index ASC`,
        [courseId]
    );

    const chapters = chaptersResult.rows;

    const lessonsResult = await query(
        `SELECT l.* 
       FROM lessons l
       JOIN chapters c ON l.chapter_id = c.id
       WHERE c.course_id = $1
       ORDER BY l.order_index ASC`,
        [courseId]
    );

    const lessons = lessonsResult.rows;

    // Fetch lesson resources
    const resourcesResult = await query(
        `SELECT lr.* 
       FROM lesson_resources lr
       JOIN lessons l ON lr.lesson_id = l.id
       JOIN chapters c ON l.chapter_id = c.id
       WHERE c.course_id = $1
       ORDER BY lr.order_index ASC`,
        [courseId]
    );

    const resources = resourcesResult.rows;

    // Attach resources to lessons
    const lessonsWithResources = lessons.map((lesson: any) => ({
        ...lesson,
        resources: resources.filter((r: any) => r.lesson_id === lesson.id)
    }));

    // Attach lessons to chapters
    const chaptersWithLessons = chapters.map((chapter: any) => ({
        ...chapter,
        lessons: lessonsWithResources.filter((lesson: any) => lesson.chapter_id === chapter.id)
    }));

    // Student View (Overview/Syllabus)
    return (
        <div className="flex-1 p-8 pt-6 h-full">
            <Suspense fallback={<div>Đang tải...</div>}>
                <CourseSyllabus
                    course={course}
                    chapters={chaptersWithLessons}
                    isEnrolled={isEnrolled}
                />
            </Suspense>
        </div>
    );
}
