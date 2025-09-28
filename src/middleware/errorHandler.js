const config = require('../config');

const errorHandler = (err, req, res, next) => {
	console.error('Error occurred:', {
		message: err.message,
		stack: err.stack,
		url: req.url,
		method: req.method,
		ip: req.ip,
		userAgent: req.get('User-Agent'),
		timestamp: new Date().toISOString(),
	});

	// Default error response
	let statusCode = 500;
	let errorMessage = 'Internal server error';
	let errorDetails = null;

	// Handle specific error types
	if (err.name === 'ValidationError') {
		statusCode = 400;
		errorMessage = 'Validation failed';
		errorDetails = err.details || err.message;
	} else if (err.name === 'RateLimitError') {
		statusCode = 429;
		errorMessage = 'Rate limit exceeded';
	} else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
		statusCode = 503;
		errorMessage = 'External service unavailable';
	} else if (err.message.includes('OpenAI')) {
		statusCode = 503;
		errorMessage = 'AI service temporarily unavailable';
	}

	const errorResponse = {
		success: false,
		error: errorMessage,
		timestamp: new Date().toISOString(),
		path: req.path,
		method: req.method,
	};

	// Add error details in development mode
	if (config.nodeEnv === 'development') {
		errorResponse.details = errorDetails || err.message;
		errorResponse.stack = err.stack;
	}

	// Add retry information for rate limiting
	if (statusCode === 429) {
		errorResponse.retryAfter = Math.ceil(config.rateLimit.windowMs / 1000);
	}

	res.status(statusCode).json(errorResponse);
};

const notFoundHandler = (req, res) => {
	res.status(404).json({
		success: false,
		error: 'Route not found',
		message: `The requested route ${req.method} ${req.path} does not exist`,
		timestamp: new Date().toISOString(),
	});
};

const asyncHandler = (fn) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

const requestLogger = (req, res, next) => {
	const start = Date.now();

	res.on('finish', () => {
		const duration = Date.now() - start;
		console.log(
			`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.ip}`
		);
	});

	next();
};

module.exports = {
	errorHandler,
	notFoundHandler,
	asyncHandler,
	requestLogger,
};
