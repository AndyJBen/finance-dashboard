// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import route handlers
import balanceRoutes from './routes/balance.js';
import billsRoutes from './routes/bills.js';
import creditCardsRoutes from './routes/credit_cards.js';
// Import database pool (assuming db.js exports the pool)
import pool from './db.js';
// Import debug helper if needed
import { logRequest } from '../../utils/debugHelper.js'; // Adjust path if necessary

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Determine __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---

// CORS Configuration (Allow all for debugging, tighten later)
const corsOptions = {
  origin: '*', // Allow all origins for now
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body Parsing Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Request Logging Middleware (Optional but helpful)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  // console.log('Headers:', req.headers); // Uncomment for detailed header logging
  // if (req.method !== 'GET') {
  //   console.log('Body:', req.body); // Log body for non-GET requests
  // }
  next();
});
// Or use your debug helper if preferred:
// app.use(logRequest);

// --- API Routes ---

// ** CORRECTED ROUTE MOUNTING **
// Use app.use() to mount the routers correctly
app.use('/api/balance', balanceRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/credit_cards', creditCardsRoutes);

// --- Test/Root Route ---
app.get('/', (req, res) => {
  console.log('Root route / accessed');
  res.status(200).send('Finance API is running!');
});

// --- Serve Frontend Static Files (If applicable) ---
// If your Node.js server also serves the React build
const frontendDistPath = path.join(__dirname, '..', 'dist'); // Adjust path to your frontend build directory
app.use(express.static(frontendDistPath));

// Handle SPA routing (send index.html for any route not handled by API or static files)
app.get('*', (req, res) => {
  // Check if the request is for an API route before sending index.html
  if (!req.originalUrl.startsWith('/api/')) {
    const indexPath = path.join(frontendDistPath, 'index.html');
    console.log(`Serving index.html for path: ${req.originalUrl} from ${indexPath}`);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error serving frontend application.');
      }
    });
  } else {
    // If it starts with /api/ but wasn't caught by routers, it's a 404
    console.log(`404 Not Found for API route: ${req.originalUrl}`);
    res.status(404).send('API endpoint not found.');
  }
});


// --- Error Handling Middleware ---
// Basic error handler (Add more specific handlers as needed)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      // Optionally include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// --- Server Startup ---
const PORT = process.env.PORT || 10000; // Render provides PORT env var
const HOST = '0.0.0.0'; // Listen on all available network interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
  // Optional: Test DB connection on startup
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Database connection failed:', err);
    } else {
      console.log('✅ Database connected successfully at', res.rows[0].now);
    }
  });
});

// Graceful shutdown (optional but good practice)
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // Close database connections here if necessary
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});