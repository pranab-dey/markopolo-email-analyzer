/**
 * Analysis Routes - Defines API endpoints for subject line analysis
 * Handles routing and middleware for analysis-related endpoints
 */
const express = require('express');
const AnalysisController = require('../controllers/analysisController');
const {
	analysisRateLimiter,
	apiRateLimiter,
} = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const analysisController = new AnalysisController();

/**
 * POST /api/analyze-subject
 * Analyzes a subject line and provides AI-powered improvements
 *
 * Request Body:
 * {
 *   "subject": "50% off everything!",
 *   "industry": "e-commerce"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "original": "50% off everything!",
 *     "score": 65,
 *     "issues": ["too generic", "overused phrase"],
 *     "suggestions": [...],
 *     "ai_insights": "...",
 *     "scoring_breakdown": {...},
 *     "detailed_metrics": {...}
 *   },
 *   "cached": false
 * }
 */
router.post(
	'/analyze-subject',
	analysisRateLimiter,
	asyncHandler(analysisController.analyzeSubject.bind(analysisController))
);

/**
 * GET /api/validation-rules
 * Returns validation rules for frontend form validation
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "maxSubjectLength": 200,
 *     "supportedIndustries": [...],
 *     "minSubjectLength": 1
 *   }
 * }
 */
router.get(
	'/validation-rules',
	apiRateLimiter,
	asyncHandler(analysisController.getValidationRules.bind(analysisController))
);

/**
 * GET /api/cache-stats
 * Returns cache statistics for monitoring (admin endpoint)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "stats": {...},
 *     "healthy": true
 *   }
 * }
 */
router.get(
	'/cache-stats',
	apiRateLimiter,
	asyncHandler(analysisController.getCacheStats.bind(analysisController))
);

module.exports = router;
