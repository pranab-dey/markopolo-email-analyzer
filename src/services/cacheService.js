const NodeCache = require('node-cache');
const config = require('../config');

class CacheService {
	constructor() {
		this.cache = new NodeCache({
			stdTTL: config.cache.ttl,
			checkperiod: config.cache.ttl * 0.2,
			useClones: false,
		});
	}

	generateKey(subject, industry) {
		const normalizedSubject = subject.toLowerCase().trim();
		const normalizedIndustry = industry.toLowerCase().trim();
		return `analysis:${normalizedIndustry}:${normalizedSubject}`;
	}

	get(subject, industry) {
		const key = this.generateKey(subject, industry);
		const result = this.cache.get(key);

		if (result) {
			console.log(`Cache hit for key: ${key}`);
			return result;
		}

		console.log(`Cache miss for key: ${key}`);
		return null;
	}

	set(subject, industry, result) {
		const key = this.generateKey(subject, industry);
		this.cache.set(key, result);
		console.log(`Cached result for key: ${key}`);
	}

	clear() {
		this.cache.flushAll();
		console.log('Cache cleared');
	}

	getStats() {
		return this.cache.getStats();
	}

	isHealthy() {
		try {
			this.cache.get('health_check');
			return true;
		} catch (error) {
			console.error('Cache health check failed:', error);
			return false;
		}
	}
}

module.exports = CacheService;
