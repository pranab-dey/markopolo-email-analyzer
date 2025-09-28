class SubjectAnalyzer {
	constructor() {
		this.apiBaseUrl = '/api';
		this.cache = new Map();
		this.init();
	}

	init() {
		this.setupEventListeners();
		this.setupCharacterCounter();
		this.setupKeyboardShortcuts();
		this.loadValidationRules();
	}

	setupEventListeners() {
		const form = document.getElementById('analysisForm');
		const subjectInput = document.getElementById('subject');
		const industrySelect = document.getElementById('industry');

		form.addEventListener('submit', (e) => this.handleSubmit(e));
		subjectInput.addEventListener('input', (e) =>
			this.handleSubjectInput(e)
		);
		industrySelect.addEventListener('change', (e) =>
			this.handleIndustryChange(e)
		);
	}

	setupCharacterCounter() {
		const subjectInput = document.getElementById('subject');
		const charCount = document.getElementById('charCount');

		subjectInput.addEventListener('input', () => {
			const length = subjectInput.value.length;
			charCount.textContent = `${length}/200 characters`;

			if (length > 150) {
				charCount.classList.add('text-yellow-300');
				charCount.classList.remove('text-white');
			} else if (length > 180) {
				charCount.classList.add('text-red-300');
				charCount.classList.remove('text-yellow-300');
			} else {
				charCount.classList.add('text-white');
				charCount.classList.remove('text-yellow-300', 'text-red-300');
			}
		});
	}

	setupKeyboardShortcuts() {
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
				e.preventDefault();
				this.handleSubmit(e);
			}

			if (e.key === 'Escape') {
				this.clearForm();
			}
		});
	}

	/**
	 * Loads validation rules from the API
	 */
	async loadValidationRules() {
		try {
			const response = await fetch(`${this.apiBaseUrl}/validation-rules`);
			const data = await response.json();

			if (data.success) {
				this.validationRules = data.data;
				this.updateValidationUI();
			}
		} catch (error) {
			console.error('Failed to load validation rules:', error);
		}
	}

	/**
	 * Updates UI with validation rules
	 */
	updateValidationUI() {
		if (!this.validationRules) return;

		const subjectInput = document.getElementById('subject');
		subjectInput.maxLength = this.validationRules.maxSubjectLength;
	}

	/**
	 * Handles form submission
	 */
	async handleSubmit(e) {
		e.preventDefault();

		const formData = new FormData(e.target);
		const subject = formData.get('subject').trim();
		const industry = formData.get('industry');

		// Validate input
		if (!this.validateInput(subject, industry)) {
			return;
		}

		// Check cache first
		const cacheKey = `${industry}:${subject}`;
		if (this.cache.has(cacheKey)) {
			this.displayResults(this.cache.get(cacheKey));
			return;
		}

		// Show loading state
		this.setLoadingState(true);

		try {
			const result = await this.analyzeSubject(subject, industry);

			// Cache the result
			this.cache.set(cacheKey, result);

			// Display results
			this.displayResults(result);
		} catch (error) {
			this.displayError(error.message);
		} finally {
			this.setLoadingState(false);
		}
	}

	/**
	 * Validates form input
	 */
	validateInput(subject, industry) {
		let isValid = true;

		// Clear previous errors
		this.clearErrors();

		// Validate subject
		if (!subject) {
			this.showError('subject', 'Subject line is required');
			isValid = false;
		} else if (subject.length < 1) {
			this.showError(
				'subject',
				'Subject line must be at least 1 character long'
			);
			isValid = false;
		} else if (subject.length > 200) {
			this.showError(
				'subject',
				'Subject line cannot exceed 200 characters'
			);
			isValid = false;
		}

		// Validate industry
		if (!industry) {
			this.showError('industry', 'Please select an industry');
			isValid = false;
		}

		return isValid;
	}

	/**
	 * Shows validation error for a field
	 */
	showError(field, message) {
		const errorElement = document.getElementById(`${field}Error`);
		if (errorElement) {
			errorElement.textContent = message;
			errorElement.classList.remove('hidden');
		}
	}

	/**
	 * Clears all validation errors
	 */
	clearErrors() {
		const errorElements = document.querySelectorAll('[id$="Error"]');
		errorElements.forEach((element) => {
			element.classList.add('hidden');
			element.textContent = '';
		});
	}

	/**
	 * Handles subject input changes
	 */
	handleSubjectInput(e) {
		const value = e.target.value;

		// Real-time validation
		if (value.length > 200) {
			this.showError('subject', 'Subject line exceeds maximum length');
		} else {
			this.clearErrors();
		}
	}

	/**
	 * Handles industry selection changes
	 */
	handleIndustryChange(e) {
		this.clearErrors();
	}

	/**
	 * Analyzes subject line via API
	 */
	async analyzeSubject(subject, industry) {
		const response = await fetch(`${this.apiBaseUrl}/analyze-subject`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				subject,
				industry,
			}),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message || data.error || 'Failed to analyze subject line'
			);
		}

		if (!data.success) {
			throw new Error(data.message || data.error || 'Analysis failed');
		}

		return data.data;
	}

	/**
	 * Sets loading state for the form
	 */
	setLoadingState(loading) {
		const button = document.getElementById('analyzeBtn');
		const btnText = document.getElementById('btnText');
		const loadingIcon = document.getElementById('loadingIcon');
		const subjectInput = document.getElementById('subject');
		const industrySelect = document.getElementById('industry');

		if (loading) {
			button.disabled = true;
			button.classList.add('opacity-50', 'cursor-not-allowed');
			btnText.textContent = 'Analyzing...';
			loadingIcon.classList.remove('hidden');
			subjectInput.disabled = true;
			industrySelect.disabled = true;
		} else {
			button.disabled = false;
			button.classList.remove('opacity-50', 'cursor-not-allowed');
			btnText.textContent = 'Analyze Subject Line';
			loadingIcon.classList.add('hidden');
			subjectInput.disabled = false;
			industrySelect.disabled = false;
		}
	}

	/**
	 * Displays analysis results
	 */
	displayResults(result) {
		this.hideError();
		this.hideResults();

		// Update score
		this.updateScore(result.score);

		// Update issues
		this.updateIssues(result.issues);

		// Update AI insights
		this.updateAIInsights(result.ai_insights);

		// Update suggestions
		this.updateSuggestions(result.suggestions);

		// Show results section
		document.getElementById('resultsSection').classList.remove('hidden');

		// Scroll to results
		document.getElementById('resultsSection').scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	}

	/**
	 * Updates score display
	 */
	updateScore(score) {
		const scoreValue = document.getElementById('scoreValue');
		const scoreBar = document.getElementById('scoreBar');
		const scoreDescription = document.getElementById('scoreDescription');

		scoreValue.textContent = score;

		// Update progress bar
		scoreBar.style.width = `${score}%`;

		// Update color based on score
		if (score >= 80) {
			scoreBar.className =
				'h-4 rounded-full transition-all duration-1000 bg-green-400';
			scoreDescription.textContent =
				'Excellent! Your subject line is well-optimized.';
		} else if (score >= 60) {
			scoreBar.className =
				'h-4 rounded-full transition-all duration-1000 bg-yellow-400';
			scoreDescription.textContent =
				"Good! There's room for improvement.";
		} else {
			scoreBar.className =
				'h-4 rounded-full transition-all duration-1000 bg-red-400';
			scoreDescription.textContent =
				'Needs improvement. Consider the suggestions below.';
		}
	}

	/**
	 * Updates issues display
	 */
	updateIssues(issues) {
		const issuesList = document.getElementById('issuesList');

		if (issues.length === 0) {
			issuesList.innerHTML =
				'<p class="text-green-300"><i class="fas fa-check-circle mr-2"></i>No issues found!</p>';
			return;
		}

		issuesList.innerHTML = issues
			.map(
				(issue) => `
            <div class="flex items-center bg-red-500 bg-opacity-20 rounded-lg p-3">
                <i class="fas fa-exclamation-triangle text-red-300 mr-3"></i>
                <span class="text-white capitalize">${issue}</span>
            </div>
        `
			)
			.join('');
	}

	/**
	 * Updates AI insights display
	 */
	updateAIInsights(insights) {
		document.getElementById('aiInsights').textContent = insights;
	}

	/**
	 * Updates suggestions display
	 */
	updateSuggestions(suggestions) {
		const suggestionsList = document.getElementById('suggestionsList');

		suggestionsList.innerHTML = suggestions
			.map(
				(suggestion, index) => `
            <div class="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-20">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <span class="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-3">
                                ${index + 1}
                            </span>
                            <span class="text-white font-semibold">Suggestion ${
								index + 1
							}</span>
                        </div>
                        <p class="text-white text-opacity-90 mb-3">${suggestion}</p>
                    </div>
                    <button 
                        class="copy-btn ml-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center"
                        data-suggestion="${suggestion}"
                        title="Copy to clipboard"
                    >
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        `
			)
			.join('');

		// Add copy functionality
		this.setupCopyButtons();
	}

	/**
	 * Sets up copy buttons for suggestions
	 */
	setupCopyButtons() {
		const copyButtons = document.querySelectorAll('.copy-btn');
		copyButtons.forEach((button) => {
			button.addEventListener('click', async (e) => {
				const suggestion = e.currentTarget.dataset.suggestion;
				try {
					await navigator.clipboard.writeText(suggestion);

					// Visual feedback
					const icon = e.currentTarget.querySelector('i');
					const originalClass = icon.className;
					icon.className = 'fas fa-check text-green-300';

					setTimeout(() => {
						icon.className = originalClass;
					}, 2000);
				} catch (error) {
					console.error('Failed to copy text:', error);
					// Fallback for older browsers
					this.fallbackCopy(suggestion);
				}
			});
		});
	}

	/**
	 * Fallback copy method for older browsers
	 */
	fallbackCopy(text) {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand('copy');
		document.body.removeChild(textArea);
	}

	/**
	 * Displays error message
	 */
	displayError(message) {
		this.hideResults();
		document.getElementById('errorMessage').textContent = message;
		document.getElementById('errorSection').classList.remove('hidden');

		// Scroll to error
		document.getElementById('errorSection').scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	}

	/**
	 * Hides results section
	 */
	hideResults() {
		document.getElementById('resultsSection').classList.add('hidden');
	}

	/**
	 * Hides error section
	 */
	hideError() {
		document.getElementById('errorSection').classList.add('hidden');
	}

	/**
	 * Clears the form
	 */
	clearForm() {
		document.getElementById('analysisForm').reset();
		this.clearErrors();
		this.hideResults();
		this.hideError();
		document.getElementById('charCount').textContent = '0/200 characters';
		document.getElementById('charCount').className =
			'text-white text-opacity-70 text-sm';
	}
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new SubjectAnalyzer();
});
