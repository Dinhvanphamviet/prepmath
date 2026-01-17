-- ============================================
-- CLEANED DATABASE RESTORE SCRIPT (Neon Console Compatible)
-- Based on setupfinal.sql dump
-- ============================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- DROP ALL TABLES TO ENSURE CLEAN RESTORE
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS lesson_resources CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS enrollment_codes CASCADE;
DROP TABLE IF EXISTS pending_enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- TABLES SCHEMA

-- USERS
CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'student'::character varying NOT NULL,
    full_name character varying(255),
    date_of_birth date,
    email character varying(255),
    phone character varying(50),
    address text,
    image text,
    email_verified timestamp without time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['teacher'::character varying, 'student'::character varying])::text[])))
);

-- TOKENS TABLES
CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    token character varying(512) NOT NULL,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.verification_tokens (
    identifier character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    PRIMARY KEY (identifier, token)
);

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    PRIMARY KEY (email, token)
);

-- COURSES
CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    teacher_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title character varying(255) NOT NULL UNIQUE,
    description text,
    thumbnail_url text,
    category character varying(100),
    level character varying(50),
    is_published boolean DEFAULT false,
    is_private boolean DEFAULT false,
    price numeric(10,2) DEFAULT 0.00,
    currency character varying(3) DEFAULT 'VND'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- ENROLLMENT CODES
CREATE TABLE public.enrollment_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    code character varying(50) NOT NULL UNIQUE,
    max_uses integer DEFAULT 1,
    used_count integer DEFAULT 0,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_by uuid NOT NULL REFERENCES public.users(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- COURSE ENROLLMENTS
CREATE TABLE public.course_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    enrollment_code_id uuid REFERENCES public.enrollment_codes(id) ON DELETE SET NULL,
    enrollment_method character varying(50) NOT NULL,
    enrolled_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'active'::character varying,
    completed_at timestamp with time zone,
    progress integer DEFAULT 0,
    UNIQUE (course_id, student_id),
    CONSTRAINT course_enrollments_enrollment_method_check CHECK (((enrollment_method)::text = ANY ((ARRAY['code'::character varying, 'direct_add'::character varying, 'purchase'::character varying])::text[]))),
    CONSTRAINT course_enrollments_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'dropped'::character varying, 'suspended'::character varying])::text[])))
);

-- PENDING ENROLLMENTS
CREATE TABLE public.pending_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    email character varying(255) NOT NULL,
    invited_by uuid NOT NULL REFERENCES public.users(id),
    invited_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    UNIQUE (course_id, email)
);

-- CHAPTERS
CREATE TABLE public.chapters (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title character varying(255) NOT NULL,
    description text,
    order_index integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, order_index)
);

-- LESSONS
CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    title character varying(255) NOT NULL,
    content text,
    lesson_type character varying(50),
    order_index integer DEFAULT 0 NOT NULL,
    duration_minutes integer DEFAULT 0,
    is_published boolean DEFAULT true,
    is_preview boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    video_url text,
    UNIQUE (chapter_id, order_index),
    CONSTRAINT lessons_lesson_type_check CHECK (((lesson_type)::text = ANY ((ARRAY['video'::character varying, 'document'::character varying, 'quiz'::character varying, 'assignment'::character varying])::text[])))
);

-- LESSON RESOURCES
CREATE TABLE public.lesson_resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    resource_type character varying(20) NOT NULL,
    resource_url text NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    order_index integer DEFAULT 0 NOT NULL,
    duration_minutes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lesson_resources_resource_type_check CHECK (((resource_type)::text = ANY ((ARRAY['video'::character varying, 'document'::character varying])::text[])))
);

-- LESSON PROGRESS
CREATE TABLE public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    is_completed boolean DEFAULT false,
    progress_percentage integer DEFAULT 0,
    last_position_seconds integer DEFAULT 0,
    last_accessed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone,
    UNIQUE (student_id, lesson_id),
    CONSTRAINT lesson_progress_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100)))
);

-- RESTORE DATA (Converted from COPY to INSERT)

