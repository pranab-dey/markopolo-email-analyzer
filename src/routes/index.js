const express = require('express');
const analysisRoutes = require('./analysisRoutes');

const router = express.Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (req, res) => {
	res.json({
		success: true,
		message: 'Markopolo Subject Analyzer API is running',
		timestamp: new Date().toISOString(),
		version: '1.0.0',
	});
});

/**
 * API information endpoint
 * GET /api/info
 */
router.get('/info', (req, res) => {
	res.json({
		success: true,
		data: {
			name: 'Markopolo Subject Analyzer API',
			version: '1.0.0',
			description:
				'AI-powered email subject line analysis and optimization',
			endpoints: {
				'POST /api/analyze-subject':
					'Analyze subject line and get AI suggestions',
				'GET /api/validation-rules':
					'Get validation rules for frontend',
				'GET /api/cache-stats': 'Get cache statistics',
				'GET /api/health': 'Health check endpoint',
				'GET /api/info': 'API information',
			},
			supportedIndustries: [
				'e-commerce',
				'saas',
				'retail',
				'healthcare',
				'finance',
				'education',
			],
		},
	});
});

// Mount analysis routes
router.use('/', analysisRoutes);

module.exports = router;
