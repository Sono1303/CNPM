const Borrow = require('../models/borrow');

// Admin: approve borrow request (processing -> borrowed)
exports.approveBorrow = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { borrow_id } = req.body;
    await Borrow.approveBorrow(borrow_id);
    res.json({ message: 'Borrow approved' });
  } catch (err) {
    console.error('[BORROW][APPROVE][ERROR]', err);
    res.status(500).json({ message: err.message || 'Failed to approve borrow' });
  }
};

// Admin: approve return (processing_return -> returned)
exports.approveReturn = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { borrow_id } = req.body;
    await Borrow.approveReturn(borrow_id);
    // return updated borrow when available
    try {
      const updated = await Borrow.getById(borrow_id);
      return res.json({ message: 'Return approved', borrow: updated });
    } catch (e) {
      return res.json({ message: 'Return approved' });
    }
  } catch (err) {
    console.error('[RETURN][APPROVE][ERROR]', err);
    res.status(500).json({ message: err.message || 'Failed to approve return' });
  }
};

// Borrow book (authenticated user)
exports.borrowBook = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    const user_id = req.user.id;
    const { book_id } = req.body;
    await Borrow.borrowBook(user_id, book_id);
    res.json({ success: true, message: 'Borrow request created' });
  } catch (err) {
    console.error('[BORROW][ERROR]', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to borrow book' });
  }
};

// Request return (authenticated user)
exports.returnBook = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const user_id = req.user.id;
    const { borrow_id } = req.body;
    await Borrow.requestReturnBook(user_id, borrow_id);
    res.json({ message: 'Return request submitted, awaiting admin approval' });
  } catch (err) {
    console.error('[RETURN][ERROR]', err);
    res.status(500).json({ message: err.message || 'Failed to request return' });
  }
};

// Get authenticated user's borrow history
exports.getUserBorrows = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const user_id = req.user.id;
    const borrows = await Borrow.getUserBorrows(user_id);
    res.json(borrows);
  } catch (err) {
    console.error('[API][HISTORY][ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch borrow history', error: err.message });
  }
};

// Admin: get all borrows
exports.getAllBorrows = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const borrows = await Borrow.getAllBorrows();
    res.json(borrows);
  } catch (err) {
    console.error('[API][ALL_HISTORY][ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch all borrow history', error: err.message });
  }
};

