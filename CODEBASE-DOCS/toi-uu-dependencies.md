# Hướng Dẫn Tối Ưu Hóa Dependencies & Tránh Lỗi Quá Tải Server (OOM/502)

Tài liệu này hướng dẫn cách quản lý thư viện (dependencies), tối ưu hóa dung lượng bundle và hạn chế tối đa việc cài đặt các thư viện quá nặng làm sụt giảm hiệu năng hoặc gây lỗi quá tải RAM (**Out of Memory - OOM**) dẫn đến sập web (Lỗi **502 Bad Gateway**) trên máy chủ VPS.

---

## 1. Bối cảnh: Tại sao Server bị sập (Lỗi 502 / OOM)?

Khi triển khai ứng dụng trên các máy chủ VPS cấu hình giới hạn (ví dụ: RAM 1GB - 2GB):
*   **Quá trình Build tốn tài nguyên**: Lệnh `next build` mặc định ngốn rất nhiều RAM để tối ưu hóa code. Nếu dự án có nhiều thư viện lớn, quá trình build sẽ làm cạn kiệt RAM của VPS, khiến hệ điều hành tự động tắt tiến trình NodeJS (chạy ngầm) -> Nginx không kết nối được đến NodeJS và trả về lỗi **502 Bad Gateway**.
*   **Ví dụ thực tế**: Thư viện xử lý PDF `@react-pdf/renderer` hoặc thư viện biểu đồ, Excel lớn khi import trực tiếp ở server sẽ ngốn RAM rất lớn cả lúc build lẫn lúc chạy. Trước đây, project từng bị lỗi OOM do cài đặt các thư viện nặng trực tiếp trên VPS.

---

## 2. Docker & Next.js Standalone Giúp Giải Quyết Như Thế Nào?

Dự án hiện tại đã chuyển sang quy trình triển khai bằng **Docker & Docker Compose**:

1.  **Build trên GitHub Actions (Runner)**:
    *   Tiến trình `npm run build` hoặc `pnpm build` để tạo Docker Image được thực hiện trên các máy ảo của GitHub (Runner có tài nguyên CPU/RAM mạnh mẽ).
    *   Máy chủ VPS không còn phải chạy lệnh build nữa. VPS chỉ việc pull Docker Image đã build sẵn về và restart container. Quy trình này **loại bỏ hoàn toàn lỗi sập nguồn/treo VPS lúc deploy**.
