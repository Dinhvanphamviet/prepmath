--
-- PostgreSQL database dump
--

\restrict Dd9GyerWEKr02eWtW772EoWdq3dLDtaEpEfxrJ1cu3EkUpSdelvjSscL6OJWkNP

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-02 03:05:56

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 34587)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 271 (class 1255 OID 34915)
-- Name: check_course_access(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_course_access(p_user_id uuid, p_course_id uuid) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_has_access BOOLEAN;
    v_course_owner UUID;
    v_user_role VARCHAR;
BEGIN
    -- Check if user is the teacher/owner of the course
    SELECT teacher_id, role INTO v_course_owner, v_user_role 
    FROM courses c 
    JOIN users u ON u.id = p_user_id 
    WHERE c.id = p_course_id;
    
    IF v_course_owner = p_user_id OR v_user_role = 'teacher' THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is enrolled in the course
    SELECT EXISTS (
        SELECT 1 FROM course_enrollments 
        WHERE course_id = p_course_id 
        AND student_id = p_user_id 
        AND status = 'active'
    ) INTO v_has_access;
    
    RETURN COALESCE(v_has_access, FALSE);
END;
$$;


ALTER FUNCTION public.check_course_access(p_user_id uuid, p_course_id uuid) OWNER TO postgres;

--
-- TOC entry 272 (class 1255 OID 34921)
-- Name: generate_enrollment_code(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_enrollment_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Generate a random 8-character alphanumeric code
    IF NEW.code IS NULL THEN
        NEW.code := UPPER(
            SUBSTRING(MD5(random()::text) FROM 1 FOR 8)
        );
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_enrollment_code() OWNER TO postgres;

--
-- TOC entry 273 (class 1255 OID 34957)
-- Name: update_lesson_resources_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_lesson_resources_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_lesson_resources_updated_at() OWNER TO postgres;

--
-- TOC entry 270 (class 1255 OID 34666)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 34713)
-- Name: chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    order_index integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chapters OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 34822)
-- Name: course_enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    student_id uuid NOT NULL,
    enrollment_code_id uuid,
    enrollment_method character varying(50) NOT NULL,
    enrolled_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'active'::character varying,
    completed_at timestamp with time zone,
    progress integer DEFAULT 0,
    CONSTRAINT course_enrollments_enrollment_method_check CHECK (((enrollment_method)::text = ANY ((ARRAY['code'::character varying, 'direct_add'::character varying, 'purchase'::character varying])::text[]))),
    CONSTRAINT course_enrollments_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'dropped'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.course_enrollments OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 34688)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    title character varying(255) NOT NULL,
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


ALTER TABLE public.courses OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 34625)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 34916)
-- Name: course_enrollment_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.course_enrollment_summary AS
 SELECT c.id AS course_id,
    c.title AS course_title,
    c.teacher_id,
    u.username AS teacher_username,
    count(ce.id) AS total_enrollments,
    count(ce.id) FILTER (WHERE ((ce.status)::text = 'active'::text)) AS active_enrollments,
    count(ce.id) FILTER (WHERE ((ce.status)::text = 'completed'::text)) AS completed_enrollments
   FROM ((public.courses c
     LEFT JOIN public.course_enrollments ce ON ((c.id = ce.course_id)))
     LEFT JOIN public.users u ON ((c.teacher_id = u.id)))
  GROUP BY c.id, c.title, c.teacher_id, u.username;


ALTER VIEW public.course_enrollment_summary OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 34792)
-- Name: enrollment_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollment_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    max_uses integer DEFAULT 1,
    used_count integer DEFAULT 0,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.enrollment_codes OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 34882)
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    is_completed boolean DEFAULT false,
    progress_percentage integer DEFAULT 0,
    last_position_seconds integer DEFAULT 0,
    last_accessed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone,
    CONSTRAINT lesson_progress_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100)))
);


ALTER TABLE public.lesson_progress OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 34931)
-- Name: lesson_resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id uuid NOT NULL,
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


ALTER TABLE public.lesson_resources OWNER TO postgres;

--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE lesson_resources; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.lesson_resources IS 'Stores multiple video/document resources for each lesson';


--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN lesson_resources.resource_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.lesson_resources.resource_type IS 'Type of resource: video or document';


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN lesson_resources.order_index; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.lesson_resources.order_index IS 'Display order within the lesson';


--
-- TOC entry 226 (class 1259 OID 34738)
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chapter_id uuid NOT NULL,
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
    CONSTRAINT lessons_lesson_type_check CHECK (((lesson_type)::text = ANY ((ARRAY['video'::character varying, 'document'::character varying, 'quiz'::character varying, 'assignment'::character varying])::text[])))
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 34668)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 34856)
-- Name: pending_enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pending_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    invited_by uuid NOT NULL,
    invited_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);


