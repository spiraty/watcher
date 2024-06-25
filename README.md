# Watcher

- Dự án scan dữ liệu video để lấy các thông số như lượt view, lượt like. Sử dụng CMS Directus.
- **Flow đã chốt**: Chức năng/flow chính: **[1]** Người dùng, **[2]** Tạo scraper collection, **[3]** import danh sách video cần đọc, **[4]** đọc thông tin, hiển thị trên grid, export ra excel.

## 1. Khởi chạy

- Khởi chạy ứng dụng từ thư mục cms/api `npx directus start`.
- Khởi chạy một ứng dụng từ thư mục cms `pnpm --filter api dev`.