-- Users
INSERT INTO public.users (id, username, password, role, full_name, email, image, created_at, updated_at) VALUES 
('b23888a1-434b-4fb9-bdb7-392d2e98f444', 'system_teacher', '$2b$10$EpOd.sQp/WfGzY.Q/WfGzY.Q/WfGzY.Q/WfGzY.Q/WfGzY.Q', 'teacher', 'Giáo Viên Hệ Thống', 'system_teacher@example.com', NULL, '2026-01-01 23:06:15.376845+07', '2026-01-01 23:06:15.376845+07'),
('9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'dinhviet', '$2b$10$ay30hVE/sS/4E5qIhgiKs.hIAVCq1Qr3tBAuExrjEU1rgXk6xyCO.', 'student', 'Đinh Việt', 'vietphamdinhvanhust@gmail.com', 'https://res.cloudinary.com/dfbsdiq9p/image/upload/v1767277201/qxhd0gx7piyhzi7qianz.png', '2026-01-01 21:02:57.418712', '2026-01-01 23:08:14.889578+07'),
('102da1fe-20ed-41ff-ba95-fe4b349046e8', 'dainnabaddon', '$2b$10$IvWvXtvI9Ir7k3nVzeSekuboABsWUEB1VZclXHj6gmea6IKQt/8du', 'student', 'Thao Nguyen Viet', 'dainnabaddon@gmail.com', 'https://lh3.googleusercontent.com/a/ACg8ocIOrOSCj6gTKMDICUNi5HHMvRjAn4lsI1i1CVebpQuqaY2ZaMs=s96-c', '2026-01-02 00:27:25.749734+07', '2026-01-02 00:27:25.749734+07');

-- Courses
INSERT INTO public.courses (id, teacher_id, title, description, thumbnail_url, category, level, is_published, is_private, price, currency, created_at, updated_at) VALUES 
('3f176486-1fcd-485a-b688-4055280bb864', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'Giải tích cơ bản cho Đại học', 'Chuẩn bị kiến thức Toán cao cấp.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60', 'Calculus', '10', 'f', 'f', 0.00, 'VND', '2026-01-01 22:20:38.090434+07', '2026-01-01 23:08:37.651299+07'),
('5f01c31a-1094-4c92-b1fc-5298b3c8c721', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'Toán 10: Đại số nưng cao', 'Chuyên đề mệnh đề, tập hợp và bất phương trình.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60', 'Math', '10', 't', 'f', 0.00, 'VND', '2026-01-01 22:47:32.764102+07', '2026-01-01 23:08:37.651299+07'),
('d3996d9d-2082-42f5-bbc6-a567858e82df', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'Luyện đề HSA 2026', 'Bộ đề thi thử sát với đề minh họa.', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60', 'HSA', 'HSA', 't', 'f', 0.00, 'VND', '2026-01-01 22:47:32.764102+07', '2026-01-01 23:08:37.651299+07'),
('d4c04f4d-e695-42d8-ad32-605e099e64e2', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'Ôn thi THPT Quốc Gia môn Toán 2025', 'Khóa học toàn diện bao gồm Đại số và Hình học 12, luyện đề chi tiết.', 'https://res.cloudinary.com/dfbsdiq9p/image/upload/v1767291143/Gemini_Generated_Image_u2pjrfu2pjrfu2pj_mpjol9.png', 'Math', '12', 't', 'f', 0.00, 'VND', '2026-01-01 22:27:14.880667+07', '2026-01-02 01:13:18.406499+07'),
('c7affe64-e923-4fbe-ac97-1b2d3d5a21c2', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'Toán 11: Hình học không gian', 'Chinh phục hình học lớp 11.', 'https://res.cloudinary.com/dfbsdiq9p/image/upload/v1767291320/Gemini_Generated_Image_hrhk4ghrhk4ghrhk_omc1oh.png', 'Math', '11', 't', 'f', 0.00, 'VND', '2026-01-01 22:47:32.764102+07', '2026-01-02 01:15:50.383096+07'),
('683a1ff0-e4f8-488c-a585-ce4db9a63a89', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'Đại số 11 - Nâng cao', 'Chuyên đề Hàm số lượng giác và Tổ hợp - Xác suất dành cho học sinh khá giỏi.', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=60', 'Math', '11', 't', 'f', 0.00, 'VND', '2026-01-01 23:04:47.871958+07', '2026-01-01 23:08:37.651299+07'),
('1fcb9ee5-9c76-4b8f-a8f1-dec2097c8bd3', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'Hình học 10 - Vectơ và Tọa độ', 'Làm chủ phương pháp tọa độ trong mặt phẳng và các bài toán vectơ.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60', 'Math', '10', 't', 'f', 0.00, 'VND', '2026-01-01 23:04:47.871958+07', '2026-01-01 23:08:37.651299+07'),
('424ba2db-ceaf-4924-9aa1-a67927ad2a40', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'Tổng ôn Toán 9 vào 10', 'Khóa học trọng tâm giúp học sinh lớp 9 nắm vững kiến thức để thi vào lớp 10 THPT.', 'https://res.cloudinary.com/dfbsdiq9p/image/upload/v1767290691/Gemini_Generated_Image_qa9n92qa9n92qa9n_hvuawy.png', 'Math', '9', 't', 'f', 0.00, 'VND', '2026-01-01 23:04:47.871958+07', '2026-01-02 01:05:27.540605+07');

-- Course Enrollments
INSERT INTO public.course_enrollments (id, course_id, student_id, enrollment_method, enrolled_at, status, progress) VALUES 
('3a719f20-1667-4c40-a5b0-316ad187d0bb', '5f01c31a-1094-4c92-b1fc-5298b3c8c721', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'direct_add', '2026-01-01 23:09:55.01869+07', 'active', 0),
('b1d1bfd5-8e96-44b5-82be-345b92ccfcb6', '424ba2db-ceaf-4924-9aa1-a67927ad2a40', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'direct_add', '2026-01-01 23:09:55.01869+07', 'active', 0),
('6903121b-9652-466c-a4da-b2d026afe1ad', '683a1ff0-e4f8-488c-a585-ce4db9a63a89', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'direct_add', '2026-01-01 23:09:55.01869+07', 'active', 0),
('b5ecdd06-e262-43b3-8794-830878c014c7', '1fcb9ee5-9c76-4b8f-a8f1-dec2097c8bd3', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'direct_add', '2026-01-01 23:09:55.01869+07', 'active', 0),
('ccc1ba20-e71b-4780-83ec-453d34cc1ecc', 'd4c04f4d-e695-42d8-ad32-605e099e64e2', '9c1e161d-a5fb-4021-8eaf-602e15b0cae0', 'direct_add', '2026-01-01 23:09:55.01869+07', 'active', 50);

-- Chapters
INSERT INTO public.chapters (id, course_id, title, description, order_index, is_published, created_at, updated_at) VALUES 
('014b8d26-c8b9-4fc6-b39a-22ee67da1cea', 'd3996d9d-2082-42f5-bbc6-a567858e82df', 'Đại số cơ bản', NULL, 0, 't', '2026-01-01 23:42:01.405727+07', '2026-01-01 23:42:01.405727+07'),
('4a53dcb3-03ed-40c1-9be1-22ff5b4b5a3d', 'd3996d9d-2082-42f5-bbc6-a567858e82df', 'Hình học phẳng', NULL, 1, 't', '2026-01-01 23:42:01.405727+07', '2026-01-01 23:42:01.405727+07'),
('d3f6dcd6-5e6a-4ef5-99dd-15e58fd2543d', 'd3996d9d-2082-42f5-bbc6-a567858e82df', 'Luyện đề tổng hợp', NULL, 2, 't', '2026-01-01 23:42:01.405727+07', '2026-01-01 23:42:01.405727+07'),
('923e21c4-d7fd-4f9b-8ccc-3070fda6c845', 'd4c04f4d-e695-42d8-ad32-605e099e64e2', 'Chương 1: Hàm số và Đồ thị', NULL, 0, 't', '2026-01-02 00:12:08.010832+07', '2026-01-02 00:12:08.010832+07'),
('913dd954-932a-4d8d-9cf0-3945b820509f', 'd4c04f4d-e695-42d8-ad32-605e099e64e2', 'Chương 2: Phương trình và Bất phương trình', NULL, 1, 't', '2026-01-02 00:12:08.010832+07', '2026-01-02 00:12:08.010832+07');

-- Lessons (Skipping content/video_url for brevity but keeping IDs/Titles)
INSERT INTO public.lessons (id, chapter_id, title, lesson_type, order_index, is_published, created_at, updated_at, video_url) VALUES 
('3d17e280-a06c-4f56-a7f0-a62f2a1e1778', '923e21c4-d7fd-4f9b-8ccc-3070fda6c845', 'Bài 1: Khái niệm hàm số', NULL, 0, 't', '2026-01-02 00:12:08.010832+07', '2026-01-02 00:12:08.010832+07', NULL),
('1232914e-90eb-461f-a621-3f5081700188', '923e21c4-d7fd-4f9b-8ccc-3070fda6c845', 'Bài 2: Tính đơn điệu của hàm số', NULL, 1, 't', '2026-01-02 00:12:08.010832+07', '2026-01-02 00:12:08.010832+07', NULL),
('c8695edf-17c0-48fe-8ae1-1a6347b997a6', '014b8d26-c8b9-4fc6-b39a-22ee67da1cea', 'Bài 1: Phương trình bậc nhất', 'video', 0, 't', '2026-01-01 23:42:01.405727+07', '2026-01-01 23:42:01.405727+07', 'https://www.youtube.com/embed/S9wF_0pX4i0'),
('31fd2120-72bd-455b-ad60-0abf0ec4ce9f', '014b8d26-c8b9-4fc6-b39a-22ee67da1cea', 'Bài 2: Phương trình bậc hai', 'video', 1, 't', '2026-01-01 23:42:01.405727+07', '2026-01-01 23:42:01.405727+07', 'https://www.youtube.com/embed/S9wF_0pX4i0'),
('136de4c9-ed3f-4bdc-8a53-65e11f20e58b', '014b8d26-c8b9-4fc6-b39a-22ee67da1cea', 'Tài liệu: Bài tập tự luyện Đại số', 'document', 2, 't', '2026-01-01 23:42:01.405727+07', '2026-01-01 23:42:01.405727+07', 'https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing');

-- Create triggers manually (pg_dump output for triggers is verbose, simplified here)
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
