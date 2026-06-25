# Hướng Dẫn Từng Bước Deploy Qua Pull Request (Thủ Công & An Toàn)

Tài liệu này hướng dẫn chi tiết từng bước bằng hình ảnh và hành động thực tế để bạn tự thực hiện đưa code từ máy cá nhân lên môi trường chạy thực tế (Production VPS) thông qua Pull Request.

---

## Bước 1: Tạo Pull Request (PR) trên GitHub

1. Truy cập liên kết so sánh nhánh đã tạo sẵn:
   👉 **[Tạo Pull Request sang Repo gốc](https://github.com/Aizenworld69/landing-page/compare/main...hoaibao3112:landing-page:main)**
2. Nhấn nút màu xanh lá **`Create pull request`** trên màn hình.
3. Nhập các thông tin cơ bản:
   * **Title (Tiêu đề)**: Đặt tên ngắn gọn, dễ hiểu (ví dụ: `chore: đổi chữ PTIT thành PTTC`).
   * **Description (Mô tả)**: Ghi chú ngắn gọn các thay đổi nếu cần thiết.
4. Nhấn nút **`Create pull request`** (nút màu xanh lá ở góc phải dưới khung mô tả) để hoàn tất gửi yêu cầu gộp code.

---

## Bước 2: Duyệt và Merge (Gộp) Pull Request (Dành cho Admin)

1. Truy cập vào mục **[Pull Requests](https://github.com/Aizenworld69/landing-page/pulls)** trên repository gốc (`Aizenworld69/landing-page`).
2. Chọn Pull Request mà bạn vừa tạo ở Bước 1.
3. Kéo xuống cuối trang, nhấn nút màu xanh lá **`Merge pull request`**.
4. Nhấn tiếp nút xác nhận màu xanh **`Confirm merge`** để hoàn tất việc gộp code vào nhánh `main` của repo gốc.

---

## Bước 3: Giám sát tiến trình Deploy tự động (CI/CD)

Khi PR được merge vào nhánh `main`, hệ thống **GitHub Actions** sẽ tự động thực hiện deploy lên VPS. Bạn không cần làm gì thêm trên VPS mà chỉ cần theo dõi tiến trình:

1. Truy cập trang giám sát: 👉 **[GitHub Actions - Deploy to VPS](https://github.com/Aizenworld69/landing-page/actions)**
2. Bạn sẽ thấy một tiến trình mới đang chạy với biểu tượng **Màu vàng xoay tròn** 🟡.
3. Đợi khoảng **1 - 2 phút**:
   * ✅ **Chuyển màu xanh lá**: Deploy thành công!
   * ❌ **Chuyển màu đỏ**: Gặp lỗi (Nhấn vào tiến trình để xem chi tiết log lỗi).

---

## Bước 4: Kiểm tra trang web thực tế

Do các trình duyệt thường lưu cache Next.js rất mạnh, sau khi thấy deploy báo xanh lá ✅, hãy kiểm tra theo cách sau:

1. Truy cập liên kết chính thức: **[http://checkin.aizenworld.com](http://checkin.aizenworld.com)**
2. Nhấn tổ hợp phím **`Ctrl + F5`** (trên Windows) hoặc **`Cmd + Shift + R`** (trên macOS) để ép trình duyệt xóa cache cũ và tải giao diện mới nhất.
3. Kiểm tra xem chữ **PTIT** ở phần địa chỉ đã được đổi thành **PTTC** hay chưa.
