# Watcher

- Dự án scan dữ liệu video để lấy các thông số như lượt view, lượt like. Sử dụng CMS Directus.
- **Flow đã chốt**: Chức năng/flow chính: **[1]** Người dùng, **[2]** Tạo scraper collection, **[3]** import danh sách video cần đọc, **[4]** đọc thông tin, hiển thị trên grid, export ra excel.

## 1. Khởi chạy

- Directus không sử dụng `yarn` hay `npm` mà sử dụng `pnpm` để làm package manager.
- Để khởi chạy cả **api** và **admin** thì có thể dùng cli `pnpm --recursive dev`.
- Nếu chỉ khởi chạy một ứng dụng, ví dụ **api** thôi, thì dùng `pnpm --filter dev api`. Chỉ **admin** thôi thì dùng `pnpm --filter dev app`.
