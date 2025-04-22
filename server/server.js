// server/server.js
// Finance Dashboard API server

// Import necessary modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db'); // Import the database pool setup

// Import route handlers
const balanceRoutes = require('./routes/balance');
const billsRoutes = require('./routes/bills');
const creditCardsRoutes = require('./routes/credit_cards');

// Log environment info
console.log('--- Environment Variables ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Attempting to read PORT:', process.env.PORT);
console.log('-----------------------------');

// Initialize the Express application
const app = express();

// --- Determine Port (Safer Parsing) ---
let port = parseInt(process.env.PORT, 10);
if (isNaN(port) || port <= 0) {
    console.warn(`WARN: Invalid or missing PORT environment variable: "${process.env.PORT}". Defaulting to 4000.`);
    port = 4000; // Fallback for local dev
}
const PORT = port;
if (isNaN(PORT)) {
   console.error("FATAL: Could not determine a valid PORT. Exiting.");
   process.exit(1);
}
console.log(`INFO: Determined PORT: ${PORT}`);
// --- End Port Determination ---

// --- JSON body parsing middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Detailed request logging ---
app.use((req, res, next) => {
    console.log(`\n--- INCOMING REQUEST ${new Date().toISOString()} ---`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log(`Path: ${req.path}`);
    console.log(`Original URL: ${req.originalUrl}`);
    console.log(`Query params:`, req.query);
    console.log(`Headers:`, req.headers);
    console.log(`Body:`, req.body);
    console.log(`-------------------------------------------`);
    next();
});

// --- Global CORS middleware ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// --- Response send logging ---
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
        console.log(`Sending response for ${req.method} ${req.originalUrl}`);
        return originalSend.call(this, body);
    };
    next();
});

// --- Basic test routes ---
app.get('/', (req, res) => {
    console.log('>>> Root route hit!');
    res.status(200).send('Server is running. Try /api/ping to test API connectivity.');
});
app.get('/ping', (req, res) => {
    console.log('>>> /ping route hit!');
    res.status(200).json({ message: 'pong from root' });
});

// --- API root handlers ---
app.get('/api', (req, res) => {
    console.log('>>> /api root route hit!');
    res.status(200).json({ message: 'API is running' });
});
app.get('/api/ping', (req, res) => {
    console.log('>>> /api/ping route hit!');
    res.status(200).json({ message: 'pong from api' });
});

// --- Mount API routes ---
try {
    console.log("INFO: Mounting /api/balance routes...");
    app.use('/api/balance', balanceRoutes);

    console.log("INFO: Mounting /api/bills routes...");
    app.use('/api/bills', billsRoutes);

    console.log("INFO: Mounting /api/credit_cards routes...");
    app.use('/api/credit_cards', creditCardsRoutes);

    console.log("INFO: All API routes mounted successfully.");
} catch (mountError) {
    console.error("FATAL: Error during route mounting:", mountError);
    process.exit(1);
}

// --- Health Check & DB Test Route ---
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
        next(error);
    }
});

// --- Handle CORS preflight for all routes ---
app.options('/*', cors()); // Updated to valid catch-all pattern

// --- 404 handler ---
app.use((req, res) => {
    console.log(`404: Route not found for ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
    console.error('--- Global Error Handler Triggered ---');
    console.error('Route:', req.method, req.originalUrl);
    console.error(err.stack || err);
    console.error('------------------------------------');

    const statusCode = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred on the server.'
        : err.message || 'An unexpected error occurred on the server.';

    res.status(statusCode).json({ message });
});

// --- Server Startup ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on host 0.0.0.0, port ${PORT}`);
});

// --- Process Event Handlers ---
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
