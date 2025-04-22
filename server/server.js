// server/server.js
// Testing basic CORS functionality - Re-enabling app.use(cors(corsOptions))

// Import necessary modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db'); // Import the database pool setup

// Import route handlers (even though they are commented out below)
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

// --- CORS Configuration ---
const allowedOrigins = [
    'https://finance-app-nq2c.onrender.com', // Your deployed frontend
    // 'http://localhost:5173' // Add for local dev if needed
];
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or requests from allowed origins
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error('CORS Error: Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204 // For legacy browser compatibility
};

// --- Middleware Setup ---
// Apply CORS options to all routes - RE-ENABLING THIS LINE
app.use(cors(corsOptions));
// Explicitly handle preflight requests for all routes - KEEP COMMENTED FOR NOW
// app.options('*', cors(corsOptions));
// Parse JSON request bodies
app.use(express.json());
// Simple request logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// --- API Routes (KEEP COMMENTED OUT FOR INITIAL TEST) ---
try {
    console.log("INFO: Mounting /api/balance routes... (Currently Commented Out)");
    // app.use('/api/balance', balanceRoutes);

    console.log("INFO: Mounting /api/bills routes... (Currently Commented Out)");
    // app.use('/api/bills', billsRoutes);

    console.log("INFO: Mounting /api/credit_cards routes... (Currently Commented Out)");
    // app.use('/api/credit_cards', creditCardsRoutes);

    console.log("INFO: All API routes mounting points processed (currently commented out).");
} catch (mountError) {
    console.error("FATAL: Error occurred during route mounting section:", mountError);
    process.exit(1);
}

// --- Health Check & Test Routes (KEEP COMMENTED OUT FOR INITIAL TEST) ---
console.log("INFO: Health check routes are currently commented out.");
// app.get('/', (req, res) => {
//     res.status(200).send('Server is running.');
// });
// app.get('/db-test', async (req, res, next) => {
//     try {
//         const timeResult = await pool.query('SELECT NOW()');
//         res.status(200).json({ dbTime: timeResult.rows[0].now });
//     } catch (error) {
//         console.error('Database test connection error:', error);
//         next(error); // Pass to global handler
//     }
// });

// --- Global Error Handler (Should be placed AFTER all routes) ---
app.use((err, req, res, next) => {
    console.error('--- Global Error Handler Triggered ---');
    console.error(err.stack || err); // Log the full error stack
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

// --- Process Event Handlers (Good Practice) ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // process.exit(1); // Consider exiting
});
