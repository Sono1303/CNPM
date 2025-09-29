const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
// Manual CORS headers for all API responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(bodyParser.json());

// Logging middleware
app.use(async (req, res, next) => {
  const start = Date.now();
  const { method, url, body } = req;
  const oldJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - start;
    console.log(`[API] ${method} ${url} | Body:`, body, '| Response:', data, '| Status:', res.statusCode, '| Time:', duration + 'ms');
    return oldJson.call(this, data);
  };
  next();
});

// Routes
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/borrow', require('./routes/borrowRoutes'));
// Có thể thêm các routes khác ở đây

// Root endpoint
app.get('/', (req, res) => {
  res.send('Library Management Backend is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
