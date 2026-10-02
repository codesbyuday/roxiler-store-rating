const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware: Enable CORS with configured origin
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Middleware: Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Root route for API welcome / liveness
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Store Rating Platform API is active',
    healthCheck: '/api/health',
  });
});

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
