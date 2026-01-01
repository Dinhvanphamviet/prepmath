import { auth } from "@/auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { code } = await req.json();

        if (!code) {
            return new NextResponse("Code is required", { status: 400 });
        }

        // 1. Find the code
        const codeResult = await query(
            `SELECT * FROM enrollment_codes 
       WHERE code = $1 AND is_active = TRUE`,
            [code]
        );

        if (codeResult.rows.length === 0) {
            return new NextResponse("Invalid code", { status: 404 });
        }

        const enrollmentCode = codeResult.rows[0];

        // 2. Check if expired
        if (enrollmentCode.expires_at && new Date(enrollmentCode.expires_at) < new Date()) {
            return new NextResponse("Code expired", { status: 400 });
        }

        // 3. Check usage limit
        if (enrollmentCode.max_uses > 0 && enrollmentCode.used_count >= enrollmentCode.max_uses) {
            return new NextResponse("Code usage limit reached", { status: 400 });
        }

        // 4. Check if already enrolled
        const existingEnrollment = await query(
            `SELECT * FROM course_enrollments WHERE course_id = $1 AND student_id = $2`,
            [enrollmentCode.course_id, session.user.id]
        );

        if (existingEnrollment.rows.length > 0) {
            return new NextResponse("Already enrolled", { status: 400 });
        }

        // 5. Enroll the student
        await query(
            `INSERT INTO course_enrollments (course_id, student_id, enrollment_code_id, enrollment_method, status)
         VALUES ($1, $2, $3, 'code', 'active')`,
            [enrollmentCode.course_id, session.user.id, enrollmentCode.id]
        );

        // 6. Update usage count
        await query(
            `UPDATE enrollment_codes SET used_count = used_count + 1 WHERE id = $1`,
            [enrollmentCode.id]
        );

        return new NextResponse("Enrolled successfully", { status: 200 });

    } catch (error) {
        console.error("[COURSE_JOIN]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
