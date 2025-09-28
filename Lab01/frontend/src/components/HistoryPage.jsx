import React, { useState, useMemo, useEffect } from "react";
import { Search, Calendar, Book, Clock } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import apiClient from '../utils/apiClient';

export default function HistoryPage({ currentUser }) {
  const [borrowHistory, setBorrowHistory] = useState([]); // Fetch from backend in real app
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [pendingReturnIds, setPendingReturnIds] = useState([]);

  // TODO: Replace with backend fetch
  useEffect(() => {
    let mounted = true;
    async function loadHistory() {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getUserBorrowHistory();
        if (!mounted) return;
        // Map backend fields to the component's expected field names
          const mapped = (Array.isArray(data) ? data : []).map(r => ({
          id: r.id,
          user_id: r.user_id,
          book_id: r.book_id,
          book_title: r.book_title || r.title,
          book_author: r.author,
          book_genre: r.category || r.book_genre || r.genre,
            // keep full ISO datetime so we can format consistently in UI
            borrow_date: r.borrow_date || null,
            return_date: r.return_date || null,
          due_date: r.due_date || null,
          status: r.status
        }));
        setBorrowHistory(mapped);
      } catch (err) {
        console.error('[HISTORY][ERROR]', err);
        setError(err.message || 'Failed to load history');
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
    function onBorrowCreated() {
      loadHistory();
    }
    window.addEventListener('borrow:created', onBorrowCreated);
    return () => { mounted = false; };
  }, [currentUser]);

  const filteredHistory = useMemo(() => {
    let filtered = borrowHistory.filter(record => {
      if (!currentUser || record.user_id !== currentUser.id) return false;
      const matchesSearch =
        record.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.book_author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.book_genre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.borrow_date).getTime() - new Date(a.borrow_date).getTime();
        case "oldest":
          return new Date(a.borrow_date).getTime() - new Date(b.borrow_date).getTime();
        case "title":
          return a.book_title.localeCompare(b.book_title);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    return filtered;
  }, [borrowHistory, searchTerm, statusFilter, sortBy, currentUser]);

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
      case "processing": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "borrowed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing_return": return "bg-orange-100 text-orange-800 border-orange-200";
      case "returned": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function isOverdue(record) {
    if (record.status !== "borrowed" || !record.due_date) return false;
    return new Date(record.due_date) < new Date();
  }

  function formatDate(value) {
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
      return `${MM}/${DD}/${YYYY} ${hours}:${minutes}${ampm}`;
    } catch (e) {
      return value;
    }
  }

  function getDaysUntilDue(dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function handleReturn(record) {
    const id = record.id;
    // optimistic UI: mark this record as processing_return
    setBorrowHistory(prev => prev.map(r => r.id === id ? { ...r, status: 'processing_return' } : r));
    setPendingReturnIds(prev => Array.from(new Set([...prev, String(record.book_id)])));
    console.debug('[HISTORY][RETURN] clicked for recordId:', id, 'bookId:', record.book_id);
    toast.success('Return request sent. Waiting for admin approval.');
    apiClient.returnBook({ borrow_id: record.id })
      .then((res) => {
        console.debug('[HISTORY][RETURN] api success', res);
        // clear pending marker
        setPendingReturnIds(prev => prev.filter(bid => bid !== String(record.book_id)));
        try { window.dispatchEvent(new CustomEvent('borrow:created', { detail: { book_id: record.book_id } })); } catch (e) {}
      })
      .catch((err) => {
        // rollback
        setBorrowHistory(prev => prev.map(r => r.id === id ? { ...r, status: 'borrowed' } : r));
        setPendingReturnIds(prev => prev.filter(bid => bid !== String(record.book_id)));
        console.error('[HISTORY][RETURN][ERROR]', err);
        toast.error('Failed to send return request');
      });
  }

  const stats = useMemo(() => {
    const userRecords = borrowHistory.filter(record => record.user_id === currentUser?.id);
    return {
      total: userRecords.length,
      borrowed: userRecords.filter(r => r.status === "borrowed").length,
      returned: userRecords.filter(r => r.status === "returned").length,
      processing: userRecords.filter(r => r.status === "processing" || r.status === "processing_return").length
    };
  }, [borrowHistory, currentUser]);

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Borrowing History</h1>
          <p className="text-muted-foreground">Please log in to view your borrow history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Book className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Borrowed</p>
                  <p className="text-xl font-bold">{stats.borrowed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Returned</p>
                  <p className="text-xl font-bold">{stats.returned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-xl font-bold">{stats.processing}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 px-4 py-2 rounded-md text-sm w-44 flex items-center justify-between bg-input-background border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="borrowed">Borrowed</SelectItem>
              <SelectItem value="processing_return">Return pending</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-10 px-4 py-2 rounded-md text-sm w-44 flex items-center justify-between bg-input-background border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* History List */}
        <div className="space-y-4">
            <div className="max-h-[60vh] md:max-h-[520px] overflow-y-auto space-y-4">
          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No history found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "No results match your filters."
                    : "You don't have any borrow history yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredHistory.map((record) => (
              <Card key={record.id} className="border border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{record.book_title}</h3>
                          <p className="text-muted-foreground">by {record.book_author}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(record.status)}>
                          {getStatusText(record.status)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                              <span>Borrowed: {formatDate(record.borrow_date)}</span>
                          </div>
                        {record.return_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Returned: {formatDate(record.return_date)}</span>
                          </div>
                        )}
                        {record.due_date && record.status === "borrowed" && (
                          <div className={`flex items-center gap-1 ${
                            isOverdue(record) ? "text-destructive font-medium" : ""
                          }`}>
                            <Clock className="h-4 w-4" />
                            <span>
                              {isOverdue(record) 
                                ? `Overdue by ${Math.abs(getDaysUntilDue(record.due_date))} days`
                                : `${getDaysUntilDue(record.due_date)} days remaining`
                              }
                            </span>
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {record.book_genre}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex items-center">
                      {pendingReturnIds.includes(String(record.book_id)) ? (
                        <Button size="sm" disabled variant="secondary">Return pending</Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
            </div>
        </div>
      </div>
    </div>
  );
}
