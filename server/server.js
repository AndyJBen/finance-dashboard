// server/server.js
// Import necessary modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db'); // Import the database pool setup

// --- Environment Variable Check (Optional - Remove if not needed) ---
// Note: Removed dotenv require - rely on Render's injected env vars.
// Note: Removed DB_HOST/USER/etc checks if using DATABASE_URL in db.js
console.log('--- Environment Variables ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Attempting to read PORT:', process.env.PORT); // Log before parsing
// console.log('DATABASE_URL is set:', process.env.DATABASE_URL ? 'Yes' : 'No'); // Verify DATABASE_URL if needed
console.log('-----------------------------');
// --- End Environment Variable Check ---

// Import route handlers
const balanceRoutes = require('./routes/balance');
const billsRoutes = require('./routes/bills');
const creditCardsRoutes = require('./routes/credit_cards');

// Initialize the Express application
const app = express();

// --- Determine Port (Safer Parsing) ---
let port = parseInt(process.env.PORT, 10); // Try parsing Render's PORT directly

// Check if parsing failed or resulted in an invalid port number
if (isNaN(port) || port <= 0) {
    console.warn(`WARN: Invalid or missing PORT environment variable: "${process.env.PORT}". Render requires a valid PORT. Defaulting to 4000 for potential local use, but deployment will likely fail if PORT is missing/invalid in Render.`);
    // Defaulting might mask the underlying issue in Render if process.env.PORT is truly missing/invalid there.
    port = 4000; // Use 4000 only as a fallback, primarily for local dev
}
const PORT = port; // Assign the validated/defaulted port

// Final safety check
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
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error('CORS Error: Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

// --- Middleware Setup ---
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight
app.use(express.json());
app.use((req, res, next) => { // Request logger
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// --- API Routes ---
// !! IMPORTANT: Comment these out one by one to find the source of the startup crash !!
try {
    //console.log("INFO: Mounting /api/balance routes...");
    //app.use('/api/balance', balanceRoutes);
   //console.log("INFO: Mounting /api/bills routes...");
    //app.use('/api/bills', billsRoutes);
    //console.log("INFO: Mounting /api/credit_cards routes...");
    //app.use('/api/credit_cards', creditCardsRoutes);
    //console.log("INFO: All API routes mounted.");
} catch (mountError) {
    console.error("FATAL: Error occurred during route mounting:", mountError);
    process.exit(1); // Exit if mounting fails, as the app is broken
}


// --- Health Check & Test Routes ---
app.get('/', (req, res) => {
    res.status(200).send('Server is running.');
});
app.get('/db-test', async (req, res, next) => {
    try {
        const timeResult = await pool.query('SELECT NOW()');
        res.status(200).json({ dbTime: timeResult.rows[0].now });
    } catch (error) {
        console.error('Database test connection error:', error);
        next(error); // Pass to global handler
    }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error('--- Global Error Handler ---');
    console.error(err.stack || err);
    console.error('--------------------------');
    // Avoid sending stack trace in production
    const message = process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred on the server.'
        : err.message || 'An unexpected error occurred on the server.';
    res.status(err.status || 500).json({ message: message });
});

// --- Server Startup ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on host 0.0.0.0, port ${PORT}`);
    console.log(`API base URL might be accessible externally at something like: http://<your-render-service-name>.onrender.com`);

    // DB connection test is now in db.js via pool.connect, startup log confirms success/failure there.
    // Optional: Call an exported test function from db.js if needed
    // if (db.testConnection) { db.testConnection(); }
});

// --- Process Event Handlers ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider exiting gracefully after logging
  // process.exit(1);
});
