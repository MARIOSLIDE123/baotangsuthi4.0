# Sử Thi Số 4.0 – Bảo Tàng Sử Thi Xuyên Không

Bảo tàng sử thi kỹ thuật số tích hợp không gian 3D (Babylon.js) và Trợ lý AI sư phạm (Gemini API) hỗ trợ học tập và phát triển năng lực đọc hiểu sử thi cho học sinh lớp 10.

---

## 🚀 Tính năng nổi bật
- **Không gian 3D Trải nghiệm**:
  - Không gian Nhà dài Ê-đê 3D tương tác.
  - Bản đồ 3D Hành trình Đăm Săn đi bắt Nữ thần Mặt Trời.
- **Trợ lý AI sư phạm "Sứ Giả Đại Ngàn"**:
  - Tích hợp Google Gemini API với hệ thống Rate Limiting bảo vệ ngân sách.
  - Chấm điểm và phản hồi theo Rubric 3 thành phần (Chiếc La Bàn Sử Thi & Đấu Trường Anh Hùng Ca).
  - Dự phòng chế độ Rubric cục bộ khi chưa nạp API Key.
- **Studio Hoạt Động & STEM**:
  - Triển lãm Padlet tích hợp mã QR.
  - Bản đồ văn hóa sử thi Việt Nam và thế giới.

---

## 🛠 Hướng dẫn chạy Local (Phát triển)

1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```
2. **Cấu hình biến môi trường**:
   Sao chép `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
   Điền khóa `GEMINI_API_KEY` của bạn vào `.env`.

3. **Khởi chạy ứng dụng**:
   ```bash
   npm run dev
   ```
   Truy cập: [http://localhost:3000](http://localhost:3000)

4. **Kiểm tra bản build sản phẩm**:
   ```bash
   npm run build
   ```

---

## 🌐 Triển khai lên Vercel (Deployment)

Dự án đã được cấu hình sẵn sàng 100% cho Vercel thông qua:
- `vercel.json`: Tự động định tuyến Single Page Application (SPA) và Serverless API.
- `api/index.ts` & `api/app.ts`: Vercel Serverless Function xử lý toàn bộ endpoint backend (`/api/ai/*`, `/api/health`, `/api/config/status`).
- `.npmrc`: Đảm bảo quy trình cài đặt phụ thuộc trên Vercel build server diễn ra trơn tru.

### Các bước triển khai qua giao diện Vercel:
1. Đẩy mã nguồn lên GitHub (xem hướng dẫn bên dưới).
2. Đăng nhập vào [Vercel Dashboard](https://vercel.com).
3. Nhấn **Add New...** -> **Project**, sau đó chọn Repository GitHub vừa tạo.
4. Cấu hình **Environment Variables** (Biến môi trường) trên Vercel:
   - `GEMINI_API_KEY`: Khóa API Gemini của bạn (lấy tại [Google AI Studio](https://aistudio.google.com)).
   - *(Tùy chọn)* `PADLET_HOUSE_EMBED_URL`, `PADLET_JOURNEY_EMBED_URL`, `PADLET_BOARD_URL`: Link nhúng bảng Padlet nếu có.
5. Nhấn **Deploy**. Vercel sẽ tự động build và cung cấp tên miền `https://<ten-du-an>.vercel.app` trực tiếp!
