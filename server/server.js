// server/server.js - Simplified Express 4.x-style approach

const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

// Import route files
const balanceRoutes = require('./routes/balance');
const billsRoutes = require('./routes/bills');
const creditCardsRoutes = require('./routes/credit_cards');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Log key environment info
console.log('--- Environment Variables ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');
console.log('-----------------------------');

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Very permissive for debugging
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} [${req.method}] ${req.originalUrl}`);
    next();
});

// Root endpoint for health check
app.get('/', (req, res) => {
    console.log('>>> Root route accessed');
    res.status(200).send('Server is running');
});

// Direct test endpoints - useful for debugging
app.get('/ping', (req, res) => {
    console.log('>>> /ping endpoint accessed');
    res.status(200).json({ message: 'pong', timestamp: new Date().toISOString() });
});

app.get('/api/ping', (req, res) => {
    console.log('>>> /api/ping endpoint accessed');
    res.status(200).json({ message: 'API is online', timestamp: new Date().toISOString() });
});

// Mount API routes - Explicitly defining each major endpoint
app.get('/api/balance', balanceRoutes);
app.put('/api/balance', balanceRoutes);

app.get('/api/bills', billsRoutes);
app.post('/api/bills', billsRoutes);
app.patch('/api/bills/:id', (req, res, next) => {
    console.log(`>>> Bills PATCH route with ID: ${req.params.id}`);
    next();
}, billsRoutes);
app.delete('/api/bills/:id', (req, res, next) => {
    console.log(`>>> Bills DELETE route with ID: ${req.params.id}`);
    next();
}, billsRoutes);

app.get('/api/credit_cards', creditCardsRoutes);
app.post('/api/credit_cards', creditCardsRoutes);
app.patch('/api/credit_cards/:id', creditCardsRoutes);
app.delete('/api/credit_cards/:id', creditCardsRoutes);

// DB test endpoint
app.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            dbTime: result.rows[0].now,
            message: 'Database connection successful'
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// 404 handler
app.use((req, res) => {
    console.error(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? null : err.message
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API should be accessible at https://finance-api.onrender.com`);
});

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit in production
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});