ALTER TABLE public.pending_enrollments OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 34643)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token character varying(512) NOT NULL,
    user_id uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 34678)
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_tokens (
    identifier character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO postgres;

--
-- TOC entry 5236 (class 0 OID 34713)
-- Dependencies: 225
-- Data for Name: chapters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chapters (id, course_id, title, description, order_index, is_published, created_at, updated_at) FROM stdin;
014b8d26-c8b9-4fc6-b39a-22ee67da1cea	d3996d9d-2082-42f5-bbc6-a567858e82df	Đại số cơ bản	\N	0	t	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07
4a53dcb3-03ed-40c1-9be1-22ff5b4b5a3d	d3996d9d-2082-42f5-bbc6-a567858e82df	Hình học phẳng	\N	1	t	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07
d3f6dcd6-5e6a-4ef5-99dd-15e58fd2543d	d3996d9d-2082-42f5-bbc6-a567858e82df	Luyện đề tổng hợp	\N	2	t	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07
923e21c4-d7fd-4f9b-8ccc-3070fda6c845	d4c04f4d-e695-42d8-ad32-605e099e64e2	Chương 1: Hàm số và Đồ thị	\N	0	t	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
913dd954-932a-4d8d-9cf0-3945b820509f	d4c04f4d-e695-42d8-ad32-605e099e64e2	Chương 2: Phương trình và Bất phương trình	\N	1	t	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
\.


--
-- TOC entry 5239 (class 0 OID 34822)
-- Dependencies: 228
-- Data for Name: course_enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_enrollments (id, course_id, student_id, enrollment_code_id, enrollment_method, enrolled_at, status, completed_at, progress) FROM stdin;
3a719f20-1667-4c40-a5b0-316ad187d0bb	5f01c31a-1094-4c92-b1fc-5298b3c8c721	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	\N	direct_add	2026-01-01 23:09:55.01869+07	active	\N	0
b1d1bfd5-8e96-44b5-82be-345b92ccfcb6	424ba2db-ceaf-4924-9aa1-a67927ad2a40	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	\N	direct_add	2026-01-01 23:09:55.01869+07	active	\N	0
6903121b-9652-466c-a4da-b2d026afe1ad	683a1ff0-e4f8-488c-a585-ce4db9a63a89	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	\N	direct_add	2026-01-01 23:09:55.01869+07	active	\N	0
b5ecdd06-e262-43b3-8794-830878c014c7	1fcb9ee5-9c76-4b8f-a8f1-dec2097c8bd3	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	\N	direct_add	2026-01-01 23:09:55.01869+07	active	\N	0
ccc1ba20-e71b-4780-83ec-453d34cc1ecc	d4c04f4d-e695-42d8-ad32-605e099e64e2	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	\N	direct_add	2026-01-01 23:09:55.01869+07	active	\N	50
\.


--
-- TOC entry 5235 (class 0 OID 34688)
-- Dependencies: 224
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, teacher_id, title, description, thumbnail_url, category, level, is_published, is_private, price, currency, created_at, updated_at) FROM stdin;
3f176486-1fcd-485a-b688-4055280bb864	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	Giải tích cơ bản cho Đại học	Chuẩn bị kiến thức Toán cao cấp.	https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60	Calculus	10	f	f	0.00	VND	2026-01-01 22:20:38.090434+07	2026-01-01 23:08:37.651299+07
5f01c31a-1094-4c92-b1fc-5298b3c8c721	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	Toán 10: Đại số nưng cao	Chuyên đề mệnh đề, tập hợp và bất phương trình.	https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60	Math	10	t	f	0.00	VND	2026-01-01 22:47:32.764102+07	2026-01-01 23:08:37.651299+07
d3996d9d-2082-42f5-bbc6-a567858e82df	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	Luyện đề HSA 2026	Bộ đề thi thử sát với đề minh họa.	https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60	HSA	HSA	t	f	0.00	VND	2026-01-01 22:47:32.764102+07	2026-01-01 23:08:37.651299+07
d4c04f4d-e695-42d8-ad32-605e099e64e2	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	Ôn thi THPT Quốc Gia môn Toán 2025	Khóa học toàn diện bao gồm Đại số và Hình học 12, luyện đề chi tiết.	https://res.cloudinary.com/dfbsdiq9p/image/upload/v1767291143/Gemini_Generated_Image_u2pjrfu2pjrfu2pj_mpjol9.png	Math	12	t	f	0.00	VND	2026-01-01 22:27:14.880667+07	2026-01-02 01:13:18.406499+07
c7affe64-e923-4fbe-ac97-1b2d3d5a21c2	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	Toán 11: Hình học không gian	Chinh phục hình học lớp 11.	https://res.cloudinary.com/dfbsdiq9p/image/upload/v1767291320/Gemini_Generated_Image_hrhk4ghrhk4ghrhk_omc1oh.png	Math	11	t	f	0.00	VND	2026-01-01 22:47:32.764102+07	2026-01-02 01:15:50.383096+07
683a1ff0-e4f8-488c-a585-ce4db9a63a89	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	Đại số 11 - Nâng cao	Chuyên đề Hàm số lượng giác và Tổ hợp - Xác suất dành cho học sinh khá giỏi.	https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=60	Math	11	t	f	0.00	VND	2026-01-01 23:04:47.871958+07	2026-01-01 23:08:37.651299+07
1fcb9ee5-9c76-4b8f-a8f1-dec2097c8bd3	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	Hình học 10 - Vectơ và Tọa độ	Làm chủ phương pháp tọa độ trong mặt phẳng và các bài toán vectơ.	https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60	Math	10	t	f	0.00	VND	2026-01-01 23:04:47.871958+07	2026-01-01 23:08:37.651299+07
424ba2db-ceaf-4924-9aa1-a67927ad2a40	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	Tổng ôn Toán 9 vào 10	Khóa học trọng tâm giúp học sinh lớp 9 nắm vững kiến thức để thi vào lớp 10 THPT.	https://res.cloudinary.com/dfbsdiq9p/image/upload/v1767290691/Gemini_Generated_Image_qa9n92qa9n92qa9n_hvuawy.png	Math	9	t	f	0.00	VND	2026-01-01 23:04:47.871958+07	2026-01-02 01:05:27.540605+07
\.


