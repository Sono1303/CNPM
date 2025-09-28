
const db = require('../config/db');

class User {
  constructor(id, user_name, password, role) {
    this.id = id;
    this.user_name = user_name;
    this.password = password;
    this.role = role; // 'admin' hoặc 'user'
  }

  static async findByUsername(user_name) {
    const [rows] = await db.execute('SELECT * FROM users WHERE user_name = ?', [user_name]);
    if (rows.length === 0) return null;
    const u = rows[0];
    return new User(u.id, u.user_name, u.password, u.role);
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const u = rows[0];
    return new User(u.id, u.user_name, u.password, u.role);
  }

  static async create({ user_name, password, role }) {
    await db.execute('INSERT INTO users (user_name, password, role) VALUES (?, ?, ?)', [user_name, password, role]);
  }
}

const Borrow = require('./borrow');
const Book = require('./book');

class NorUser extends User {
  constructor(id, user_name, password) {
    super(id, user_name, password, 'user');
  }
  async borrowBook(book_id) {
    return await Borrow.borrowBook(this.id, book_id);
  }
  async returnBook(book_id) {
    return await Borrow.returnBook(this.id, book_id);
  }
  async viewBorrowHistory() {
    return await Borrow.getUserBorrows(this.id);
  }
  async viewBooks() {
    return await Book.getAll();
  }
}

class Admin extends User {
  constructor(id, user_name, password) {
    super(id, user_name, password, 'admin');
  }
  async addBook(bookData) {
    return await Book.create(bookData);
  }
  async removeBook(bookId) {
    return await Book.delete(bookId);
  }
  async updateBook(bookId, data) {
    return await Book.update(bookId, data);
  }
  async manageUsers() {
    // Có thể mở rộng: lấy danh sách user, xóa user, ...
  }
  async borrowBook(book_id) {
    return await Borrow.borrowBook(this.id, book_id);
  }
  async returnBook(book_id) {
    return await Borrow.returnBook(this.id, book_id);
  }
  async viewBorrowHistory() {
    return await Borrow.getUserBorrows(this.id);
  }
  async viewBooks() {
    return await Book.getAll();
  }
}

module.exports = { User, NorUser, Admin };
