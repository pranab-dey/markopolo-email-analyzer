const rateLimit = require('express-rate-limit');
const config = require('../config');

const createRateLimiter = (options = {}) => {
	const defaultOptions = {
		windowMs: config.rateLimit.windowMs,
		max: config.rateLimit.maxRequests,
		message: {
			success: false,
			error: 'Too many requests',
			message: 'Rate limit exceeded. Please try again later.',
			retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
		},
		standardHeaders: true,
		legacyHeaders: false,
		handler: (req, res) => {
			res.status(429).json({
				success: false,
				error: 'Rate limit exceeded',
				message:
					'Too many requests from this IP. Please try again later.',
				retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
			});
		},
		skip: (req) => {
			// Skip rate limiting in development mode
			return config.nodeEnv === 'development';
		},
	};

	return rateLimit({ ...defaultOptions, ...options });
};

const analysisRateLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20, // 20 requests per 15 minutes
	message: {
		success: false,
		error: 'Analysis rate limit exceeded',
		message: 'Too many analysis requests. Please wait before trying again.',
		retryAfter: 900, // 15 minutes in seconds
	},
});

const apiRateLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // 100 requests per 15 minutes
	message: {
		success: false,
		error: 'API rate limit exceeded',
		message: 'Too many API requests. Please try again later.',
		retryAfter: 900,
	},
});

module.exports = {
	analysisRateLimiter,
	apiRateLimiter,
	createRateLimiter,
};
