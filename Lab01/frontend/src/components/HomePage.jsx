import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import apiClient from "../utils/apiClient";

export default function HomePage({ currentUser, onLogin }) {
  const [books, setBooks] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);
  useEffect(() => {
    let mounted = true;
    apiClient.getBooks()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          const mappedBooks = data.map((book) => ({
            ...book,
            genre: book.category || book.genre,
            total_quantity: book.quantity || book.total_quantity
          }));
          setBooks(mappedBooks);
        } else setBooks([]);
      })
      .catch(() => setBooks([]));
    return () => { mounted = false; };
  }, []);

  // Load user's borrow history from server so pending/borrowed records persist across navigation
  useEffect(() => {
    let mounted = true;
    async function loadBorrowHistory() {
      if (!currentUser) return;
      try {
        const data = await apiClient.getUserBorrowHistory();
        if (!mounted) return;
        // Map backend fields to our borrowRecords shape
        const mapped = (Array.isArray(data) ? data : []).map(r => ({
          id: r.id,
          book_id: r.book_id,
          user_id: r.user_id,
          status: r.status,
          borrow_date: r.borrow_date ? (typeof r.borrow_date === 'string' ? r.borrow_date.split('T')[0] : r.borrow_date) : null,
          return_date: r.return_date ? (typeof r.return_date === 'string' ? r.return_date.split('T')[0] : r.return_date) : null
        }));
        setBorrowRecords(mapped);
      } catch (err) {
        console.error('[HOME][LOAD BORROW HISTORY][ERROR]', err);
      }
    }
    loadBorrowHistory();
    function onBorrowCreated() { loadBorrowHistory(); }
    window.addEventListener('borrow:created', onBorrowCreated);
    return () => { mounted = false; window.removeEventListener('borrow:created', onBorrowCreated); };
  }, [currentUser]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [pendingReturnIds, setPendingReturnIds] = useState([]);

  const filteredBooks = useMemo(() => {
    let filtered = books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "genre":
          return a.genre.localeCompare(b.genre);
        default:
          return 0;
      }
    });
    return filtered;
  }, [books, searchTerm, sortBy]);

  function getUserBookStatus(bookId) {
    if (!currentUser) return undefined;
    return borrowRecords.find((record) =>
      record.book_id === bookId &&
      record.user_id === currentUser.id &&
      ["processing", "borrowed", "processing_return"].includes(record.status)
    );
  }

  function handleBorrowBook(bookId) {
    if (!currentUser) {
      toast.error("Please login to borrow books");
      onLogin();
      return;
    }
    const existingRecord = getUserBookStatus(bookId);
    if (existingRecord) {
      toast.error("You already have a pending borrow/return request for this book");
      return;
    }
    const newRecord = {
      id: Date.now(),
      book_id: bookId,
      user_id: currentUser.id,
      status: "processing",
      borrow_date: new Date().toISOString().split('T')[0]
    };
    // optimistic UI update
    setBorrowRecords(prev => [...prev, newRecord]);
    toast.success("Borrow request sent. Waiting for admin approval.");
    // persist to backend so it appears in HistoryPage
    apiClient.borrowBook({ book_id: bookId })
      .then(() => {
        // notify other pages (History) to refresh data
        try { window.dispatchEvent(new CustomEvent('borrow:created', { detail: { book_id: bookId } })); } catch (e) {}
      })
      .catch((err) => {
        // rollback optimistic update
        setBorrowRecords(prev => prev.filter(r => r.id !== newRecord.id));
        console.error('[BORROW][ERROR]', err);
        toast.error('Failed to send borrow request');
      });
  }

  function handleReturnBook(bookId) {
    const record = getUserBookStatus(bookId);
    if (record && record.status === "borrowed") {
      // optimistic UI: mark this user's record as processing_return while request is sent
      setBorrowRecords(prev => prev.map((r) =>
        r.id === record.id
          ? { ...r, status: "processing_return" }
          : r
      ));
      // track pending return locally to ensure UI shows pending state immediately
      console.debug('[RETURN] clicked for bookId:', bookId, 'recordId:', record.id);
      setPendingReturnIds(prev => Array.from(new Set([...prev, String(bookId)])));
      toast.success("Return request sent. Waiting for admin approval.");
      // persist to backend
      apiClient.returnBook({ borrow_id: record.id })
        .then((res) => {
          console.debug('[RETURN] api success', res);
          // clear pending marker (server acknowledged receipt)
          setPendingReturnIds(prev => prev.filter(id => id !== String(bookId)));
          try { window.dispatchEvent(new CustomEvent('borrow:created', { detail: { book_id: bookId } })); } catch (e) {}
        })
        .catch((err) => {
          // rollback optimistic update
          setBorrowRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'borrowed' } : r));
          setPendingReturnIds(prev => prev.filter(id => id !== String(bookId)));
          console.error('[RETURN][ERROR]', err);
          toast.error('Failed to send return request');
        });
    }
  }

  function getButtonForBook(book) {
    if (!currentUser) {
      if (book.available_quantity === 0) {
          return <span className="text-destructive font-medium">Out of stock</span>;
      }
      return (
        <Button size="sm" className="flex items-center justify-center" onClick={() => handleBorrowBook(book.id)}>
          Borrow
        </Button>
      );
    }
    const userRecord = getUserBookStatus(book.id);
    // If we have locally tracked a pending return for this book, show the pending state
    if (pendingReturnIds.includes(String(book.id))) {
      return (
        <Button size="sm" disabled variant="secondary">
          Return pending
        </Button>
      );
    }
  if (Number(book.available_quantity) === 0 && !userRecord) {
        return <span className="text-destructive font-medium">Out of stock</span>;
    }
    if (!userRecord) {
      return (
        <Button size="sm" className="flex items-center justify-center" onClick={() => handleBorrowBook(book.id)}>
          Borrow
        </Button>
      );
    }
    switch (userRecord.status) {
      case "processing":
        return (
          <Button size="sm" disabled variant="secondary">
            Pending
          </Button>
        );
      case "borrowed":
        return (
          <Button size="sm" variant="success-light" onClick={() => handleReturnBook(book.id)}>
            Return
          </Button>
        );
      case "processing_return":
          return (
            <Button size="sm" disabled variant="secondary">
              Return pending
            </Button>
          );
      default:
        return (
          <Button size="sm" onClick={() => handleBorrowBook(book.id)}>
            Mượn sách
          </Button>
        );
    }
  }

  function getStatusText(status) {
    switch (status) {
      case "processing": return "Pending";
      case "borrowed": return "Borrowed";
      case "processing_return": return "Return pending";
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

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Start searching....."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-200"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full max-w-md min-w-[140px] h-9 px-4 text-base font-semibold bg-white rounded-lg shadow-sm border focus:outline-none flex items-center justify-between">
              <span className="flex-1 truncate text-left">{sortBy === "title" ? "Name" : sortBy === "author" ? "Author" : "Genre"}</span>
              <svg className="w-4 h-4 ml-2 text-gray-700" viewBox="0 0 20 20" fill="none"><path d="M5.5 8l4.5 4.5L14.5 8" stroke="currentColor" strokeWidth="2"/></svg>
            </SelectTrigger>
            <SelectContent className="w-full max-w-md text-base bg-white rounded-lg shadow-sm border border-gray-200 mt-1">
              <SelectItem value="title" className={`${sortBy === "title" ? 'bg-gray-100' : ''}`}>
                <div className="flex items-center h-9 w-full px-4 hover:bg-gray-50">
                  <span className="text-left">Name</span>
                  {sortBy === "title" && (
                    <svg className="w-4 h-4 ml-auto text-gray-600" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </SelectItem>
              <SelectItem value="author" className={`${sortBy === "author" ? 'bg-gray-100' : ''}`}>
                <div className="flex items-center h-9 w-full px-4 hover:bg-gray-50">
                  <span className="text-left">Author</span>
                  {sortBy === "author" && (
                    <svg className="w-4 h-4 ml-auto text-gray-600" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </SelectItem>
              <SelectItem value="genre" className={`${sortBy === "genre" ? 'bg-gray-100' : ''}`}>
                <div className="flex items-center h-9 w-full px-4 hover:bg-gray-50">
                  <span className="text-left">Genre</span>
                  {sortBy === "genre" && (
                    <svg className="w-4 h-4 ml-auto text-gray-600" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Books List</h1>
        </div>
        {/* Books: 3-row horizontal-scrolling grid */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="grid grid-flow-col auto-cols-max grid-rows-3 gap-4">
            {filteredBooks.map((book) => (
              <div key={book.id} className="w-72">
                <Card className="border border-border h-full">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-card-foreground">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{book.genre}</Badge>
                        <span className="text-sm text-muted-foreground">{book.available_quantity} available</span>
                      </div>
                      <div className="flex justify-end">
                        {getButtonForBook(book)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
