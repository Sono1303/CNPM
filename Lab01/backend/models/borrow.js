const db = require('../config/db');

class Borrow {
  constructor(id, user_id, book_id, borrow_date, return_date, status) {
    this.id = id;
    this.user_id = user_id;
    this.book_id = book_id;
    this.borrow_date = borrow_date;
    this.return_date = return_date; // null nếu chưa trả
    this.status = status; // 'borrowed' hoặc 'returned'
  }


  // Mượn sách: tạo bản ghi với status = 'processing', không trừ sách
  static async borrowBook(user_id, book_id) {
    // Kiểm tra sách còn không (chỉ check số lượng, không trừ ngay)
    const [books] = await db.execute('SELECT * FROM books WHERE id = ? AND available_quantity > 0', [book_id]);
    if (books.length === 0) throw new Error('Book not available');
    // Thêm bản ghi mượn với trạng thái processing
    await db.execute('INSERT INTO borrows (user_id, book_id, borrow_date, status) VALUES (?, ?, NOW(), ?)', [user_id, book_id, 'processing']);
  }

  // User yêu cầu trả sách: chuyển sang processing_return
  static async requestReturnBook(user_id, borrow_id) {
    // Chỉ cho phép nếu đang ở trạng thái borrowed
    const [rows] = await db.execute('SELECT * FROM borrows WHERE id = ? AND user_id = ? AND status = ?', [borrow_id, user_id, 'borrowed']);
    if (rows.length === 0) throw new Error('No active borrowed record');
    await db.execute('UPDATE borrows SET status = ? WHERE id = ?', ['processing_return', borrow_id]);
  }

  // Admin duyệt mượn: chuyển processing -> borrowed, trừ sách
  static async approveBorrow(borrow_id) {
    // Chỉ duyệt nếu đang processing
    const [rows] = await db.execute('SELECT * FROM borrows WHERE id = ? AND status = ?', [borrow_id, 'processing']);
    if (rows.length === 0) throw new Error('No processing borrow record');
    const borrow = rows[0];
    // Trừ sách
    await db.execute('UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ?', [borrow.book_id]);
    // Chuyển trạng thái
    await db.execute('UPDATE borrows SET status = ? WHERE id = ?', ['borrowed', borrow_id]);
  }

  // Admin duyệt trả: chuyển processing_return -> returned, cộng sách và set return_date
  static async approveReturn(borrow_id) {
    // Chỉ duyệt nếu đang processing_return
    const [rows] = await db.execute('SELECT * FROM borrows WHERE id = ? AND status = ?', [borrow_id, 'processing_return']);
    if (rows.length === 0) throw new Error('No processing return record');
    const borrow = rows[0];
    // Cộng sách
    await db.execute('UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ?', [borrow.book_id]);
    // Chuyển trạng thái và set return_date
    await db.execute('UPDATE borrows SET status = ?, return_date = NOW() WHERE id = ?', ['returned', borrow_id]);
  }

  // (Không dùng nữa, thay bằng requestReturnBook + approveReturn)

  // Lấy lịch sử mượn của user
  static async getUserBorrows(user_id) {
    const [rows] = await db.execute(
      `SELECT b.id, b.user_id, b.book_id, users.user_name AS user_name, books.title AS title, books.title AS book_title, books.author, books.category, b.borrow_date, b.return_date, b.status
       FROM borrows b
       JOIN books ON b.book_id = books.id
       LEFT JOIN users ON b.user_id = users.id
       WHERE b.user_id = ?
       ORDER BY b.borrow_date DESC`,
      [user_id]
    );
    return rows;
  }

  static async getAllBorrows() {
    const [rows] = await db.execute(
      `SELECT b.id, b.user_id, b.book_id, users.user_name AS user_name, books.title AS title, books.title AS book_title, books.author, books.category, b.borrow_date, b.return_date, b.status
       FROM borrows b
       JOIN books ON b.book_id = books.id
       LEFT JOIN users ON b.user_id = users.id
       ORDER BY b.borrow_date DESC`
    );
    return rows;
  }

  // Lấy bản ghi borrow theo id
  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM borrows WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Borrow(row.id, row.user_id, row.book_id, row.borrow_date, row.return_date, row.status);
  }
}

module.exports = Borrow;
