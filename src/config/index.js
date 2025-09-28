require('dotenv').config();

const config = {
	port: process.env.PORT || 3000,
	nodeEnv: process.env.NODE_ENV || 'development',

	openai: {
		apiKey: process.env.OPENAI_API_KEY,
		model: 'gpt-3.5-turbo',
		maxTokens: 500,
		temperature: 0.7,
	},

	rateLimit: {
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
		maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
	},

	cache: {
		ttl: parseInt(process.env.CACHE_TTL_SECONDS) || 3600,
	},

	validation: {
		maxSubjectLength: 200,
		supportedIndustries: [
			'e-commerce',
			'saas',
			'retail',
			'healthcare',
			'finance',
			'education',
		],
	},
};

module.exports = config;
