// server/server.js
// Import necessary modules
const express = require('express');
const cors = require('cors');
const path = require('path'); // Needed if using dotenv relative path
const pool = require('./db'); // Import the database pool setup

// Load environment variables from .env file in the 'server' directory
// Make sure the .env file is actually present in the deployment environment
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

// --- Environment Variable Check (Add this for debugging in Render logs) ---
console.log('--- Environment Variables ---');
console.log('NODE_ENV:', process.env.NODE_ENV); // Useful for conditional logic
console.log('PORT (raw):', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST ? 'Loaded' : 'MISSING!');
console.log('DB_USER:', process.env.DB_USER ? 'Loaded' : 'MISSING!');
console.log('DB_DATABASE:', process.env.DB_DATABASE ? 'Loaded' : 'MISSING!');
console.log('DB_PORT:', process.env.DB_PORT ? 'Loaded' : 'MISSING!');
// Add any other critical env vars you rely on
console.log('-----------------------------');
// --- End Environment Variable Check ---

// Import route handlers
const balanceRoutes = require('./routes/balance');
const billsRoutes = require('./routes/bills');
const creditCardsRoutes = require('./routes/credit_cards');

// Initialize the Express application
const app = express();

// Determine the port
// Render provides the PORT environment variable. Default to 4000 for local dev.
const PORT = parseInt(process.env.PORT || '4000', 10);
if (isNaN(PORT)) {
    console.error("Invalid PORT environment variable. Exiting.");
    process.exit(1);
}

// --- CORS Configuration ---
// Define allowed origins. Be specific for production.
const allowedOrigins = [
    'https://finance-app-nq2c.onrender.com', // Your deployed frontend
    // Add 'http://localhost:5173' or similar for local development if needed
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or requests from allowed origins
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error('CORS Error: Origin not allowed:', origin); // Log blocked origins
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow common methods
    credentials: true, // If you need to handle cookies or authorization headers
    optionsSuccessStatus: 204 // For preflight requests
};

// --- Middleware Setup (Order is important!) ---

// 1. Enable CORS with the specified options *before* any routes
app.use(cors(corsOptions));
// Handle preflight requests across all routes
app.options('*', cors(corsOptions));

// 2. Enable JSON body parsing
app.use(express.json());

// 3. Simple request logger (optional but helpful)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// --- API Routes ---
// Mount all API routes under the /api prefix
// Ensure this matches the VITE_API_URL in the frontend
app.use('/api/balance', balanceRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/credit_cards', creditCardsRoutes);
// Add other API routes here...

// --- Health Check Route ---
// Simple route at the root to verify the server is running
app.get('/', (req, res) => {
    res.status(200).send('Server is running.');
});

// --- Database Connection Test Route (Optional) ---
// Useful for verifying DB connectivity from the deployed instance
app.get('/db-test', async (req, res, next) => {
    try {
        const timeResult = await pool.query('SELECT NOW()');
        res.status(200).json({ dbTime: timeResult.rows[0].now });
    } catch (error) {
        console.error('Database test connection error:', error);
        // Pass the error to the global error handler
        next(error);
    }
});


// --- Global Error Handler ---
// Catches errors passed via next(error) or uncaught synchronous errors
// Must be defined *after* all other app.use() and routes
app.use((err, req, res, next) => {
    console.error('--- Global Error Handler ---');
    console.error(err.stack || err); // Log the full error stack
    console.error('--------------------------');
    res.status(500).json({
        message: 'An unexpected error occurred on the server.',
        // Optionally include error details in development, but not production
        // error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// --- Server Startup ---
// Listen on the determined port and IP '0.0.0.0' to be accessible in Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on port ${PORT}`);
    // Log the base URL for clarity, especially if PORT is assigned by Render
    console.log(`API base URL might be accessible externally at something like: http://<your-render-service-name>.onrender.com`);
    console.log(`Or locally at: http://localhost:${PORT}`);

    // Verify DB connection on startup (from db.js)
    // Assuming db.js exports the pool and potentially has a test function
    pool.query('SELECT NOW()')
        .then(res => console.log(`✅ DB connection successful at ${res.rows[0].now}`))
        .catch(err => console.error('❌ Initial DB connection failed:', err.stack));
});

// Handle unhandled promise rejections (optional but good practice)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});