--
-- TOC entry 5238 (class 0 OID 34792)
-- Dependencies: 227
-- Data for Name: enrollment_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollment_codes (id, course_id, code, max_uses, used_count, expires_at, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5241 (class 0 OID 34882)
-- Dependencies: 230
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_progress (id, student_id, lesson_id, is_completed, progress_percentage, last_position_seconds, last_accessed_at, completed_at) FROM stdin;
3d40e6b5-ff92-4e85-8da9-b3674c13b267	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	1232914e-90eb-461f-a621-3f5081700188	f	0	0	2026-01-02 00:18:57.906076+07	\N
f24e80cf-f24b-4f43-bb89-6cf47b762bd0	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	3d17e280-a06c-4f56-a7f0-a62f2a1e1778	t	100	0	2026-01-02 00:19:02.792082+07	2026-01-02 00:19:02.79+07
1eb50b29-6d30-4517-b1bc-99a8f00b31e7	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	6d2bdbdc-314e-470f-89f5-9de3dff034ba	t	100	0	2026-01-02 00:19:21.454943+07	2026-01-02 00:19:21.453+07
dfc6a7f8-cd86-45e1-b797-a2a619ec54c7	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	a8d3e47c-f193-4d3f-9469-b42aa3d4a6f3	t	100	0	2026-01-02 00:32:43.63864+07	2026-01-02 00:32:43.636+07
\.


--
-- TOC entry 5242 (class 0 OID 34931)
-- Dependencies: 232
-- Data for Name: lesson_resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_resources (id, lesson_id, resource_type, resource_url, title, description, order_index, duration_minutes, created_at, updated_at) FROM stdin;
b6d673bc-62ea-4b27-aa30-ac7e34732070	c8695edf-17c0-48fe-8ae1-1a6347b997a6	video	https://www.youtube.com/embed/S9wF_0pX4i0	Bài 1: Phương trình bậc nhất - Video bài giảng	\N	0	0	2026-01-02 00:01:48.458474+07	2026-01-02 00:01:48.458474+07
ab23719e-1edb-47f9-8c5d-5fa1832ee837	31fd2120-72bd-455b-ad60-0abf0ec4ce9f	video	https://www.youtube.com/embed/S9wF_0pX4i0	Bài 2: Phương trình bậc hai - Video bài giảng	\N	0	0	2026-01-02 00:01:48.458474+07	2026-01-02 00:01:48.458474+07
9e8a436e-cacb-47ea-8a26-940b6a892458	136de4c9-ed3f-4bdc-8a53-65e11f20e58b	document	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing	Tài liệu: Bài tập tự luyện Đại số - Tài liệu học tập	\N	0	0	2026-01-02 00:01:48.458474+07	2026-01-02 00:01:48.458474+07
c4e6afef-7751-43cf-8950-f237c45c5f55	4c05bb05-7e31-46f6-a0f8-024d48f3c226	video	https://www.youtube.com/embed/S9wF_0pX4i0	Bài 1: Định lý Pythagore - Video bài giảng	\N	0	0	2026-01-02 00:01:48.458474+07	2026-01-02 00:01:48.458474+07
5831be21-220d-4fe8-8f03-ff9ac6eb4101	38e2030c-1c6d-4cb1-8634-00f0da23c0ab	video	https://www.youtube.com/embed/S9wF_0pX4i0	Bài 2: Diện tích hình học - Video bài giảng	\N	0	0	2026-01-02 00:01:48.458474+07	2026-01-02 00:01:48.458474+07
f1abcceb-ac55-4b5f-b955-261b2ed1861b	581b92b1-9432-42da-99b6-32116d12af44	video	https://www.youtube.com/embed/S9wF_0pX4i0	Bài 3: Thể tích khối đa diện - Video bài giảng	\N	0	0	2026-01-02 00:01:48.458474+07	2026-01-02 00:01:48.458474+07
05cb68ca-1c04-4179-9214-968b78d753ea	74d5827c-539b-4225-bad9-a366e7faf489	video	https://www.youtube.com/embed/S9wF_0pX4i0	Đề 1: Tổng hợp kiến thức - Video bài giảng	\N	0	0	2026-01-02 00:01:48.458474+07	2026-01-02 00:01:48.458474+07
51888e72-8cdd-4c57-a5fb-d4b5040212a0	45e4dbd1-7d64-426a-8210-d130e339f5f5	document	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing	Tài liệu: Đề thi thử - Tài liệu học tập	\N	0	0	2026-01-02 00:01:48.458474+07	2026-01-02 00:01:48.458474+07
8d273bad-8289-4897-b8d7-a62a0dc4b363	d1102143-acce-484e-99aa-8abf44b8c596	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 1: Lý thuyết cơ bản	Giới thiệu các khái niệm cơ bản	0	0	2026-01-02 00:05:20.274988+07	2026-01-02 00:05:20.274988+07
ed9f1c76-0318-4bb6-965e-063ea1fcfc67	d1102143-acce-484e-99aa-8abf44b8c596	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 2: Bài tập mẫu	Hướng dẫn giải bài tập	1	0	2026-01-02 00:05:20.274988+07	2026-01-02 00:05:20.274988+07
8259ea49-2669-409b-8e57-9a82d74340dc	d1102143-acce-484e-99aa-8abf44b8c596	document	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing	Tài liệu: Tóm tắt lý thuyết	Tóm tắt các công thức quan trọng	2	0	2026-01-02 00:05:20.274988+07	2026-01-02 00:05:20.274988+07
e3585894-e4cf-440f-8edf-35c8ab25a1eb	d1102143-acce-484e-99aa-8abf44b8c596	document	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing	Tài liệu: Bài tập tự luyện	Bộ bài tập để thực hành	3	0	2026-01-02 00:05:20.274988+07	2026-01-02 00:05:20.274988+07
1a585be8-95ff-4bb1-bde1-50e68038a58d	3d17e280-a06c-4f56-a7f0-a62f2a1e1778	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 1: Định nghĩa hàm số	Giới thiệu khái niệm hàm số và các ví dụ minh họa	0	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
b9d5fc44-56d7-4614-a028-4076819005ba	3d17e280-a06c-4f56-a7f0-a62f2a1e1778	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 2: Tập xác định và tập giá trị	Cách tìm tập xác định và tập giá trị của hàm số	1	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
a1ebd655-6573-4716-a1bc-3befa28c1981	3d17e280-a06c-4f56-a7f0-a62f2a1e1778	document	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing	Tài liệu: Lý thuyết hàm số	Tóm tắt lý thuyết và công thức quan trọng	2	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
cef73545-2c25-42a1-a8e0-7be4a2d0cc00	1232914e-90eb-461f-a621-3f5081700188	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 1: Lý thuyết tính đơn điệu	Định nghĩa hàm đồng biến, nghịch biến	0	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
7547318f-35b1-4e0b-8163-68f9a224a93a	1232914e-90eb-461f-a621-3f5081700188	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 2: Bài tập áp dụng	Hướng dẫn giải các dạng bài tập về tính đơn điệu	1	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
b38770f7-bd88-4c37-8dac-118e4c01da2f	1232914e-90eb-461f-a621-3f5081700188	document	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing	Tài liệu: Bài tập tính đơn điệu	Bộ bài tập từ cơ bản đến nâng cao	2	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
731e8f1d-7c2d-4fee-8810-7033f11c8cc6	6d2bdbdc-314e-470f-89f5-9de3dff034ba	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 1: Định nghĩa cực trị	Khái niệm điểm cực đại, cực tiểu và cách tìm	0	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
8bb70673-6c53-420b-bfbc-220af78cecd4	6d2bdbdc-314e-470f-89f5-9de3dff034ba	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 2: Phương pháp tìm cực trị	Sử dụng đạo hàm để tìm cực trị	1	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
129e674f-9d6f-487d-8a70-5c36466bb806	6d2bdbdc-314e-470f-89f5-9de3dff034ba	document	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing	Tài liệu: Chuyên đề cực trị	Tổng hợp các dạng bài về cực trị	2	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
2c594bcf-c7c9-4ea1-a027-6d499af4ba3a	4acde473-5848-4087-8523-5150af615c79	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 1: Công thức nghiệm	Ôn tập công thức nghiệm và delta	0	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
91116092-781e-41f1-996f-9abd6164a175	4acde473-5848-4087-8523-5150af615c79	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 2: Định lý Vi-et	Ứng dụng định lý Vi-et vào bài toán	1	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
07a44f68-1e23-4473-84b6-dd2f3dc2d7c5	4acde473-5848-4087-8523-5150af615c79	document	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing	Tài liệu: Phương trình bậc hai	Lý thuyết và bài tập tự luyện	2	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
c6d56fcc-2a8d-4f2f-92cb-4d424da9e0da	a8d3e47c-f193-4d3f-9469-b42aa3d4a6f3	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 1: Phương pháp giải	Cách giải bất phương trình bậc hai	0	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
2856ed1e-501f-4091-84c8-13b16b95f9cf	a8d3e47c-f193-4d3f-9469-b42aa3d4a6f3	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 2: Bài tập nâng cao	Các dạng bài khó về bất phương trình	1	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
ef8f6fe4-07a1-42b3-8b9e-02521d6e9bec	a8d3e47c-f193-4d3f-9469-b42aa3d4a6f3	document	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing	Tài liệu: Bất phương trình	Tổng hợp bài tập có lời giải chi tiết	2	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
412abf99-adc4-41c6-84dd-119ff3f5d901	1520350e-cf2a-4776-84b3-49da8352bcd7	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 1: Phương pháp thế	Giải hệ phương trình bằng phương pháp thế	0	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
ab60442f-c01a-4e03-b819-af90ec10d09b	1520350e-cf2a-4776-84b3-49da8352bcd7	video	https://www.youtube.com/embed/S9wF_0pX4i0	Video 2: Phương pháp cộng đại số	Giải hệ phương trình bằng phương pháp cộng	1	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
eecadaf2-b488-4c41-9f87-7b2fa216c536	1520350e-cf2a-4776-84b3-49da8352bcd7	document	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing	Tài liệu: Hệ phương trình	Các phương pháp giải và bài tập	2	0	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07
\.


--
-- TOC entry 5237 (class 0 OID 34738)
-- Dependencies: 226
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (id, chapter_id, title, content, lesson_type, order_index, duration_minutes, is_published, is_preview, created_at, updated_at, video_url) FROM stdin;
3d17e280-a06c-4f56-a7f0-a62f2a1e1778	923e21c4-d7fd-4f9b-8ccc-3070fda6c845	Bài 1: Khái niệm hàm số	Tìm hiểu định nghĩa và các tính chất cơ bản của hàm số	\N	0	0	t	f	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07	\N
1232914e-90eb-461f-a621-3f5081700188	923e21c4-d7fd-4f9b-8ccc-3070fda6c845	Bài 2: Tính đơn điệu của hàm số	Nghiên cứu tính đồng biến, nghịch biến của hàm số	\N	1	0	t	f	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07	\N
c8695edf-17c0-48fe-8ae1-1a6347b997a6	014b8d26-c8b9-4fc6-b39a-22ee67da1cea	Bài 1: Phương trình bậc nhất	Học cách giải phương trình bậc nhất một ẩn và các dạng bài tập cơ bản.	video	0	0	t	f	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07	https://www.youtube.com/embed/S9wF_0pX4i0
31fd2120-72bd-455b-ad60-0abf0ec4ce9f	014b8d26-c8b9-4fc6-b39a-22ee67da1cea	Bài 2: Phương trình bậc hai	Công thức nghiệm, delta, và các dạng bài tập về phương trình bậc hai.	video	1	0	t	f	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07	https://www.youtube.com/embed/S9wF_0pX4i0
136de4c9-ed3f-4bdc-8a53-65e11f20e58b	014b8d26-c8b9-4fc6-b39a-22ee67da1cea	Tài liệu: Bài tập tự luyện Đại số	Tổng hợp bài tập tự luyện về phương trình với lời giải chi tiết.	document	2	0	t	f	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing
4c05bb05-7e31-46f6-a0f8-024d48f3c226	4a53dcb3-03ed-40c1-9be1-22ff5b4b5a3d	Bài 1: Định lý Pythagore	Tìm hiểu định lý Pythagore và ứng dụng trong tam giác vuông.	video	0	0	t	f	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07	https://www.youtube.com/embed/S9wF_0pX4i0
38e2030c-1c6d-4cb1-8634-00f0da23c0ab	4a53dcb3-03ed-40c1-9be1-22ff5b4b5a3d	Bài 2: Diện tích hình học	Công thức tính diện tích các hình cơ bản: tam giác, tứ giác, hình tròn.	video	1	0	t	f	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07	https://www.youtube.com/embed/S9wF_0pX4i0
581b92b1-9432-42da-99b6-32116d12af44	4a53dcb3-03ed-40c1-9be1-22ff5b4b5a3d	Bài 3: Thể tích khối đa diện	Cách tính thể tích hình hộp, hình lăng trụ, hình chóp.	video	2	0	t	f	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07	https://www.youtube.com/embed/S9wF_0pX4i0
74d5827c-539b-4225-bad9-a366e7faf489	d3f6dcd6-5e6a-4ef5-99dd-15e58fd2543d	Đề 1: Tổng hợp kiến thức	Giải chi tiết đề thi tổng hợp các chủ đề đã học.	video	0	0	t	f	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07	https://www.youtube.com/embed/S9wF_0pX4i0
45e4dbd1-7d64-426a-8210-d130e339f5f5	d3f6dcd6-5e6a-4ef5-99dd-15e58fd2543d	Tài liệu: Đề thi thử	Bộ đề thi thử kèm đáp án chi tiết để ôn luyện.	document	1	0	t	f	2026-01-01 23:42:01.405727+07	2026-01-01 23:42:01.405727+07	https://drive.google.com/file/d/11kn5QbcJvLqhI-CX-QfcGhevqT-ruEjF/view?usp=sharing
d1102143-acce-484e-99aa-8abf44b8c596	014b8d26-c8b9-4fc6-b39a-22ee67da1cea	Bài 3: Phương trình nâng cao (Multi-resource demo)	Bài học mẫu với nhiều video và tài liệu	\N	10	0	t	f	2026-01-02 00:05:20.274988+07	2026-01-02 00:05:20.274988+07	\N
6d2bdbdc-314e-470f-89f5-9de3dff034ba	923e21c4-d7fd-4f9b-8ccc-3070fda6c845	Bài 3: Cực trị của hàm số	Tìm hiểu về điểm cực đại, cực tiểu của hàm số	\N	2	0	t	f	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07	\N
4acde473-5848-4087-8523-5150af615c79	913dd954-932a-4d8d-9cf0-3945b820509f	Bài 1: Phương trình bậc hai	Ôn tập và nâng cao về phương trình bậc hai	\N	0	0	t	f	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07	\N
a8d3e47c-f193-4d3f-9469-b42aa3d4a6f3	913dd954-932a-4d8d-9cf0-3945b820509f	Bài 2: Bất phương trình bậc hai	Giải và biện luận bất phương trình bậc hai	\N	1	0	t	f	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07	\N
1520350e-cf2a-4776-84b3-49da8352bcd7	913dd954-932a-4d8d-9cf0-3945b820509f	Bài 3: Hệ phương trình	Giải hệ phương trình hai ẩn	\N	2	0	t	f	2026-01-02 00:12:08.010832+07	2026-01-02 00:12:08.010832+07	\N
\.


--
-- TOC entry 5233 (class 0 OID 34668)
-- Dependencies: 222
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, expires_at) FROM stdin;
\.


