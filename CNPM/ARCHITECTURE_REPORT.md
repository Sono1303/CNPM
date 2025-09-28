## Báo cáo kiến trúc ngắn — Dự án CNPM

Đây là tệp báo cáo ngắn bằng tiếng Việt mô tả kiến trúc, sơ đồ lớp, sơ đồ cơ sở dữ liệu và hướng dẫn chạy ứng dụng.

---

### 1. Tổng quan kiến trúc
- Kiến trúc: 2-tier (Frontend React + Backend Node/Express)
- Frontend: React (create-react-app / react-scripts) nằm trong `frontend/`. Giao diện sử dụng các component trong `src/components` và UI primitives trong `src/components/ui`.
- Backend: Node.js + Express nằm trong `backend/`. Kết nối MySQL thông qua `mysql2` và có các mô-đun `models/`, `controllers/`, `routes/`.
- DB: MySQL; file schema mẫu: `database/library.sql`.

Ứng dụng quản lý thư viện đơn giản: sách (books), bản ghi mượn (borrows) và người dùng (users). Admin có thể thêm/sửa/xoá sách và duyệt mượn/trả; user có thể yêu cầu mượn/trả.

---

### 2. Sơ đồ lớp (class diagram) — tóm tắt

- Backend models (đại diện cho bảng DB):
  - Book
    - Thuộc tính (từ `backend/models/book.js`): id, title, author, category, quantity, available_quantity
    - Phương thức: getAll, getById, create, update, delete, searchByTitle/Author/Category

  - Borrow
    - Thuộc tính: id, user_id, book_id, borrow_date, return_date, status
    - Trạng thái: 'processing', 'borrowed', 'processing_return', 'returned'
    - Phương thức: borrowBook, requestReturnBook, approveBorrow, approveReturn, getUserBorrows, getAllBorrows, getById

  - User / NorUser / Admin
    - Thuộc tính: id, user_name, password, role
    - Phương thức: tìm user, create user; class con (NorUser, Admin) đóng gói thao tác như borrowBook, returnBook, viewBorrowHistory, addBook, updateBook, removeBook.

Sơ đồ (ASCII, ngắn):

  User <-- NorUser, Admin
    |
    +-- uses Borrow (models/borrow.js)
    +-- uses Book (models/book.js)

---

### 3. Sơ đồ CSDL (tóm tắt bảng và cột chính)

File schema mẫu: `database/library.sql` (mở file để xem chi tiết). Dưới đây là các bảng chính:

- `books`
  - id (PK, int)
  - title (varchar)
  - author (varchar)
  - category (varchar)
  - quantity (int)         -- tổng số
  - available_quantity (int) -- còn sẵn

- `users`
  - id (PK, int)
  - user_name (varchar)
  - password (varchar) -- hashed (bcryptjs)
  - role (varchar) -- 'admin' hoặc 'user'

- `borrows`
  - id (PK, int)
  - user_id (FK -> users.id)
  - book_id (FK -> books.id)
  - borrow_date (datetime)
  - return_date (datetime nullable)
  - status (varchar) -- 'processing' | 'borrowed' | 'processing_return' | 'returned'

Chú ý: ứng dụng hiện dùng `mysql2` với các truy vấn SQL thuần (xem `backend/models/*.js`).

---

### 4. Luồng chính / API endpoints (tóm tắt)

- Auth:
  - POST /api/auth/register  (đăng ký)
  - POST /api/auth/login     (đăng nhập)

- Books:
  - GET /api/books
  - GET /api/books/:id
  - POST /api/books (admin)
  - PUT /api/books/:id (admin)
  - DELETE /api/books/:id (admin)

- Borrows:
  - POST /api/borrow (user yêu cầu mượn)
  - POST /api/borrow/return (user yêu cầu trả)
  - POST /api/borrow/approve-borrow (admin duyệt mượn)
  - POST /api/borrow/approve-return (admin duyệt trả)
  - GET /api/borrow/history (user)
  - GET /api/borrow/all-history (admin)

---

### 5. Hướng dẫn chạy chương trình (Windows / PowerShell)

1) Chuẩn bị
   - Yêu cầu: Node.js (phiên bản gần nhất >= 18), MySQL server.
   - Tạo database: import `e:\CNPM\database\library.sql` vào MySQL (ví dụ bằng MySQL Workbench hoặc mysql CLI).

2) Thiết lập biến môi trường
   - Tạo file `.env` trong `e:\CNPM\backend` với các biến cần thiết (ví dụ `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`). Kiểm tra `backend/config/config.js` nếu cần biết tên biến cụ thể.

3) Cài đặt dependencies
   - Lưu ý: trước khi nén nộp, bạn có thể xóa `node_modules`. Khi chạy ở máy khác, cần cài lại.
   - Để cài toàn bộ (root có thể không có scripts) chạy riêng trong mỗi thư mục:

```powershell
cd e:\CNPM\backend
npm install

cd e:\CNPM\frontend
npm install
```

4) Chạy backend
```powershell
cd e:\CNPM\backend
node index.js
```
(Nếu bạn có script start trong `backend/package.json`, dùng `npm start`).

5) Chạy frontend (dev server CRA)
```powershell
cd e:\CNPM\frontend
npm start
```
Mở trình duyệt vào http://localhost:3000 (hoặc port hiển thị trên terminal).

6) Kiểm tra
   - Đăng ký/đăng nhập, tạo sách, thực hiện yêu cầu mượn/trả, duyệt mượn/trả bằng admin.

---

### 6. Lưu ý nộp bài
- Trước khi tạo file zip để nộp: xóa thư mục `node_modules` (cả ở root nếu có, và trong `frontend/` hay `backend/` nếu tồn tại) để giảm kích thước và tránh file nền tảng.
- Giữ lại `package.json` và `package-lock.json` (hoặc `yarn.lock`) để người nhận có thể cài lại.
- Xoá file chứa secrets (ví dụ `.env`) trước khi nén.

---

Nếu bạn muốn, tôi có thể:
- Tự động tạo file zip theo quy trình (đã có thể thực hiện trong terminal) và báo kích thước + nội dung.
- Hoặc mở rộng báo cáo (thêm sơ đồ UML hình ảnh, các luồng sequence cụ thể, hoặc hướng dẫn debug chi tiết).

File này được lưu tại: `e:\CNPM\ARCHITECTURE_REPORT.md`
