import { auth } from "@/auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch ALL published courses with enrollment status
        const result = await query(
            `SELECT c.*, u.full_name as teacher_name,
                    ce.status as enrollment_status,
                    ce.progress
             FROM courses c
             JOIN users u ON c.teacher_id = u.id
             LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.student_id = $1
             WHERE c.is_published = TRUE
             ORDER BY c.created_at DESC`,
            [session.user.id]
        );

        return NextResponse.json(result.rows);

    } catch (error) {
        console.error("[COURSES_CATALOG_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
