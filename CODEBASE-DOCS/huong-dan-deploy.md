# Hướng Dẫn Quy Trình Deploy Chuẩn Bằng Docker (Tránh Lỗi 502 / Tràn RAM VPS)

Tài liệu này hướng dẫn chi tiết các bước code, kiểm tra và đẩy code triển khai (deploy) ứng dụng tự động bằng Docker thông qua GitHub Actions nhằm phòng tránh tuyệt đối lỗi **502 Bad Gateway** và lỗi **Tràn RAM (Out of Memory - OOM)** trên máy chủ VPS.

---

## 1. Giới thiệu hệ thống Deploy mới bằng Docker

*   **Tại sao trước đây bị lỗi 502?**
    Trước đây, việc biên dịch code (`npm run build` hoặc `pnpm build`) được thực hiện trực tiếp trên VPS. Khi dự án cài thêm các thư viện nặng, quá trình build ngốn sạch RAM của VPS, khiến hệ điều hành tự động tắt (kill) tiến trình NodeJS để bảo vệ máy chủ -> Nginx mất kết nối đến NodeJS và trả về lỗi **502 Bad Gateway**.
*   **Hệ thống mới giải quyết thế nào?**
    1.  **Biên dịch trên Cloud**: Quá trình biên dịch mã nguồn và đóng gói được chuyển hoàn toàn sang máy ảo của GitHub Actions (cấu hình RAM/CPU mạnh mẽ).
    2.  **VPS chạy tải nhẹ**: VPS chỉ làm nhiệm vụ tải gói Docker Image đã build sẵn về và chạy. Lượng RAM tiêu thụ cực kỳ ít và ổn định, **loại bỏ 100% lỗi treo/sập VPS (502) khi deploy**.

---

## 2. Quy trình kiểm tra dưới local (Local Testing)

Trước khi đẩy code lên server, hãy kiểm tra ở máy local theo các bước sau:

### Bước 1: Code và chạy thử chế độ Development
Chạy dự án trực tiếp bằng Node.js máy local để có tốc độ hot-reload nhanh nhất:
```bash
npm run dev
```
Kiểm tra tính năng tại địa chỉ: `http://localhost:20000`.

### Bước 2: Build và chạy thử Docker local (Nếu muốn kiểm tra container)
Đảm bảo phần mềm **Docker Desktop** đã được mở, sau đó chạy các lệnh:
1.  **Build Image Docker nội bộ**:
    ```bash
    docker build -t landing-page:local .
    ```
    *(Nhờ có file `.dockerignore`, dung lượng truyền file chỉ khoảng 13MB nên bước này sẽ chạy rất nhanh).*
2.  **Khởi chạy Container thử nghiệm**:
    ```bash
    docker run -d -p 20001:20000 --name landing-page-test -v d:/TrangWebCongTy/landing-page/registrations.db:/app/registrations.db landing-page:local
    ```
    *   Truy cập **`http://localhost:20001`** trên trình duyệt để kiểm tra web chạy trong Docker.
3.  **Dọn dẹp sau khi kiểm tra xong**:
    ```bash
    docker stop landing-page-test
    docker rm landing-page-test
    ```

---

## 3. Quy trình Đẩy Code & Deploy Lên VPS

Tùy thuộc vào tài khoản GitHub bạn đang sử dụng, hãy chọn 1 trong 2 cách dưới đây:

### Cách 1: Quy trình nhanh dành cho tài khoản Admin (`Aizenworld69`)
Nếu bạn đang sử dụng tài khoản Admin của dự án, bạn có thể đẩy code trực tiếp lên repository gốc:
```bash
git add .
git commit -m "feat: mô tả tính năng mới"
git push origin main
```
*Ngay sau khi lệnh push thành công, hệ thống GitHub Actions sẽ tự động kích hoạt tiến trình đóng gói và deploy lên VPS.*

### Cách 2: Quy trình chuẩn qua Pull Request (Dành cho tài khoản cộng tác viên / fork)
Nếu sử dụng tài khoản cá nhân, hãy thực hiện qua các bước sau để đảm bảo an toàn:
1.  **Push code lên GitHub cá nhân (fork)**:
    ```bash
    git add .
    git commit -m "feat: mô tả tính năng mới"
    git push fork main
    ```
2.  **Tạo Pull Request (PR)**:
    Truy cập liên kết so sánh và nhấn nút xanh lá `Create pull request`:
    👉 **[Tạo Pull Request sang Repo gốc](https://github.com/Aizenworld69/landing-page/compare/main...hoaibao3112:landing-page:main)**
3.  **Merge Pull Request**:
    Sử dụng tài khoản Admin duyệt và bấm `Merge pull request` -> `Confirm merge` trên GitHub để tiến trình deploy tự động bắt đầu.

---

## 4. Cách giám sát tiến trình Deploy và kiểm tra trang web

1.  **Giám sát trên GitHub**:
    Truy cập mục **[GitHub Actions](https://github.com/Aizenworld69/landing-page/actions)** của repo gốc để xem tiến trình:
    *   🟡 **Màu vàng xoay**: Đang build Docker và deploy (thường mất khoảng 1 - 2 phút).
    *   ✅ **Màu xanh lá (Success)**: Đã deploy thành công lên VPS.
    *   ❌ **Màu đỏ (Failed)**: Deploy thất bại (nhấn vào để xem chi tiết lỗi).
2.  **Xóa cache khi kiểm tra trang web**:
    Sau khi deploy thành công, do trình duyệt lưu cache trang Next.js rất mạnh, bạn cần nhấn tổ hợp phím **`Ctrl + F5`** (hoặc `Ctrl + Shift + R`) hoặc mở cửa sổ ẩn danh để kiểm tra giao diện mới.
    *   Địa chỉ chính thức: **[http://checkin.aizenworld.com](http://checkin.aizenworld.com)**
    *   Trang quản trị: **[http://checkin.aizenworld.com/admin](http://checkin.aizenworld.com/admin)**

---

## 5. Nguyên tắc vàng phòng tránh lỗi 502 trong tương lai

Để giữ cho hệ thống luôn chạy mượt mà và không bao giờ gặp lại lỗi 502:

*   **Không bao giờ chạy build trực tiếp trên VPS**: Tuyệt đối không SSH vào VPS rồi gõ các lệnh `npm run build`, `pnpm build` hay `npm install`. Điều này sẽ vắt kiệt RAM của VPS và làm sập trang web ngay lập tức. Mọi tác vụ build hãy để Docker và GitHub Actions tự động thực hiện trên Cloud.
*   **Bảo vệ file `.dockerignore`**: File [.dockerignore](file:///d:/TrangWebCongTy/landing-page/.dockerignore) ở thư mục gốc có vai trò cực kỳ quan trọng trong việc chặn các thư mục nặng như `node_modules` và `.next` nạp vào Docker. Không được xóa hoặc chỉnh sửa sai file này để đảm bảo tốc độ build luôn nhanh nhất.
*   **Quản lý thư viện chặt chẽ**: Hạn chế cài đặt các thư viện quá nặng. Khi bắt buộc sử dụng thư viện nặng (như `exceljs`), hãy sử dụng kỹ thuật **Dynamic Import** để tránh làm phình to dung lượng tải trang. Tham khảo chi tiết tại: [Tài liệu Tối ưu hóa Dependencies](file:///d:/TrangWebCongTy/landing-page/CODEBASE-DOCS/toi-uu-dependencies.md).
