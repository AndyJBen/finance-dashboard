require('dotenv').config();               // Load .env
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 4000;

// CORS: only allow your frontend origin
const ALLOWED_ORIGINS = [
  'https://finance-app-nq2c.onrender.com'
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  optionsSuccessStatus: 200
}));

app.use(express.json());  // parse JSON bodies

// simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ▶ ${req.method} ${req.originalUrl}`);
  next();
});

// import routers
const billsRouter       = require('./routes/bills');
const balanceRouter     = require('./routes/balance');
const creditCardsRouter = require('./routes/credit_cards');

// mount routes under /api
app.use('/api/bills',       billsRouter);
app.use('/api/balance',     balanceRouter);
app.use('/api/credit_cards', creditCardsRouter);

// root health-check
app.get('/', (req, res) => {
  res.send('Personal Finance Dashboard API is running!');
});

// global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error ▶', err.stack || err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
});
