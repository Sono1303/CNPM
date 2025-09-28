const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

async function request(path, opts = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}/api${normalizedPath}`;

  // attach Authorization header if token exists in localStorage
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { ...(opts.headers || {}) };
  // normalize existing header keys to check for presence
  const hasAuth = Object.keys(headers).some(k => k.toLowerCase() === 'authorization');
  if (token && !hasAuth) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { credentials: "include", ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_name: payload.user_name, password: payload.password })
  });
}

export async function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_name: payload.user_name, password: payload.password, role: 'user' })
  });
}

export async function getBooks() {
  return request('/books');
}

export async function getBook(id) {
  return request(`/books/${id}`);
}

export async function createBook(payload) {
  return request('/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function updateBook(id, payload) {
  return request(`/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function deleteBook(id) {
  return request(`/books/${id}`, {
    method: 'DELETE'
  });
}

export async function searchByTitle(q) {
  return request(`/books/search/title?q=${encodeURIComponent(q)}`);
}

export async function borrowBook(payload) {
  return request('/borrow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function returnBook(payload) {
  return request('/borrow/return', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function approveBorrow(payload) {
  return request('/borrow/approve-borrow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function approveReturn(payload) {
  return request('/borrow/approve-return', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function getUserBorrowHistory() {
  return request('/borrow/history');
}

export async function getAllBorrows() {
  return request('/borrow/all-history');
}

export default {
  getBooks,
  getBook,
  searchByTitle,
  borrowBook,
  returnBook,
  approveBorrow,
  approveReturn,
  getUserBorrowHistory,
  getAllBorrows,
  loginUser,
  registerUser,
  createBook,
  updateBook,
  deleteBook
};
