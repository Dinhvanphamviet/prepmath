import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { CourseViewer } from "@/components/courses/course-viewer";

export default async function CourseLearnPage({ params }: { params: Promise<{ courseId: string }> }) {
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

    // Check enrollment - ALL users must be enrolled to access
    const userId = session.user.id;
    let hasAccess = false;

    const enrollmentResult = await query(
        `SELECT status FROM course_enrollments WHERE course_id = $1 AND student_id = $2`,
        [courseId, userId]
    );

    if (enrollmentResult.rows.length > 0 && enrollmentResult.rows[0].status === 'active') {
        hasAccess = true;
    }

    if (!hasAccess) {
        // If not enrolled, redirect back to overview
        return redirect(`/dashboard/courses/${courseId}`);
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

    // Fetch lesson progress for current user
    const progressResult = await query(
        `SELECT lesson_id, is_completed 
         FROM lesson_progress 
         WHERE student_id = $1 AND lesson_id IN (
             SELECT l.id FROM lessons l
             JOIN chapters c ON l.chapter_id = c.id
             WHERE c.course_id = $2
         )`,
        [userId, courseId]
    );

    const completedLessonIds = new Set(
        progressResult.rows
            .filter((p: any) => p.is_completed)
            .map((p: any) => p.lesson_id)
    );

    // Attach resources to lessons
    const lessonsWithResources = lessons.map((lesson: any) => ({
        ...lesson,
        resources: resources.filter((r: any) => r.lesson_id === lesson.id),
        isCompleted: completedLessonIds.has(lesson.id)
    }));

    // Attach lessons to chapters
    const chaptersWithLessons = chapters.map((chapter: any) => ({
        ...chapter,
        lessons: lessonsWithResources.filter((lesson: any) => lesson.chapter_id === chapter.id)
    }));

    return (
        <div className="h-full">
            <CourseViewer
                course={course}
                chapters={chaptersWithLessons}
                hasAccess={hasAccess}
            />
        </div>
    );
}
