const AIService = require('../services/aiService');
const ScoringService = require('../services/scoringService');
const CacheService = require('../services/cacheService');
const SubjectValidator = require('../validators/subjectValidator');

class AnalysisController {
	constructor() {
		this.aiService = new AIService();
		this.scoringService = new ScoringService();
		this.cacheService = new CacheService();
		this.validator = new SubjectValidator();
	}

	async analyzeSubject(req, res) {
		try {
			const validation = this.validator.validate(req.body);
			if (!validation.success) {
				return res.status(400).json({
					success: false,
					error: 'Validation failed',
					details: validation.errors,
				});
			}

			const { subject, industry } = validation.data;

			const cachedResult = this.cacheService.get(subject, industry);
			if (cachedResult) {
				return res.json({
					success: true,
					data: cachedResult,
					cached: true,
				});
			}

			const analysisResult = await this.performAnalysis(
				subject,
				industry
			);

			this.cacheService.set(subject, industry, analysisResult);

			res.json({
				success: true,
				data: analysisResult,
				cached: false,
			});
		} catch (error) {
			console.error('Analysis Controller Error:', error);

			if (error.message.includes('OpenAI API key')) {
				return res.status(500).json({
					success: false,
					error: 'AI service configuration error',
					message: 'Please check OpenAI API key configuration',
				});
			}

			if (error.message.includes('Failed to analyze')) {
				return res.status(503).json({
					success: false,
					error: 'AI service temporarily unavailable',
					message: 'Please try again later',
				});
			}

			res.status(500).json({
				success: false,
				error: 'Internal server error',
				message:
					'An unexpected error occurred while analyzing the subject line',
			});
		}
	}

	async performAnalysis(subject, industry) {
		const scoringResult = this.scoringService.calculateScore(
			subject,
			industry
		);
		const ruleBasedIssues = this.scoringService.identifyIssues(subject);

		try {
			const aiResult = await this.aiService.analyzeSubjectLine(
				subject,
				industry
			);

			return {
				original: subject,
				score: Math.round((scoringResult.total + aiResult.score) / 2),
				issues: this.mergeIssues(ruleBasedIssues, aiResult.issues),
				suggestions: aiResult.suggestions,
				ai_insights: aiResult.ai_insights,
				scoring_breakdown: {
					rule_based: scoringResult.total,
					ai_based: aiResult.score,
					combined: Math.round(
						(scoringResult.total + aiResult.score) / 2
					),
				},
				detailed_metrics: scoringResult.breakdown,
				industry: industry,
				analyzed_at: new Date().toISOString(),
			};
		} catch (aiError) {
			console.error(
				'AI analysis failed, using rule-based only:',
				aiError
			);

			return {
				original: subject,
				score: scoringResult.total,
				issues: ruleBasedIssues,
				suggestions: this.generateFallbackSuggestions(
					subject,
					industry
				),
				ai_insights:
					'AI analysis is temporarily unavailable. This analysis is based on industry best practices and rule-based scoring.',
				scoring_breakdown: {
					rule_based: scoringResult.total,
					ai_based: null,
					combined: scoringResult.total,
				},
				detailed_metrics: scoringResult.breakdown,
				industry: industry,
				analyzed_at: new Date().toISOString(),
			};
		}
	}

	mergeIssues(ruleIssues, aiIssues) {
		const allIssues = [...ruleIssues, ...aiIssues];
		return [...new Set(allIssues)];
	}

	generateFallbackSuggestions(subject, industry) {
		const base = subject.trim();
		const industryContext = this.getIndustryContext(industry);

		return [
			`${industryContext.prefix} ${base}`,
			`Limited Time: ${base}`,
			`Exclusive: ${base}`,
		];
	}

	getIndustryContext(industry) {
		const contexts = {
			'e-commerce': { prefix: 'Shop Now:' },
			saas: { prefix: 'Try Now:' },
			retail: { prefix: 'Visit Now:' },
			healthcare: { prefix: 'Learn More:' },
			finance: { prefix: 'Discover:' },
			education: { prefix: 'Start Learning:' },
		};

		return contexts[industry] || { prefix: 'Check Out:' };
	}

	getValidationRules(req, res) {
		try {
			const rules = this.validator.getValidationRules();
			res.json({
				success: true,
				data: rules,
			});
		} catch (error) {
			console.error('Error getting validation rules:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get validation rules',
			});
		}
	}

	getCacheStats(req, res) {
		try {
			const stats = this.cacheService.getStats();
			const isHealthy = this.cacheService.isHealthy();

			res.json({
				success: true,
				data: {
					stats,
					healthy: isHealthy,
				},
			});
		} catch (error) {
			console.error('Error getting cache stats:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get cache statistics',
			});
		}
	}
}

module.exports = AnalysisController;
