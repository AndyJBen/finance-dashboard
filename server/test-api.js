// server/test-api.js - Simple API test

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Log each request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test routes
app.get('/', (req, res) => {
  res.send('Test API is running');
});

app.get('/api', (req, res) => {
  res.json({ message: 'API root endpoint working' });
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.get('/api/balance', (req, res) => {
  res.json({ balance: 1000 });
});

app.get('/api/bills', (req, res) => {
  res.json([
    { id: 1, name: 'Test Bill', amount: 50, dueDate: '2025-04-30' }
  ]);
});

app.get('/api/credit_cards', (req, res) => {
  res.json([
    { id: 1, name: 'Test Card', balance: 200 }
  ]);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test API running on port ${PORT}`);
});