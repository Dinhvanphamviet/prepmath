import { auth } from "@/auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { user } = session;

        // If user is teacher, return courses they teach
        if (user.role === "teacher") {
            const courses = await query(
                `SELECT * FROM courses WHERE teacher_id = $1 ORDER BY created_at DESC`,
                [user.id]
            );
            return NextResponse.json(courses.rows);
        }

        // If user is student, return courses they are enrolled in
        // Also likely want to return 'published' courses available for enrollment if not enrolled?
        // For now, let's just return enrolled courses for the dashboard view
        const courses = await query(
            `SELECT c.*, ce.status as enrollment_status, ce.progress
       FROM courses c
       JOIN course_enrollments ce ON c.id = ce.course_id
       WHERE ce.student_id = $1 AND ce.status = 'active'
       ORDER BY ce.enrolled_at DESC`,
            [user.id]
        );

        return NextResponse.json(courses.rows);

    } catch (error) {
        console.error("[COURSES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id || session.user.role !== "teacher") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const json = await req.json();
        const { title, description, category, level, is_private } = json;

        if (!title) {
            return new NextResponse("Title is required", { status: 400 });
        }

        const course = await query(
            `INSERT INTO courses (teacher_id, title, description, category, level, is_private, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [
                session.user.id,
                title,
                description || '',
                category || 'General',
                level || 'all',
                is_private || false,
                false // Default unpublished
            ]
        );

        return NextResponse.json(course.rows[0]);

    } catch (error) {
        console.error("[COURSES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