--
-- TOC entry 5240 (class 0 OID 34856)
-- Dependencies: 229
-- Data for Name: pending_enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pending_enrollments (id, course_id, email, invited_by, invited_at, is_active) FROM stdin;
\.


--
-- TOC entry 5232 (class 0 OID 34643)
-- Dependencies: 221
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, token, user_id, expires_at, revoked, created_at) FROM stdin;
742a3cd6-5916-4859-885a-d9a04579182f	79038098-6c1f-408c-b731-22fa5dbb0fe9	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	2026-01-01 21:18:05.303+07	t	2026-01-01 21:03:05.304178+07
65bc6028-0200-4d4b-bf50-310eee983a0f	20f5f18a-2a15-479e-8702-8683b3deff83	9c1e161d-a5fb-4021-8eaf-602e15b0cae0	2026-01-01 22:22:00.824+07	f	2026-01-01 22:07:00.827053+07
\.


--
-- TOC entry 5231 (class 0 OID 34625)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, full_name, date_of_birth, email, phone, address, image, email_verified, created_at, updated_at) FROM stdin;
b23888a1-434b-4fb9-bdb7-392d2e98f444	system_teacher	$2b$10$EpOd.sQp/WfGzY.Q/WfGzY.Q/WfGzY.Q/WfGzY.Q/WfGzY.Q	teacher	Giáo Viên Hệ Thống	\N	system_teacher@example.com	\N	\N	\N	\N	2026-01-01 23:06:15.376845+07	2026-01-01 23:06:15.376845+07
9c1e161d-a5fb-4021-8eaf-602e15b0cae0	dinhviet	$2b$10$ay30hVE/sS/4E5qIhgiKs.hIAVCq1Qr3tBAuExrjEU1rgXk6xyCO.	student	Đinh Việt	\N	vietphamdinhvanhust@gmail.com			https://res.cloudinary.com/dfbsdiq9p/image/upload/v1767277201/qxhd0gx7piyhzi7qianz.png	2026-01-01 21:02:57.418712	2026-01-01 21:02:28.617461+07	2026-01-01 23:08:14.889578+07
102da1fe-20ed-41ff-ba95-fe4b349046e8	dainnabaddon	$2b$10$IvWvXtvI9Ir7k3nVzeSekuboABsWUEB1VZclXHj6gmea6IKQt/8du	student	Thao Nguyen Viet	\N	dainnabaddon@gmail.com	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocIOrOSCj6gTKMDICUNi5HHMvRjAn4lsI1i1CVebpQuqaY2ZaMs=s96-c	2026-01-02 00:27:25.749734	2026-01-02 00:27:25.749734+07	2026-01-02 00:27:25.749734+07
\.


