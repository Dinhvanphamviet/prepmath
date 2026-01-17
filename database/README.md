# PrepMath Database Schema

## Tổng quan
Database schema cho nền tảng học tập PrepMath.

## Cấu trúc bảng

### 1. `users` - Người dùng
Lưu trữ tài khoản học sinh và giáo viên.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | ID duy nhất |
| email | VARCHAR(255) | Email (unique) |
| password_hash | VARCHAR(255) | Mật khẩu đã hash |
| full_name | VARCHAR(255) | Họ tên |
| role | VARCHAR(50) | Vai trò: 'student' hoặc 'teacher' |
| is_verified | BOOLEAN | Trạng thái xác thực email |
| verification_token | VARCHAR(255) | Token xác thực |
| reset_token | VARCHAR(255) | Token reset password |
| reset_token_expires | TIMESTAMP | Hết hạn reset token |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

### 2. `courses` - Khóa học
Danh mục khóa học.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | ID duy nhất |
| teacher_id | UUID | FK → users (giáo viên) |
| title | VARCHAR(255) | Tên khóa học |
| description | TEXT | Mô tả |
| category | VARCHAR(100) | Danh mục |
| level | VARCHAR(50) | Cấp độ: '9', '10', '11', '12', 'HSA' |
| thumbnail_url | TEXT | Ảnh thumbnail |
| is_published | BOOLEAN | Đã xuất bản |
| is_private | BOOLEAN | Riêng tư |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

### 3. `enrollment_codes` - Mã đăng ký
Mã để đăng ký khóa học.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | ID duy nhất |
| course_id | UUID | FK → courses |
| code | VARCHAR(50) | Mã đăng ký (unique) |
| max_uses | INTEGER | Số lần dùng tối đa |
| current_uses | INTEGER | Số lần đã dùng |
| expires_at | TIMESTAMP | Ngày hết hạn |
| created_at | TIMESTAMP | Ngày tạo |

### 4. `course_enrollments` - Đăng ký khóa học
Theo dõi học sinh đăng ký và tiến độ.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | ID duy nhất |
| student_id | UUID | FK → users (học sinh) |
| course_id | UUID | FK → courses |
| status | VARCHAR(50) | Trạng thái: 'active', 'completed', 'dropped' |
| progress | INTEGER | Tiến độ khóa học (0-100%) |
| enrolled_at | TIMESTAMP | Ngày đăng ký |
| completed_at | TIMESTAMP | Ngày hoàn thành |

**Constraint:** UNIQUE(student_id, course_id)

### 5. `chapters` - Chương học
Các chương trong khóa học.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | ID duy nhất |
| course_id | UUID | FK → courses |
| title | VARCHAR(255) | Tên chương |
| description | TEXT | Mô tả |
| order_index | INTEGER | Thứ tự hiển thị |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

### 6. `lessons` - Bài học
Các bài học trong chương.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | ID duy nhất |
| chapter_id | UUID | FK → chapters |
| title | VARCHAR(255) | Tên bài học |
| content | TEXT | Nội dung |
| lesson_type | VARCHAR(50) | Loại: 'video', 'document', 'quiz' |
| duration_minutes | INTEGER | Thời lượng (phút) |
| order_index | INTEGER | Thứ tự hiển thị |
| is_published | BOOLEAN | Đã xuất bản |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

### 7. `lesson_resources` - Tài nguyên bài học
Nhiều tài nguyên (video, PDF) cho mỗi bài học.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | ID duy nhất |
| lesson_id | UUID | FK → lessons |
| resource_type | VARCHAR(50) | Loại: 'video' hoặc 'document' |
| resource_url | TEXT | URL tài nguyên |
| title | VARCHAR(255) | Tên tài nguyên |
| description | TEXT | Mô tả |
| order_index | INTEGER | Thứ tự hiển thị |
| created_at | TIMESTAMP | Ngày tạo |

### 8. `lesson_progress` - Tiến độ bài học
Theo dõi hoàn thành từng bài học.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | ID duy nhất |
| student_id | UUID | FK → users (học sinh) |
| lesson_id | UUID | FK → lessons |
| is_completed | BOOLEAN | Đã hoàn thành |
| completed_at | TIMESTAMP | Ngày hoàn thành |
| last_accessed_at | TIMESTAMP | Lần truy cập cuối |

**Constraint:** UNIQUE(student_id, lesson_id)

## Quan hệ giữa các bảng

```
users (teacher)
  └─> courses
       ├─> enrollment_codes
       ├─> course_enrollments <─ users (student)
       └─> chapters
            └─> lessons
                 ├─> lesson_resources
                 └─> lesson_progress <─ users (student)
```

## Tính năng chính

### 1. Multi-Resource Lessons
Mỗi bài học có thể có nhiều tài nguyên (videos và documents) thông qua bảng `lesson_resources`.

### 2. Progress Tracking
- **Course-level**: `course_enrollments.progress` (0-100%)
- **Lesson-level**: `lesson_progress.is_completed` (boolean)

### 3. Access Control
- Yêu cầu đăng ký qua `course_enrollments`
- Mã đăng ký trong `enrollment_codes`
- Preview chương: Chỉ chương 1 hiển thị cho user chưa đăng ký

### 4. Indexes
Tất cả foreign keys và các cột thường query đều có index để tối ưu performance.

## Cách sử dụng

### Tạo khóa học mới
1. INSERT vào `courses`
2. INSERT vào `chapters`
3. INSERT vào `lessons`
4. INSERT vào `lesson_resources`

### Đăng ký học sinh
1. Validate `enrollment_codes` (nếu cần)
2. INSERT vào `course_enrollments`

### Theo dõi tiến độ
1. UPDATE `lesson_progress.is_completed` khi hoàn thành bài
2. Tính lại `course_enrollments.progress` dựa trên số bài đã hoàn thành

### Kiểm tra quyền truy cập
Check `course_enrollments` để xác định student có quyền truy cập course/lesson không.
