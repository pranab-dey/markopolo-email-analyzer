const Joi = require('joi');
const config = require('../config');

class SubjectValidator {
	constructor() {
		this.schema = Joi.object({
			subject: Joi.string()
				.trim()
				.min(1)
				.max(config.validation.maxSubjectLength)
				.required()
				.messages({
					'string.empty': 'Subject line cannot be empty',
					'string.min':
						'Subject line must be at least 1 character long',
					'string.max': `Subject line cannot exceed ${config.validation.maxSubjectLength} characters`,
					'any.required': 'Subject line is required',
				}),

			industry: Joi.string()
				.valid(...config.validation.supportedIndustries)
				.required()
				.messages({
					'any.only': `Industry must be one of: ${config.validation.supportedIndustries.join(
						', '
					)}`,
					'any.required': 'Industry is required',
				}),
		});
	}

	validate(data) {
		const { error, value } = this.schema.validate(data, {
			abortEarly: false,
			stripUnknown: true,
		});

		if (error) {
			return {
				success: false,
				errors: error.details.map((detail) => ({
					field: detail.path.join('.'),
					message: detail.message,
				})),
			};
		}

		return {
			success: true,
			data: value,
		};
	}

	sanitizeSubject(subject) {
		if (typeof subject !== 'string') {
			return '';
		}

		return subject
			.trim()
			.replace(/\s+/g, ' ') // Replace multiple spaces with single space
			.replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
			.substring(0, config.validation.maxSubjectLength);
	}

	validateSubject(subject) {
		const sanitized = this.sanitizeSubject(subject);

		if (!sanitized) {
			return {
				valid: false,
				error: 'Subject line cannot be empty',
			};
		}

		if (sanitized.length > config.validation.maxSubjectLength) {
			return {
				valid: false,
				error: `Subject line exceeds maximum length of ${config.validation.maxSubjectLength} characters`,
			};
		}

		return {
			valid: true,
			sanitized,
		};
	}

	validateIndustry(industry) {
		if (!industry || typeof industry !== 'string') {
			return {
				valid: false,
				error: 'Industry is required',
			};
		}

		const normalizedIndustry = industry.toLowerCase().trim();

		if (
			!config.validation.supportedIndustries.includes(normalizedIndustry)
		) {
			return {
				valid: false,
				error: `Industry must be one of: ${config.validation.supportedIndustries.join(
					', '
				)}`,
			};
		}

		return {
			valid: true,
			normalized: normalizedIndustry,
		};
	}

	getValidationRules() {
		return {
			maxSubjectLength: config.validation.maxSubjectLength,
			supportedIndustries: config.validation.supportedIndustries,
			minSubjectLength: 1,
		};
	}
}

module.exports = SubjectValidator;