--
-- TOC entry 5234 (class 0 OID 34678)
-- Dependencies: 223
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_tokens (identifier, token, expires_at) FROM stdin;
\.


--
-- TOC entry 5021 (class 2606 OID 34730)
-- Name: chapters chapters_course_id_order_index_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_course_id_order_index_key UNIQUE (course_id, order_index);


--
-- TOC entry 5023 (class 2606 OID 34728)
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);


--
-- TOC entry 5040 (class 2606 OID 34837)
-- Name: course_enrollments course_enrollments_course_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_course_id_student_id_key UNIQUE (course_id, student_id);


--
-- TOC entry 5042 (class 2606 OID 34835)
-- Name: course_enrollments course_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 34705)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- TOC entry 5017 (class 2606 OID 34925)
-- Name: courses courses_title_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_title_unique UNIQUE (title);


--
-- TOC entry 5033 (class 2606 OID 34808)
-- Name: enrollment_codes enrollment_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment_codes
    ADD CONSTRAINT enrollment_codes_code_key UNIQUE (code);


--
-- TOC entry 5035 (class 2606 OID 34806)
-- Name: enrollment_codes enrollment_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment_codes
    ADD CONSTRAINT enrollment_codes_pkey PRIMARY KEY (id);


--
-- TOC entry 5055 (class 2606 OID 34895)
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 5057 (class 2606 OID 34897)
-- Name: lesson_progress lesson_progress_student_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_student_id_lesson_id_key UNIQUE (student_id, lesson_id);


