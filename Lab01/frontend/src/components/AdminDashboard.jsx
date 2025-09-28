import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

import apiClient from '../utils/apiClient';

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genre: "",
    total_quantity: 1
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const [deleting, setDeleting] = useState({});

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch books helper used by handlers
  async function fetchBooks() {
    try {
      const data = await apiClient.getBooks();
      if (Array.isArray(data)) {
        const mappedBooks = data.map((book) => ({
          ...book,
          genre: book.category || book.genre,
          total_quantity: book.quantity || book.total_quantity,
          available_quantity: (book.available_quantity ?? book.available) || book.quantity || book.total_quantity
        }));
        setBooks(mappedBooks);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error('[ADMIN][LOAD BOOKS]', err);
      setBooks([]);
    }
  }

  // Load books from backend on mount
  useEffect(() => {
    let mounted = true;
    fetchBooks();
    return () => { mounted = false; };
  }, []);

  // Load borrow records from backend on mount
  useEffect(() => {
    let mounted = true;
    // Admin should fetch all borrows
    apiClient.getAllBorrows()
      .then((data) => {
        if (!mounted) return;
          if (Array.isArray(data)) {
          // map backend shape to fields used by this UI and record original index
          const mapped = data.map((r, i) => ({
            id: r.id || r.record_id || Date.now() + Math.random(),
            user_name: r.user_name || r.user || (r.user_info && r.user_info.user_name) || 'Unknown',
            book_title: r.book_title || r.title || (r.book && r.book.title) || r.book_name || 'Unknown',
            status: r.status || r.state || 'processing',
            borrow_date: r.borrow_date || r.created_at || r.date || '-',
            return_date: r.return_date || r.returned_at || null,
            book_id: r.book_id || r.book?.id || r.bookId,
            originalIndex: i
          }));
          setBorrowRecords(mapped);
        }
      })
      .catch((err) => console.error('[ADMIN][LOAD RECORDS]', err));
    return () => { mounted = false; };
  }, []);

  // pending approvals count (used for badge)
  const pendingApprovals = borrowRecords.filter(record => record.status === "processing" || record.status === "processing_return");

  // displayedBorrowRecords: show pending cases on top (keeping original server order),
  // after a record is approved its status will change and it will naturally fall back to its original position
  const displayedBorrowRecords = useMemo(() => {
    if (!Array.isArray(borrowRecords)) return [];
    const pending = borrowRecords.filter(r => r.status === 'processing' || r.status === 'processing_return').slice().sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));
    const others = borrowRecords.filter(r => !(r.status === 'processing' || r.status === 'processing_return')).slice().sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));
    return [...pending, ...others];
  }, [borrowRecords]);

  // loading state per record id for approve actions
  const [approving, setApproving] = useState({});

  function handleAddBook() {
    if (!newBook.title || !newBook.author || !newBook.genre) {
      setAddError("Please fill in all book fields");
      return;
    }
    setAddLoading(true);
    setAddError("");
    const qty = parseInt(newBook.total_quantity, 10) || 1;
    const payload = {
      title: newBook.title,
      author: newBook.author,
      category: newBook.genre,
      quantity: qty,
      available_quantity: qty
    };
    apiClient.createBook(payload)
      .then(() => {
        toast.success('Book created');
        setNewBook({ title: "", author: "", genre: "", total_quantity: 1 });
        setShowAddDialog(false);
        return fetchBooks();
      })
      .catch((err) => {
        console.error('[ADMIN][CREATE BOOK]', err);
        // try to surface API validation message
        let msg = err?.message || 'Failed to create book';
        try {
          const jsonPart = msg.substring(msg.indexOf('{'));
          const parsed = JSON.parse(jsonPart);
          if (parsed && (parsed.message || parsed.error)) msg = parsed.error ? `${parsed.message} - ${parsed.error}` : parsed.message;
        } catch (e) {}
        setAddError(msg);
      })
      .finally(() => setAddLoading(false));
  }

  function handleEditBook() {
    if (!editingBook) return;
    setEditLoading(true);
    // Interpret add_quantity as an increment. If empty or invalid, treat as 0.
    const add = parseInt(editingBook.add_quantity, 10) || 0;
    // current stored values
    const currentTotal = parseInt(editingBook.total_quantity, 10) || 0;
    let currentAvail = Number(editingBook.available_quantity);
    if (isNaN(currentAvail)) currentAvail = currentTotal;
    const newTotal = currentTotal + add;
    const newAvailable = currentAvail + add;
    const payload = {
      title: editingBook.title,
      author: editingBook.author,
      category: editingBook.genre,
      quantity: newTotal,
      available_quantity: newAvailable
    };
    apiClient.updateBook(editingBook.id, payload)
      .then(() => {
        toast.success('Book updated');
        setEditingBook(null);
        setShowEditDialog(false);
        return fetchBooks();
      })
      .catch((err) => {
        console.error('[ADMIN][UPDATE BOOK]', err);
        let msg = err?.message || 'Failed to update book';
        try {
          const jsonPart = msg.substring(msg.indexOf('{'));
          const parsed = JSON.parse(jsonPart);
          if (parsed && (parsed.message || parsed.error)) msg = parsed.error ? `${parsed.message} - ${parsed.error}` : parsed.message;
        } catch (e) {}
        setEditError(msg);
      })
      .finally(() => setEditLoading(false));
  }

  function handleDeleteBook(bookId) {
    if (!window.confirm("Are you sure you want to delete this book? All related borrow records will also be removed.")) return;
    setDeleting(prev => ({ ...prev, [bookId]: true }));
    apiClient.deleteBook(bookId)
      .then(() => {
        toast.success('Book deleted');
        return fetchBooks();
      })
      .catch((err) => {
        console.error('[ADMIN][DELETE BOOK]', err);
        toast.error('Failed to delete book');
      })
      .finally(() => setDeleting(prev => {
        const n = { ...prev }; delete n[bookId]; return n;
      }));
  }

  function handleApproveBorrow(recordId) {
    const record = borrowRecords.find(r => r.id === recordId);
    if (record && record.status === "processing") {
      setBorrowRecords(borrowRecords.map(r =>
        r.id === recordId ? { ...r, status: "borrowed" } : r
      ));
      setBooks(books.map(book =>
        book.id === record.book_id
          ? { ...book, available_quantity: (book.available_quantity || 0) - 1 }
          : book
      ));
      toast.success("Borrow approved");
    }
  }

  async function handleApproveReturn(recordId) {
    const record = borrowRecords.find(r => r.id === recordId);
    if (record && record.status === "processing_return") {
      try {
        setApproving(prev => ({ ...prev, [recordId]: true }));
        const res = await apiClient.approveReturn({ borrow_id: record.id });
        // prefer server-provided return_date when available
        const returnedAt = res?.borrow?.return_date || new Date().toISOString();
        setBorrowRecords(prev => prev.map(r =>
          r.id === recordId
            ? { ...r, status: "returned", return_date: returnedAt }
            : r
        ));
        setBooks(prev => prev.map(book =>
          book.id === record.book_id
            ? { ...book, available_quantity: (book.available_quantity || 0) + 1 }
            : book
        ));
        toast.success("Return approved");
      } catch (err) {
        console.error('[ADMIN][APPROVE RETURN]', err);
        toast.error('Failed to approve return');
      } finally {
        setApproving(prev => ({ ...prev, [recordId]: false }));
      }
    }
  }

  function getStatusText(status) {
    switch (status) {
  case "processing": return "Pending approval";
  case "borrowed": return "Borrowed";
  case "processing_return": return "Pending return approval";
  case "returned": return "Returned";
      default: return status;
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "borrowed": return "bg-blue-100 text-blue-800";
      case "processing_return": return "bg-orange-100 text-orange-800";
      case "returned": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

    // Format date/time as MM/DD/YYYY h:mma (e.g., '09/27/2025 9:53PM') - fallback to '-' when missing
    function formatDateTime(value) {
      if (!value) return '-';
      try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const DD = String(d.getDate()).padStart(2, '0');
        const YYYY = d.getFullYear();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
          if (hours === 0) hours = 12;
          // format: MM/DD/YYYY h:mma (e.g., 09/27/2025 9:53PM)
          return `${MM}/${DD}/${YYYY} ${hours}:${minutes}${ampm}`;
      } catch (e) {
        return value;
      }
    }

  // Convert raw API/DB error strings into friendlier messages for the UI
  function formatApiErrorMessage(raw) {
    if (!raw) return 'An unknown error occurred';
    // raw may already be a friendly message
    try {
      // If the apiClient included a JSON body in the error message, try to extract it
      const idx = raw.indexOf('{');
      if (idx >= 0) {
        const jsonPart = raw.substring(idx);
        const parsed = JSON.parse(jsonPart);
        if (parsed) {
          // prefer explicit backend fields
          if (parsed.error && /Data too long for column\s+'(\w+)'/i.test(parsed.error)) {
            const col = parsed.error.match(/Data too long for column\s+'(\w+)'/i)[1];
            const label = (col === 'title') ? 'Title' : (col === 'author' ? 'Author' : col);
            const max = (col === 'title' || col === 'author') ? 255 : 'the allowed';
            return `${label} is too long — max ${max} characters.`;
          }
          if (parsed.error) return parsed.error;
          if (parsed.message) return parsed.message;
        }
      }
    } catch (e) {
      // fall through to raw formatting
    }
    // fallback: look for common DB phrasing
    const m = raw.match(/Data too long for column\s+'(\w+)'/i);
    if (m) {
      const col = m[1];
      const label = (col === 'title') ? 'Title' : (col === 'author' ? 'Author' : col);
      const max = (col === 'title' || col === 'author') ? 255 : 'the allowed';
      return `${label} is too long — max ${max} characters.`;
    }
    // strip verbose prefixes like "Failed to create book - "
    const stripped = raw.replace(/^Failed to (create|update) book\s*-\s*/i, '');
    return stripped;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {pendingApprovals.length > 0 && (
            <Badge variant="destructive">
              {pendingApprovals.length} pending approvals
            </Badge>
          )}
        </div>
        <Tabs defaultValue="books" className="w-full">
          <TabsList>
            <TabsTrigger value="books">Manage Books</TabsTrigger>
            <TabsTrigger value="records">Borrow / Return History</TabsTrigger>
          </TabsList>
          <TabsContent value="books" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-200"
                />
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add new book
                </Button>
                <DialogContent showCloseButton={false}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        className="h-9 rounded-md px-3 py-2 text-sm"
                        value={newBook.title}
                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        className="h-9 rounded-md px-3 py-2 text-sm"
                        value={newBook.author}
                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genre">Genre</Label>
                      <Input
                        id="genre"
                        className="h-9 rounded-md px-3 py-2 text-sm"
                        value={newBook.genre}
                        onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        className="h-9 rounded-md px-3 py-2 text-sm"
                        type="text"
                        value={String(newBook.total_quantity)}
                        onChange={(e) => setNewBook({ ...newBook, total_quantity: e.target.value })}
                      />
                    </div>
                    {addError && <div className="text-sm text-red-800 bg-red-100 p-2 rounded">{formatApiErrorMessage(addError)}</div>}
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddBook}>
                        Add book
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="max-h-[60vh] md:max-h-[520px] overflow-y-auto">
                <Table className="table-fixed w-full">
                  <TableHeader className="sticky top-0 z-10 bg-white">
                        <TableRow>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[24%] sticky top-0 z-10 bg-white">Title</TableHead>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[25%] sticky top-0 z-10 bg-white">Author</TableHead>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[15%] sticky top-0 z-10 bg-white">Genre</TableHead>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[10%] sticky top-0 z-10 bg-white">Status</TableHead>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[10%] sticky top-0 z-10 bg-white">Quantity</TableHead>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[10%] sticky top-0 z-10 bg-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody className="divide-y">
                      {filteredBooks.map((book) => (
                        <TableRow key={book.id} className="h-12">
                          <TableCell className="px-4 py-3 align-middle font-medium w-[24%]">
                            <div className="truncate">{book.title}</div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-middle w-[25%] truncate">{book.author}</TableCell>
                          <TableCell className="px-4 py-3 align-middle w-[15%] truncate">{book.genre}</TableCell>
                          <TableCell className="px-4 py-3 align-middle w-[10%] flex items-center justify-start">
                            {((typeof book.available_quantity === 'number' ? book.available_quantity : (book.available_quantity ? Number(book.available_quantity) : 0)) <= 0) ? (
                              <span className="text-destructive font-medium">Out of stock</span>
                            ) : (
                              <span className="text-green-600 font-medium">Available</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 align-middle text-left w-[10%]">
                            {book.available_quantity}/{book.total_quantity}
                          </TableCell>
                          <TableCell className="px-4 py-3 align-middle text-left w-[10%] flex items-center justify-start">
                            <div className="flex gap-2 items-center justify-start">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                aria-label={`Edit ${book.title}`}
                                onClick={() => {
                                  setEditingBook({ ...book, add_quantity: '' });
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                aria-label={`Delete ${book.title}`}
                                onClick={() => handleDeleteBook(book.id)}
                                loading={deleting[book.id]}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardContent className="p-0 border-t">
                {/* history box: header stays visible, only rows scroll */}
                <div className="max-h-[60vh] md:max-h-[520px] overflow-y-auto">
                  <Table className="table-fixed w-full">
                    <TableHeader className="sticky top-0 z-10 bg-white">
                      <TableRow>
                        <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[9%] sticky top-0 z-10 bg-white">Borrower</TableHead>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[24%] sticky top-0 z-10 bg-white"><div className="truncate">Title</div></TableHead>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[20%] sticky top-0 z-10 bg-white">Status</TableHead>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[10%] sticky top-0 z-10 bg-white">Borrow date</TableHead>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[10%] sticky top-0 z-10 bg-white">Return date</TableHead>
                          <TableHead className="h-12 align-middle text-left px-4 py-3 text-sm font-medium w-[10%] sticky top-0 z-10 bg-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y">
                      {displayedBorrowRecords.map((record) => (
                        <TableRow key={record.id} className="h-12">
                          <TableCell className="px-4 py-3 align-middle w-[9%] truncate">{record.user_name}</TableCell>
                          <TableCell className="px-4 py-3 align-middle w-[24%]"><div className="truncate">{record.book_title}</div></TableCell>
                          <TableCell className="px-4 py-3 align-middle w-[20%] flex items-center justify-start">
                            <Badge className={getStatusColor(record.status)}>
                              {getStatusText(record.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-middle text-left w-[10%]">{formatDateTime(record.borrow_date)}</TableCell>
                          <TableCell className="px-4 py-3 align-middle text-left w-[10%]">{formatDateTime(record.return_date)}</TableCell>
                          <TableCell className="px-4 py-3 align-middle text-left w-[10%] flex items-center justify-start">
                            {record.status === "processing" ? (
                              <Button
                                size="sm"
                                disabled={!!approving[record.id]}
                                onClick={async () => {
                                  try {
                                    setApproving(prev => ({ ...prev, [record.id]: true }));
                                    // call backend approve
                                    await apiClient.approveBorrow({ borrow_id: record.id });
                                    // optimistic ui update
                                    setBorrowRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'borrowed' } : r));
                                    setBooks(prev => prev.map(b => b.id === record.book_id ? { ...b, available_quantity: Math.max(0, (b.available_quantity || 0) - 1) } : b));
                                    toast.success('Borrow approved');
                                  } catch (err) {
                                    console.error('[ADMIN][APPROVE BORROW]', err);
                                    toast.error('Failed to approve borrow');
                                  } finally {
                                    setApproving(prev => ({ ...prev, [record.id]: false }));
                                  }
                                }}
                              >
                                {approving[record.id] ? '...': 'Approve'}
                              </Button>
                            ) : record.status === "processing_return" ? (
                              <Button
                                size="sm"
                                variant="success"
                                disabled={!!approving[record.id]}
                                onClick={() => handleApproveReturn(record.id)}
                              >
                                {approving[record.id] ? '...': 'Approve'}
                              </Button>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Edit Book Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent showCloseButton={false}>
            {editingBook && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    className="h-9 rounded-md px-3 py-2 text-sm"
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-author">Author</Label>
                  <Input
                    id="edit-author"
                    className="h-9 rounded-md px-3 py-2 text-sm"
                    value={editingBook.author}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-genre">Genre</Label>
                  <Input
                    id="edit-genre"
                    className="h-9 rounded-md px-3 py-2 text-sm"
                    value={editingBook.genre}
                    onChange={(e) => setEditingBook({ ...editingBook, genre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-add-quantity">Add quantity</Label>
                  <Input
                    id="edit-add-quantity"
                    className="h-9 rounded-md px-3 py-2 text-sm"
                    type="text"
                    value={String(editingBook.add_quantity ?? '')}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setEditingBook({ ...editingBook, add_quantity: raw });
                    }}
                  />
                  <p className="text-sm text-muted-foreground">Enter how many copies to add to total and available quantity.</p>
                </div>
                  <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditBook}>
                    Update
                  </Button>
                </div>
                {editError && <div className="text-sm text-red-800 bg-red-100 p-2 rounded">{formatApiErrorMessage(editError)}</div>}
              </div>
            )}
              </DialogContent>
            </Dialog>
      </div>
    </div>
  );
}
