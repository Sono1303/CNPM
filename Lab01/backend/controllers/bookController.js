const Book = require('../models/book');

// Lấy tất cả sách (ai cũng xem được)
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.getAll();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch books', error: err.message });
  }
};

// Lấy thông tin 1 sách
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.getById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch book', error: err.message });
  }
};

// Thêm sách (chỉ admin)
exports.createBook = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { title, author, category, quantity, available_quantity } = req.body;
    await Book.create({ title, author, category, quantity, available_quantity });
    res.status(201).json({ message: 'Book created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create book', error: err.message });
  }
};

// Sửa sách (chỉ admin)
exports.updateBook = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { title, author, category, quantity, available_quantity } = req.body;
    await Book.update(req.params.id, { title, author, category, quantity, available_quantity });
    res.json({ message: 'Book updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update book', error: err.message });
  }
};

// Xoá sách (chỉ admin)
exports.deleteBook = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    await Book.delete(req.params.id);
    res.json({ message: 'Book and related borrows deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete book', error: err.message });
  }
};
// Tìm kiếm sách theo tên
exports.searchByTitle = async (req, res) => {
  try {
    const { q } = req.query;
    const books = await Book.searchByTitle(q || '');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Search by title failed', error: err.message });
  }
};

// Tìm kiếm sách theo tác giả
exports.searchByAuthor = async (req, res) => {
  try {
    const { q } = req.query;
    const books = await Book.searchByAuthor(q || '');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Search by author failed', error: err.message });
  }
};

// Tìm kiếm sách theo thể loại
exports.searchByCategory = async (req, res) => {
  try {
    const { q } = req.query;
    const books = await Book.searchByCategory(q || '');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Search by category failed', error: err.message });
  }
};