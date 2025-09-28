const config = require('../config');

class ScoringService {
	constructor() {
		this.spamTriggers = [
			'free',
			'urgent',
			'act now',
			'limited time',
			'click here',
			'buy now',
			'save money',
			'earn money',
			'make money',
			'work from home',
			'guaranteed',
			'no obligation',
			'risk free',
			'congratulations',
			'winner',
			'cash',
			'$$$',
			'!!!',
			'100% free',
			'act fast',
			'limited offer',
		];

		this.positiveWords = [
			'new',
			'exclusive',
			'personal',
			'custom',
			'tailored',
			'insider',
			'premium',
			'advanced',
			'innovative',
			'breakthrough',
			'solution',
			'results',
			'success',
			'improve',
			'enhance',
			'optimize',
			'transform',
		];
	}

	calculateScore(subject, industry) {
		const metrics = {
			length: this.scoreLength(subject),
			spam: this.scoreSpamTriggers(subject),
			personalization: this.scorePersonalization(subject),
			urgency: this.scoreUrgency(subject),
			clarity: this.scoreClarity(subject),
			industry: this.scoreIndustryRelevance(subject, industry),
		};

		// Weighted average calculation
		const weights = {
			length: 0.15,
			spam: 0.2,
			personalization: 0.15,
			urgency: 0.15,
			clarity: 0.2,
			industry: 0.15,
		};

		const totalScore = Object.keys(metrics).reduce((sum, key) => {
			return sum + metrics[key] * weights[key];
		}, 0);

		return {
			total: Math.round(totalScore),
			breakdown: metrics,
			weights,
		};
	}

	/**
	 * Scores subject line length (optimal: 30-50 characters)
	 * @param {string} subject - Subject line
	 * @returns {number} Score 0-100
	 */
	scoreLength(subject) {
		const length = subject.length;

		if (length < 20) return 40; // Too short
		if (length <= 30) return 80; // Good
		if (length <= 50) return 100; // Optimal
		if (length <= 70) return 85; // Acceptable
		if (length <= 100) return 60; // Getting long
		return 30; // Too long
	}

	/**
	 * Scores spam trigger usage (lower is better)
	 * @param {string} subject - Subject line
	 * @returns {number} Score 0-100
	 */
	scoreSpamTriggers(subject) {
		const lowerSubject = subject.toLowerCase();
		const triggerCount = this.spamTriggers.filter((trigger) =>
			lowerSubject.includes(trigger)
		).length;

		if (triggerCount === 0) return 100;
		if (triggerCount === 1) return 70;
		if (triggerCount === 2) return 40;
		return 10; // Multiple triggers
	}

	/**
	 * Scores personalization elements
	 * @param {string} subject - Subject line
	 * @returns {number} Score 0-100
	 */
	scorePersonalization(subject) {
		const personalizationIndicators = [
			'your',
			'you',
			'personal',
			'custom',
			'tailored',
			'exclusive',
			'insider',
			'vip',
			'member',
			'account',
			'profile',
		];

		const lowerSubject = subject.toLowerCase();
		const hasPersonalization = personalizationIndicators.some((indicator) =>
			lowerSubject.includes(indicator)
		);

		return hasPersonalization ? 100 : 50;
	}

	/**
	 * Scores urgency and actionability
	 * @param {string} subject - Subject line
	 * @returns {number} Score 0-100
	 */
	scoreUrgency(subject) {
		const urgencyWords = [
			'now',
			'today',
			'limited',
			'expires',
			'deadline',
			'last chance',
			'final',
			'ending soon',
			'hurry',
			'quick',
			'immediate',
		];

		const lowerSubject = subject.toLowerCase();
		const hasUrgency = urgencyWords.some((word) =>
			lowerSubject.includes(word)
		);

		return hasUrgency ? 100 : 60;
	}

	/**
	 * Scores clarity and readability
	 * @param {string} subject - Subject line
	 * @returns {number} Score 0-100
	 */
	scoreClarity(subject) {
		let score = 100;

		// Penalize excessive punctuation
		const punctuationCount = (subject.match(/[!?]{2,}/g) || []).length;
		score -= punctuationCount * 20;

		// Penalize all caps
		const capsRatio =
			(subject.match(/[A-Z]/g) || []).length / subject.length;
		if (capsRatio > 0.5) score -= 30;

		// Penalize excessive numbers/symbols
		const symbolCount = (subject.match(/[0-9$%&*]/g) || []).length;
		if (symbolCount > 3) score -= 20;

		return Math.max(0, score);
	}

	/**
	 * Scores industry relevance
	 * @param {string} subject - Subject line
	 * @param {string} industry - Industry context
	 * @returns {number} Score 0-100
	 */
	scoreIndustryRelevance(subject, industry) {
		const industryKeywords = {
			'e-commerce': [
				'shop',
				'buy',
				'sale',
				'deal',
				'product',
				'order',
				'cart',
				'checkout',
			],
			saas: [
				'software',
				'app',
				'platform',
				'tool',
				'solution',
				'feature',
				'upgrade',
				'trial',
			],
			retail: [
				'store',
				'shop',
				'sale',
				'discount',
				'offer',
				'product',
				'brand',
				'fashion',
			],
			healthcare: [
				'health',
				'medical',
				'doctor',
				'treatment',
				'wellness',
				'care',
				'patient',
			],
			finance: [
				'money',
				'investment',
				'bank',
				'credit',
				'loan',
				'financial',
				'wealth',
				'savings',
			],
			education: [
				'learn',
				'course',
				'education',
				'training',
				'skill',
				'knowledge',
				'study',
				'class',
			],
		};

		const keywords = industryKeywords[industry] || [];
		const lowerSubject = subject.toLowerCase();

		const relevantKeywords = keywords.filter((keyword) =>
			lowerSubject.includes(keyword)
		).length;

		if (relevantKeywords === 0) return 50;
		if (relevantKeywords === 1) return 75;
		if (relevantKeywords >= 2) return 100;

		return 60;
	}

	/**
	 * Identifies common issues in subject lines
	 * @param {string} subject - Subject line
	 * @returns {Array} List of identified issues
	 */
	identifyIssues(subject) {
		const issues = [];

		if (subject.length < 20) {
			issues.push('too short');
		}

		if (subject.length > 70) {
			issues.push('too long');
		}

		const lowerSubject = subject.toLowerCase();
		const spamTriggers = this.spamTriggers.filter((trigger) =>
			lowerSubject.includes(trigger)
		);

		if (spamTriggers.length > 0) {
			issues.push('contains spam triggers');
		}

		if ((subject.match(/[!?]{2,}/g) || []).length > 0) {
			issues.push('excessive punctuation');
		}

		const capsRatio =
			(subject.match(/[A-Z]/g) || []).length / subject.length;
		if (capsRatio > 0.5) {
			issues.push('too many capital letters');
		}

		if (!lowerSubject.includes('your') && !lowerSubject.includes('you')) {
			issues.push('lacks personalization');
		}

		return issues;
	}
}

module.exports = ScoringService;
