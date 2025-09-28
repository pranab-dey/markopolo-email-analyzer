/**
 * Markopolo Subject Analyzer Server
 * Main server file that initializes the Express application
 * Implements Clean Architecture with proper separation of concerns
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const config = require('./src/config');
const routes = require('./src/routes');
const {
	errorHandler,
	notFoundHandler,
	requestLogger,
} = require('./src/middleware/errorHandler');

class Server {
	constructor() {
		this.app = express();
		this.port = config.port;
		this.setupMiddleware();
		this.setupRoutes();
		this.setupErrorHandling();
	}

	/**
	 * Sets up middleware for the Express application
	 */
	setupMiddleware() {
		// Security middleware
		this.app.use(
			helmet({
				contentSecurityPolicy: {
					directives: {
						defaultSrc: ["'self'"],
						styleSrc: [
							"'self'",
							"'unsafe-inline'",
							'https://cdn.tailwindcss.com',
						],
						scriptSrc: [
							"'self'",
							"'unsafe-inline'",
							'https://cdn.tailwindcss.com',
						],
						imgSrc: ["'self'", 'data:', 'https:'],
						connectSrc: ["'self'"],
					},
				},
			})
		);

		// CORS configuration
		this.app.use(
			cors({
				origin: process.env.NODE_ENV === 'production' ? [''] : true, // Allow all origins in development
				credentials: true,
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
				allowedHeaders: [
					'Content-Type',
					'Authorization',
					'X-Requested-With',
				],
			})
		);

		// Body parsing middleware
		this.app.use(express.json({ limit: '10mb' }));
		this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

		// Request logging
		this.app.use(requestLogger);

		// Serve static files (for frontend)
		this.app.use(express.static(path.join(__dirname, 'public')));
	}

	/**
	 * Sets up application routes
	 */
	setupRoutes() {
		// API routes
		this.app.use('/api', routes);

		// Serve frontend for all non-API routes
		this.app.get('*', (req, res) => {
			res.sendFile(path.join(__dirname, 'public', 'index.html'));
		});
	}

	/**
	 * Sets up error handling middleware
	 */
	setupErrorHandling() {
		// 404 handler for undefined routes
		this.app.use(notFoundHandler);

		// Global error handler
		this.app.use(errorHandler);
	}

	/**
	 * Starts the server
	 */
	start() {
		this.app.listen(this.port, () => {
			console.log(`
    Markopolo Subject Analyzer Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Server running on: http://localhost:${this.port}
 Environment: ${config.nodeEnv}
 API Endpoints:
   - POST /api/analyze-subject - Analyze subject lines
   - GET  /api/validation-rules - Get validation rules
   - GET  /api/health - Health check
   - GET  /api/info - API information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
		});

		// Graceful shutdown handling
		process.on('SIGTERM', () => {
			console.log('SIGTERM received. Shutting down gracefully...');
			process.exit(0);
		});

		process.on('SIGINT', () => {
			console.log('SIGINT received. Shutting down gracefully...');
			process.exit(0);
		});
	}
}

// Start the server
const server = new Server();
server.start();

module.exports = server;
