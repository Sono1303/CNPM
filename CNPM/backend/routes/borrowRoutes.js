
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { checkAuth } = require('../middleware/auth');
// Admin xác nhận mượn
router.post('/approve-borrow', checkAuth, borrowController.approveBorrow);
// Admin xác nhận trả
router.post('/approve-return', checkAuth, borrowController.approveReturn);

// Mượn sách (cần đăng nhập)
router.post('/', checkAuth, borrowController.borrowBook);

// Trả sách (cần đăng nhập)
router.post('/return', checkAuth, borrowController.returnBook);

// Lấy lịch sử mượn của user (cần đăng nhập)
router.get('/history', checkAuth, borrowController.getUserBorrows);

// Lấy tất cả lịch sử (chỉ admin)
router.get('/all-history', checkAuth, borrowController.getAllBorrows);

module.exports = router;
