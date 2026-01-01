# Hướng dẫn triển khai (Deployment Guide)

Tài liệu này hướng dẫn bạn cách đưa ứng dụng PrepMath lên môi trường production sử dụng **Neon** (Database) và **Vercel** (Frontend/Backend).

## 1. Chuẩn bị Cơ sở dữ liệu (Neon.tech)

1. **Tạo tài khoản & Project**:
   - Truy cập [Neon.tech](https://neon.tech/) và tạo một project mới (chọn region gần Việt Nam như `Singapore`).
2. **Lấy Connection String**:
   - Trong dashboard của Neon, sao chép chuỗi kết nối (Connection String). Nó sẽ có dạng:
     `postgres://user:password@subdomain.neon.tech/neondb?sslmode=require`
3. **Chạy SQL Setup**:
   - Vào tab **SQL Editor** trên Neon.
   - Mở file `database/setup.sql` trong project của bạn, copy toàn bộ nội dung và dán vào SQL Editor của Neon rồi nhấn **Run**.
   - Việc này sẽ tạo đầy đủ các bảng và logic cần thiết.

## 2. Triển khai ứng dụng (Vercel)

1. **Đưa code lên GitHub/GitLab**:
   - Nếu chưa làm, hãy tạo repo và push code hiện tại lên.
2. **Tạo Project trên Vercel**:
   - Truy cập [Vercel.com](https://vercel.com/) và import project từ GitHub.
3. **Cấu hình Environment Variables**:
   - Trong quá trình import (hoặc vào Settings > Environment Variables), hãy thêm các biến sau:
     | Tên Biến | Giá trị |
     | :--- | :--- |
     | `POSTGRES_URL` | Dán Connection String từ Neon vào đây |
     | `AUTH_SECRET` | Chạy lệnh `openssl rand -base64 32` trong terminal để tạo 1 chuỗi ngẫu nhiên |
     | `GOOGLE_CLIENT_ID` | Client ID từ Google Cloud Console (nếu dùng Login Google) |
     | `GOOGLE_CLIENT_SECRET` | Client Secret từ Google Cloud Console |
     | `NEXTAUTH_URL` | URL của trang web của bạn (ví dụ: `https://prepmath.vercel.app`) |
4. **Deploy**:
   - Nhấn **Deploy** và đợi Vercel hoàn tất quá trình build.

## 3. Lưu ý quan trọng (Production Checklist)

> [!IMPORTANT]
> **Next.js Middleware & Auth**:
> Đảm bảo biến `AUTH_SECRET` đã được set, nếu không Auth.js sẽ không hoạt động trên production.

> [!TIP]
> **Cloudinary**:
> Nếu bạn sử dụng ảnh khóa học từ Cloudinary, đừng quên whitelist domain `res.cloudinary.com` trong `next.config.ts` (mình đã làm phần này cho bạn rồi).

> [!WARNING]
> **Google OAuth**:
> Bạn cần vào [Google Cloud Console](https://console.cloud.google.com/), cập nhật **Authorized redirect URIs** thành:
> `https://your-app-domain.vercel.app/api/auth/callback/google`

## 4. Kiểm tra sau khi Deploy

- Truy cập link `.vercel.app` do Vercel cung cấp.
- Thử đăng ký tài khoản mới.
- Thử đăng ký khóa học bằng mã code.
- Kiểm tra xem ảnh khóa học có hiển thị đúng không.

---
*Chúc mừng bạn đã đưa PrepMath lên môi trường toàn cầu!* 🚀