--
-- TOC entry 5061 (class 2606 OID 34949)
-- Name: lesson_resources lesson_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_resources
    ADD CONSTRAINT lesson_resources_pkey PRIMARY KEY (id);


--
-- TOC entry 5029 (class 2606 OID 34758)
-- Name: lessons lessons_chapter_id_order_index_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_chapter_id_order_index_key UNIQUE (chapter_id, order_index);


--
-- TOC entry 5031 (class 2606 OID 34756)
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- TOC entry 5011 (class 2606 OID 34677)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email, token);


--
-- TOC entry 5049 (class 2606 OID 34869)
-- Name: pending_enrollments pending_enrollments_course_id_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pending_enrollments
    ADD CONSTRAINT pending_enrollments_course_id_email_key UNIQUE (course_id, email);


--
-- TOC entry 5051 (class 2606 OID 34867)
-- Name: pending_enrollments pending_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pending_enrollments
    ADD CONSTRAINT pending_enrollments_pkey PRIMARY KEY (id);


--
-- TOC entry 5009 (class 2606 OID 34656)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 34640)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5005 (class 2606 OID 34642)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5013 (class 2606 OID 34687)
-- Name: verification_tokens verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (identifier, token);


--
-- TOC entry 5024 (class 1259 OID 34736)
-- Name: idx_chapters_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chapters_course_id ON public.chapters USING btree (course_id);


