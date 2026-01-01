import { auth } from '@/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { courseId } = await params;
        const body = await req.json();
        const { lessonId, isCompleted } = body;

        if (!lessonId) {
            return new NextResponse("Missing lessonId", { status: 400 });
        }

        // 1. Upsert lesson_progress
        await query(
            `INSERT INTO lesson_progress (student_id, lesson_id, is_completed, completed_at, last_accessed_at, progress_percentage)
             VALUES ($1, $2, $3, $4, NOW(), $5)
             ON CONFLICT (student_id, lesson_id) 
             DO UPDATE SET 
                is_completed = EXCLUDED.is_completed,
                completed_at = EXCLUDED.completed_at,
                last_accessed_at = NOW(),
                progress_percentage = EXCLUDED.progress_percentage
            `,
            [
                session.user.id,
                lessonId,
                isCompleted,
                isCompleted ? new Date() : null, // Set completed_at if completed
                isCompleted ? 100 : 0
            ]
        );

        // 2. Recalculate Course Progress
        // Get total lessons count
        const totalLessonsRes = await query(
            `SELECT COUNT(*) as total FROM lessons l
             JOIN chapters c ON l.chapter_id = c.id
             WHERE c.course_id = $1 AND l.is_published = TRUE`,
            [courseId]
        );
        const totalLessons = parseInt(totalLessonsRes.rows[0].total) || 1; // avoid div by 0

        // Get completed lessons count
        const completedRes = await query(
            `SELECT COUNT(lp.lesson_id) as completed 
             FROM lesson_progress lp
             JOIN lessons l ON lp.lesson_id = l.id
             JOIN chapters c ON l.chapter_id = c.id
             WHERE lp.student_id = $1 AND c.course_id = $2 AND lp.is_completed = TRUE`,
            [session.user.id, courseId]
        );
        const completedLessons = parseInt(completedRes.rows[0].completed);

        const progressPercent = Math.round((completedLessons / totalLessons) * 100);

        // 3. Update course_enrollments
        await query(
            `UPDATE course_enrollments
             SET progress = $1, status = CASE WHEN $1 = 100 THEN 'completed' ELSE status END
             WHERE student_id = $2 AND course_id = $3`,
            [progressPercent, session.user.id, courseId]
        );

        return NextResponse.json({
            success: true,
            progress: progressPercent,
            isCompleted
        });

    } catch (error) {
        console.error("[LESSON_PROGRESS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
