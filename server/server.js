// server/server.js

// Import necessary modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db'); // Import the database pool setup

// Import route handlers
const balanceRoutes = require('./routes/balance');
const billsRoutes = require('./routes/bills');
const creditCardsRoutes = require('./routes/credit_cards');

console.log('--- Environment Variables ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Attempting to read PORT:', process.env.PORT);
console.log('-----------------------------');

// Initialize the Express application
const app = express();

// --- Determine Port (Safer Parsing) ---
let port = parseInt(process.env.PORT, 10);
if (isNaN(port) || port <= 0) {
    console.warn(`WARN: Invalid or missing PORT environment variable: "${process.env.PORT}". Render requires a valid PORT. Defaulting to 4000 for potential local use, but deployment will likely fail if PORT is missing/invalid in Render.`);
    port = 4000; // Fallback for local dev
}
const PORT = port;
if (isNaN(PORT)) {
   console.error("FATAL: Could not determine a valid PORT. Exiting.");
   process.exit(1);
}
console.log(`INFO: Determined PORT: ${PORT}`);
// --- End Port Determination ---

// --- Debug incoming requests middleware ---
app.use((req, res, next) => {
    console.log(`DEBUG [${new Date().toISOString()}]: Received ${req.method} request to ${req.originalUrl}`);
    next();
});

// --- Simplified CORS for debugging ---
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}));

// --- JSON Body Parsing ---
app.use(express.json());

// --- Request Logging ---
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// --- Catch-all debugger to see if requests reach Express ---
app.use((req, res, next) => {
    console.log(`ROUTE DEBUG: ${req.method} ${req.originalUrl} reached Express router`);
    next();
});

// --- Direct Test Routes (before API routes) ---
app.get('/ping', (req, res) => {
    console.log('>>> Root /ping route hit!');
    res.status(200).json({ message: 'pong from root path' });
});

app.get('/api/ping', (req, res) => {
    console.log('>>> /api/ping route hit!');
    res.status(200).json({ message: 'pong from api path' });
});
// --- End Direct Test Routes ---

// --- Explicit API Root Handler ---
app.get('/api', (req, res) => {
    console.log('>>> /api root route hit!');
    res.status(200).json({ message: 'API is running' });
});

// --- API Routes with explicit path logging ---
try {
    console.log("INFO: Mounting /api/balance routes...");
    app.use('/api/balance', (req, res, next) => {
        console.log(`Balance route middleware hit: ${req.method} ${req.originalUrl}`);
        next();
    }, balanceRoutes);

    console.log("INFO: Mounting /api/bills routes...");
    app.use('/api/bills', (req, res, next) => {
        console.log(`Bills route middleware hit: ${req.method} ${req.originalUrl}`);
        next();
    }, billsRoutes);

    console.log("INFO: Mounting /api/credit_cards routes...");
    app.use('/api/credit_cards', (req, res, next) => {
        console.log(`Credit cards route middleware hit: ${req.method} ${req.originalUrl}`);
        next();
    }, creditCardsRoutes);

    console.log("INFO: All API routes mounting points processed.");
} catch (mountError) {
    console.error("FATAL: Error occurred during route mounting section:", mountError);
    process.exit(1);
}

// --- Health Check & Test Routes ---
console.log("INFO: Health check routes are enabled.");
app.get('/', (req, res) => {
    console.log('>>> Root route hit!');
    res.status(200).send('Server is running. Try /api/ping to test API connectivity.');
});

app.get('/db-test', async (req, res, next) => {
    try {
        console.log('>>> DB test route hit!');
        const timeResult = await pool.query('SELECT NOW()');
        res.status(200).json({ 
            dbTime: timeResult.rows[0].now,
            message: 'Database connection successful'
        });
    } catch (error) {
        console.error('Database test connection error:', error);
        next(error); // Pass to global handler
    }
});

// --- 404 Handler (after all routes) ---
app.use((req, res) => {
    console.log(`404: Route not found for ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error('--- Global Error Handler Triggered ---');
    console.error('Route:', req.method, req.originalUrl);
    console.error(err.stack || err);
    console.error('------------------------------------');
    const message = process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred on the server.'
        : err.message || 'An unexpected error occurred on the server.';
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({ message: message });
});

// --- Server Startup ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on host 0.0.0.0, port ${PORT}`);
    console.log(`API base URL might be accessible externally at something like: http://<your-render-service-name>.onrender.com`);
});

// --- Process Event Handlers ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Uncomment if you want to terminate on uncaught exceptions
  // process.exit(1);
});