--
-- TOC entry 5025 (class 1259 OID 34737)
-- Name: idx_chapters_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chapters_order ON public.chapters USING btree (course_id, order_index);


--
-- TOC entry 5043 (class 1259 OID 34853)
-- Name: idx_course_enrollments_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments USING btree (course_id);


--
-- TOC entry 5044 (class 1259 OID 34855)
-- Name: idx_course_enrollments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_enrollments_status ON public.course_enrollments USING btree (status);


--
-- TOC entry 5045 (class 1259 OID 34854)
-- Name: idx_course_enrollments_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_enrollments_student_id ON public.course_enrollments USING btree (student_id);


--
-- TOC entry 5018 (class 1259 OID 34712)
-- Name: idx_courses_is_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_is_published ON public.courses USING btree (is_published) WHERE (is_published = true);


--
-- TOC entry 5019 (class 1259 OID 34711)
-- Name: idx_courses_teacher_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_teacher_id ON public.courses USING btree (teacher_id);


--
-- TOC entry 5036 (class 1259 OID 34821)
-- Name: idx_enrollment_codes_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enrollment_codes_active ON public.enrollment_codes USING btree (is_active, expires_at) WHERE (is_active = true);


--
-- TOC entry 5037 (class 1259 OID 34820)
-- Name: idx_enrollment_codes_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enrollment_codes_code ON public.enrollment_codes USING btree (code);


