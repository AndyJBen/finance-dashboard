// server/server.js
require('dotenv').config(); // Load environment variables from .env file first
const express = require('express');
const cors = require('cors');
const path = require('path'); // Optional: if serving static files from backend

// --- Initialize Express App ---
const app = express();

// ✅ Ensure PORT is a number so Render can bind properly
const PORT = parseInt(process.env.PORT, 10) || 4000;

// ✅ CORS setup: Allow only your frontend's deployed domain
const allowedOrigins = [
  'https://finance-app-nq2c.onrender.com', // Replace with your actual frontend Render URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
}));

// --- Middleware ---
app.use(express.json()); // Enable parsing of JSON request bodies

// Optional: Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// --- Import API Routers ---
const billsRouter = require('./routes/bills');
const balanceRouter = require('./routes/balance');
const creditCardsRouter = require('./routes/credit_cards');

// --- Define API Routes ---
app.use('/api/bills', billsRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/credit_cards', creditCardsRouter);

// --- Optional: Serve Static Files from React in Production ---
// if (process.env.NODE_ENV === 'production') {
//   const clientBuildPath = path.join(__dirname, '../client/dist');
//   console.log(`Serving static files from: ${clientBuildPath}`);
//   app.use(express.static(clientBuildPath));
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(clientBuildPath, 'index.html'));
//   });
// }

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('Personal Finance Dashboard API is running!');
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
});