2.  **Next.js Standalone Output**:
    *   Cấu hình `output: 'standalone'` trong [next.config.ts](file:///d:/TrangWebCongTy/landing-page/next.config.ts) giúp Next.js tự động phân tích và **chỉ sao chép những file/thư viện thực sự được import và sử dụng trong code** vào thư mục chạy chính thức.
    *   Những thư viện cài vào nhưng không dùng (`unused dependencies`) sẽ tự động bị loại bỏ khỏi thư mục production của Docker container, giúp giảm dung lượng bộ nhớ sử dụng.

---

## 3. Các Nguyên Tắc Vàng Khi Chọn và Cài Đặt Thư Viện

Để đảm bảo trang web chạy mượt mà trên cả môi trường local lẫn VPS, hãy tuân thủ 5 nguyên tắc sau:

### Nguyên tắc 1: Kiểm tra dung lượng thư viện trước khi cài đặt
Trước khi chạy lệnh cài đặt thư viện nào đó, hãy truy cập trang **[Bundlephobia](https://bundlephobia.com/)** và nhập tên thư viện để kiểm tra:
*   Dung lượng tải về (Bundle size).
*   Độ sâu của danh sách thư viện con đi kèm (Dependency tree).
*   *Quy tắc ngón tay cái*: Tránh cài các thư viện có dung lượng bundle lớn hơn **100KB** trừ khi thực sự bắt buộc.

### Nguyên tắc 2: Phân biệt rõ `dependencies` và `devDependencies`
*   **`dependencies`**: Thư viện cần thiết để ứng dụng chạy ở production (Ví dụ: `better-sqlite3`, `lucide-react`, `next`).
*   **`devDependencies`**: Thư viện chỉ cần khi code ở local hoặc khi build (Ví dụ: `typescript`, `tailwindcss`, `eslint`, `@types/*`).
*   *Cách làm chuẩn*: Luôn dùng cờ `-D` (hoặc `--save-dev`) khi cài các công cụ hỗ trợ code, ví dụ:
    ```bash
    npm install -D @types/file-saver eslint
    ```
    Docker multi-stage build sẽ loại bỏ hoàn toàn các `devDependencies` này khỏi production container, giúp container cực kỳ nhẹ.

### Nguyên tắc 3: Sử dụng các thư viện thay thế nhẹ hơn (Lightweight Alternatives)
Nếu bắt buộc phải xử lý một tính năng nặng, hãy tìm các thư viện thay thế nhẹ hơn:

| Thư viện nặng (Tránh dùng) | Dung lượng | Thư viện nhẹ thay thế (Nên dùng) | Dung lượng |
| :--- | :--- | :--- | :--- |
| **`moment`** | ~72 KB | **`dayjs`** hoặc **`date-fns`** | ~2 KB / Modular |
| **`lodash`** | ~25 KB | Viết trực tiếp ES6 hoặc **`lodash-es`** | Modular |
| **`@react-pdf/renderer`** | Cực nặng | Xuất PDF ở Client thông qua **`html2pdf.js`** hoặc **`jsPDF`** | Chỉ load khi click |

### Nguyên tắc 4: Tách biệt import (Tree Shaking)
Đừng import cả thư viện nếu bạn chỉ cần dùng một phần nhỏ của nó.
*   **❌ Sai (Làm phình to bundle)**:
    ```typescript
    import _ from 'lodash';
    const activeUsers = _.filter(users, { active: true });
    ```
*   **✅ Đúng (Chỉ import phần cần dùng)**:
    ```typescript
    import filter from 'lodash/filter';
    const activeUsers = filter(users, { active: true });
    ```

### Nguyên tắc 5: Sử dụng Dynamic Import (Lazy Loading) cho thư viện nặng
Nếu ứng dụng bắt buộc phải dùng một thư viện nặng (Ví dụ: `exceljs` để xuất file excel trong trang admin), không nên import ở đầu file. Hãy import động trong hàm xử lý để chỉ tải thư viện khi người dùng thực hiện thao tác (Click nút Export).

*   **Ví dụ áp dụng cho dự án (Xuất Excel với `exceljs`)**:
    ```typescript
    // ❌ Không nên import ở đầu file:
    // import ExcelJS from 'exceljs';
    
    // ✅ Nên import động trực tiếp trong hàm click:
    export async function handleExportExcel(data: any[]) {
      // Chỉ tải thư viện exceljs khi hàm này được gọi
      const { default: ExcelJS } = await import('exceljs');
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Registrations');
      
      // ... tiến hành ghi dữ liệu vào worksheet ...
      
      const buffer = await workbook.xlsx.writeBuffer();
      // ... lưu file ...
    }
    ```

---

## 4. Cách Phân Tích & Giám Sát Dung Lượng Bundle

Để biết thư viện nào đang chiếm nhiều dung lượng nhất trong mã nguồn của bạn:

1.  **Cài đặt công cụ phân tích (chỉ ở môi trường phát triển)**:
    ```bash
    npm install -D @next/bundle-analyzer
    ```
2.  **Cấu hình trong `next.config.ts`**:
    ```typescript
    import bundleAnalyzer from '@next/bundle-analyzer';
    
    const withBundleAnalyzer = bundleAnalyzer({
      enabled: process.env.ANALYZE === 'true',
    });
    
    const nextConfig = {
      output: 'standalone',
      // ... các cấu hình khác
    };
    
    export default withBundleAnalyzer(nextConfig);
    ```
3.  **Chạy lệnh phân tích**:
    ```bash
    # Trên Windows (PowerShell)
    $env:ANALYZE="true"; npm run build
    
    # Trên Linux/macOS hoặc Git Bash
    ANALYZE=true npm run build
    ```
    Hệ thống sẽ tự động mở 2 trang HTML trong trình duyệt hiển thị biểu đồ trực quan (Treemap) về dung lượng của từng file và thư viện trong dự án. Bạn có thể dễ dàng nhìn ra thư viện nào quá nặng để thay thế hoặc tối ưu.