--
-- TOC entry 5038 (class 1259 OID 34819)
-- Name: idx_enrollment_codes_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enrollment_codes_course_id ON public.enrollment_codes USING btree (course_id);


--
-- TOC entry 5052 (class 1259 OID 34909)
-- Name: idx_lesson_progress_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress USING btree (lesson_id);


--
-- TOC entry 5053 (class 1259 OID 34908)
-- Name: idx_lesson_progress_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lesson_progress_student_id ON public.lesson_progress USING btree (student_id);


--
-- TOC entry 5058 (class 1259 OID 34955)
-- Name: idx_lesson_resources_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lesson_resources_lesson_id ON public.lesson_resources USING btree (lesson_id);


--
-- TOC entry 5059 (class 1259 OID 34956)
-- Name: idx_lesson_resources_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lesson_resources_order ON public.lesson_resources USING btree (lesson_id, order_index);


--
-- TOC entry 5026 (class 1259 OID 34764)
-- Name: idx_lessons_chapter_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_chapter_id ON public.lessons USING btree (chapter_id);


--
-- TOC entry 5027 (class 1259 OID 34765)
-- Name: idx_lessons_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_order ON public.lessons USING btree (chapter_id, order_index);


--
-- TOC entry 5046 (class 1259 OID 34880)
-- Name: idx_pending_enrollments_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pending_enrollments_course_id ON public.pending_enrollments USING btree (course_id);


--
-- TOC entry 5047 (class 1259 OID 34881)
-- Name: idx_pending_enrollments_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pending_enrollments_email ON public.pending_enrollments USING btree (email);


--
-- TOC entry 5006 (class 1259 OID 34664)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 5007 (class 1259 OID 34665)
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 5000 (class 1259 OID 34663)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5001 (class 1259 OID 34662)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 5080 (class 2620 OID 34922)
-- Name: enrollment_codes generate_enrollment_code_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER generate_enrollment_code_trigger BEFORE INSERT ON public.enrollment_codes FOR EACH ROW EXECUTE FUNCTION public.generate_enrollment_code();


--
-- TOC entry 5082 (class 2620 OID 34958)
-- Name: lesson_resources trigger_update_lesson_resources_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_lesson_resources_updated_at BEFORE UPDATE ON public.lesson_resources FOR EACH ROW EXECUTE FUNCTION public.update_lesson_resources_updated_at();


--
-- TOC entry 5078 (class 2620 OID 34911)
-- Name: chapters update_chapters_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5077 (class 2620 OID 34910)
-- Name: courses update_courses_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5081 (class 2620 OID 34914)
-- Name: enrollment_codes update_enrollment_codes_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_enrollment_codes_updated_at BEFORE UPDATE ON public.enrollment_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5079 (class 2620 OID 34912)
-- Name: lessons update_lessons_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5076 (class 2620 OID 34667)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5064 (class 2606 OID 34731)
-- Name: chapters chapters_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5068 (class 2606 OID 34838)
-- Name: course_enrollments course_enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5069 (class 2606 OID 34848)
-- Name: course_enrollments course_enrollments_enrollment_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_enrollment_code_id_fkey FOREIGN KEY (enrollment_code_id) REFERENCES public.enrollment_codes(id) ON DELETE SET NULL;


--
-- TOC entry 5070 (class 2606 OID 34843)
-- Name: course_enrollments course_enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5063 (class 2606 OID 34706)
-- Name: courses courses_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5066 (class 2606 OID 34809)
-- Name: enrollment_codes enrollment_codes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment_codes
    ADD CONSTRAINT enrollment_codes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5067 (class 2606 OID 34814)
-- Name: enrollment_codes enrollment_codes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment_codes
    ADD CONSTRAINT enrollment_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5073 (class 2606 OID 34903)
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- TOC entry 5074 (class 2606 OID 34898)
-- Name: lesson_progress lesson_progress_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5075 (class 2606 OID 34950)
-- Name: lesson_resources lesson_resources_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_resources
    ADD CONSTRAINT lesson_resources_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- TOC entry 5065 (class 2606 OID 34759)
-- Name: lessons lessons_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- TOC entry 5071 (class 2606 OID 34870)
-- Name: pending_enrollments pending_enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pending_enrollments
    ADD CONSTRAINT pending_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5072 (class 2606 OID 34875)
-- Name: pending_enrollments pending_enrollments_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pending_enrollments
    ADD CONSTRAINT pending_enrollments_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id);


--
-- TOC entry 5062 (class 2606 OID 34657)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-01-02 03:05:56

--
-- PostgreSQL database dump complete
--

\unrestrict Dd9GyerWEKr02eWtW772EoWdq3dLDtaEpEfxrJ1cu3EkUpSdelvjSscL6OJWkNP

