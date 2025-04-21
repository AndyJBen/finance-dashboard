// server/server.js
require('dotenv').config(); // Load environment variables from .env file first
const express = require('express');
const cors = require('cors');
const path = require('path'); // Optional: if serving static files from backend

// --- Initialize Express App ---
const app = express();
// Define the port the server will listen on, using environment variable or default
const PORT = process.env.PORT || 4000;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) for all origins
// TODO: Configure specific origins for production environments for better security
app.use(cors());

// Enable parsing of JSON request bodies (needed for POST/PUT/PATCH requests)
app.use(express.json());

// Optional: Simple request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next(); // Pass control to the next middleware/route handler
});

// --- Import API Routers ---
const billsRouter = require('./routes/bills'); // Router for /api/bills
const balanceRouter = require('./routes/balance'); // Router for /api/balance
const creditCardsRouter = require('./routes/credit_cards'); // Router for /api/credit_cards

// --- Define API Routes ---
// Mount the imported routers under their respective base paths
app.use('/api/bills', billsRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/credit_cards', creditCardsRouter); // Mount the new credit cards router

// --- Optional: Serve Static Files (React Build) in Production ---
// This section is relevant if you build your React app and want Node.js to serve it
// if (process.env.NODE_ENV === 'production') {
//   // Define the path to the React build directory
//   const clientBuildPath = path.join(__dirname, '../client/dist'); // Adjust '../client/dist' as needed
//   console.log(`Serving static files from: ${clientBuildPath}`);
//   // Serve static files (HTML, CSS, JS) from the build directory
//   app.use(express.static(clientBuildPath));
//
//   // For any request that doesn't match an API route or a static file,
//   // serve the main index.html file (for client-side routing)
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(clientBuildPath, 'index.html'));
//   });
// }

// --- Basic Root Route (Optional) ---
// Simple response to check if the API server is running
app.get('/', (req, res) => {
  res.send('Personal Finance Dashboard API is running!');
});

// --- Global Error Handler (Basic Example) ---
// Catches errors passed via next(err) from route handlers
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message || err);
  // Send a generic server error response
  // Avoid sending detailed stack traces to the client in production
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api`);

});
