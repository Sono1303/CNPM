const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { checkAuth, isAdmin } = require('../middleware/auth');

// Lấy tất cả sách (ai cũng xem được)
router.get('/', bookController.getAllBooks);

// Lấy thông tin 1 sách
router.get('/:id', bookController.getBookById);

// Thêm sách (chỉ admin)
router.post('/', checkAuth, isAdmin, bookController.createBook);

// Sửa sách (chỉ admin)
router.put('/:id', checkAuth, isAdmin, bookController.updateBook);

// Xoá sách (chỉ admin)
router.delete('/:id', checkAuth, isAdmin, bookController.deleteBook);

// Tìm kiếm sách theo tên
router.get('/search/title', bookController.searchByTitle);
// Tìm kiếm sách theo tác giả
router.get('/search/author', bookController.searchByAuthor);
// Tìm kiếm sách theo thể loại
router.get('/search/category', bookController.searchByCategory);

module.exports = router;
