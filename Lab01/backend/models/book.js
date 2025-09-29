const db = require('../config/db');

class Book {
  constructor(id, title, author, category, quantity, available_quantity) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.category = category;
    this.quantity = quantity;
    this.available_quantity = available_quantity;
  }

  // Lấy tất cả sách
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM books');
    return rows.map(row => new Book(row.id, row.title, row.author, row.category, row.quantity, row.available_quantity));
  }

  // Lấy 1 sách theo id
  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM books WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Book(row.id, row.title, row.author, row.category, row.quantity, row.available_quantity);
  }

  // Thêm sách mới
  static async create({ title, author, category, quantity, available_quantity }) {
    await db.execute('INSERT INTO books (title, author, category, quantity, available_quantity) VALUES (?, ?, ?, ?, ?)', [title, author, category, quantity, available_quantity]);
  }

  // Sửa sách
  static async update(id, { title, author, category, quantity, available_quantity }) {
    await db.execute('UPDATE books SET title = ?, author = ?, category = ?, quantity = ?, available_quantity = ? WHERE id = ?', [title, author, category, quantity, available_quantity, id]);
  }

  // Xoá sách và toàn bộ borrow liên quan
  static async delete(id) {
    // Xoá các borrow liên quan trước
    await db.execute('DELETE FROM borrows WHERE book_id = ?', [id]);
    // Sau đó xoá sách
    await db.execute('DELETE FROM books WHERE id = ?', [id]);
  }

    // Tìm kiếm theo tên sách
  static async searchByTitle(title) {
    const [rows] = await db.execute('SELECT * FROM books WHERE title LIKE ?', [`%${title}%`]);
    return rows.map(row => new Book(row.id, row.title, row.author, row.category, row.quantity, row.available_quantity));
  }

  // Tìm kiếm theo tác giả
  static async searchByAuthor(author) {
    const [rows] = await db.execute('SELECT * FROM books WHERE author LIKE ?', [`%${author}%`]);
    return rows.map(row => new Book(row.id, row.title, row.author, row.category, row.quantity, row.available_quantity));
  }

  // Tìm kiếm theo thể loại
  static async searchByCategory(category) {
    const [rows] = await db.execute('SELECT * FROM books WHERE category LIKE ?', [`%${category}%`]);
    return rows.map(row => new Book(row.id, row.title, row.author, row.category, row.quantity, row.available_quantity));
  }
}

module.exports = Book;
