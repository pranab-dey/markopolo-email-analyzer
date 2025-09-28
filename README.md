# Markopolo Email Subject Line Analyzer

A comprehensive AI-powered tool for analyzing and optimizing email subject lines. Built with Clean Architecture principles, this application provides intelligent insights and suggestions to improve email marketing performance.

## 🚀 Features

### Core Functionality

-   **AI-Powered Analysis**: Uses OpenAI GPT to analyze subject lines and provide intelligent insights
-   **Comprehensive Scoring**: Combines rule-based and AI-based scoring algorithms
-   **Industry-Specific Optimization**: Tailored analysis for different industries (e-commerce, SaaS, retail, healthcare, finance, education)
-   **Real-time Suggestions**: Generates 3 alternative subject lines with AI insights
-   **Issue Detection**: Identifies common problems like spam triggers, length issues, and clarity problems

### Technical Features

-   **Caching System**: Prevents duplicate API calls and improves performance
-   **Rate Limiting**: Protects against API abuse with configurable limits
-   **Input Validation**: Comprehensive validation with real-time feedback
-   **Error Handling**: Robust error handling with user-friendly messages
-   **Responsive Design**: Modern, mobile-friendly interface with Tailwind CSS
-   **Keyboard Shortcuts**: Enter to submit, Escape to clear form
-   **Copy Functionality**: One-click copying of suggested subject lines

## 🏗️ Architecture

The application follows Clean Architecture principles with clear separation of concerns:

```
src/
├── config/           # Configuration management
├── controllers/      # Request handling and orchestration
├── services/         # Business logic and external integrations
├── validators/       # Input validation and sanitization
├── middleware/       # Cross-cutting concerns (rate limiting, error handling)
└── routes/          # API endpoint definitions
```

### Key Components

1. **AIService**: Handles OpenAI API integration with intelligent prompt engineering
2. **ScoringService**: Implements rule-based scoring algorithms
3. **CacheService**: Manages result caching to optimize performance
4. **SubjectValidator**: Ensures data integrity and security
5. **AnalysisController**: Orchestrates the analysis workflow

## 🛠️ Installation & Setup

### Prerequisites

-   Node.js (v16 or higher)
-   OpenAI API key

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd markopollo-assignment
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment Configuration**

    ```bash
    cp env.example .env
    ```

    Edit `.env` and add your OpenAI API key:

    ```
    OPENAI_API_KEY=your_openai_api_key_here
    PORT=3000
    NODE_ENV=development
    ```

4. **Start the application**

    ```bash
    # Development mode with auto-reload
    npm run dev

    # Production mode
    npm start
    ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 📡 API Endpoints

### POST /api/analyze-subject

Analyzes a subject line and provides AI-powered improvements.

**Request:**

```json
{
	"subject": "50% off everything!",
	"industry": "e-commerce"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "original": "50% off everything!",
    "score": 65,
    "issues": ["too generic", "overused phrase"],
    "suggestions": [
      "Last 24 hours: 50% off your favorites",
      "Flash sale: Half price on top picks",
      "VIP access: 50% savings inside"
    ],
    "ai_insights": "Your subject line lacks personalization...",
    "scoring_breakdown": {
      "rule_based": 60,
      "ai_based": 70,
      "combined": 65
    },
    "detailed_metrics": {...},
    "industry": "e-commerce",
    "analyzed_at": "2024-01-01T00:00:00.000Z"
  },
  "cached": false
}
```

### GET /api/validation-rules

Returns validation rules for frontend form validation.

### GET /api/health

Health check endpoint for monitoring.

### GET /api/info

API information and available endpoints.

## 🎯 Scoring Algorithm

The scoring system combines multiple factors:

### Rule-Based Scoring (50% weight)

-   **Length Score**: Optimal 30-50 characters (100 points)
-   **Spam Triggers**: Penalizes overused phrases (0-100 points)
-   **Personalization**: Rewards personal elements (50-100 points)
-   **Urgency**: Scores action-oriented language (60-100 points)
-   **Clarity**: Penalizes excessive punctuation/caps (0-100 points)
-   **Industry Relevance**: Matches industry-specific keywords (50-100 points)

### AI-Based Scoring (50% weight)

-   Uses OpenAI GPT-3.5-turbo for intelligent analysis
-   Considers context, emotional impact, and modern best practices
-   Provides detailed insights and suggestions

### Final Score

Combined score = (Rule-based score + AI-based score) / 2

## 🔧 Configuration

### Environment Variables

-   `OPENAI_API_KEY`: Your OpenAI API key (required)
-   `PORT`: Server port (default: 3000)
-   `NODE_ENV`: Environment (development/production)
-   `RATE_LIMIT_WINDOW_MS`: Rate limiting window (default: 15 minutes)
-   `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: 100)
-   `CACHE_TTL_SECONDS`: Cache time-to-live (default: 1 hour)

### Rate Limiting

-   Analysis endpoint: 20 requests per 15 minutes
-   General API: 100 requests per 15 minutes
-   Configurable via environment variables

## 🎨 Frontend Features

### User Experience

-   **Real-time Validation**: Instant feedback on input
-   **Character Counter**: Visual feedback for subject line length
-   **Loading States**: Clear indication during analysis
-   **Smooth Animations**: Fade-in effects and transitions
-   **Responsive Design**: Works on all device sizes

### Accessibility

-   **Keyboard Navigation**: Full keyboard support
-   **Screen Reader Friendly**: Proper ARIA labels and semantic HTML
-   **High Contrast**: Clear visual hierarchy
-   **Focus Management**: Proper focus indicators

## 🧪 Testing

### Manual Testing Checklist

-   [ ] Subject line analysis works correctly
-   [ ] Input validation prevents invalid submissions
-   [ ] Error handling displays user-friendly messages
-   [ ] Caching prevents duplicate API calls
-   [ ] Rate limiting works as expected
-   [ ] Copy functionality works for suggestions
-   [ ] Responsive design works on mobile
-   [ ] Keyboard shortcuts function properly

### API Testing

```bash
# Test analysis endpoint
curl -X POST http://localhost:3000/api/analyze-subject \
  -H "Content-Type: application/json" \
  -d '{"subject": "Test subject", "industry": "e-commerce"}'

# Test health endpoint
curl http://localhost:3000/api/health
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set production values for all config
2. **HTTPS**: Use SSL certificates for secure communication
3. **Domain Configuration**: Update CORS settings for your domain
4. **Monitoring**: Set up logging and error tracking
5. **Scaling**: Consider load balancing for high traffic

### Docker Deployment (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance Optimizations

-   **Caching**: Results cached for 1 hour to reduce API calls
-   **Rate Limiting**: Prevents API abuse and ensures fair usage
-   **Input Validation**: Prevents unnecessary processing
-   **Error Handling**: Graceful degradation when AI service is unavailable
-   **Frontend Optimization**: Efficient DOM updates and event handling

## 🔒 Security Features

-   **Input Sanitization**: Prevents XSS and injection attacks
-   **Rate Limiting**: Protects against abuse
-   **CORS Configuration**: Secure cross-origin requests
-   **Helmet.js**: Security headers and protection
-   **Validation**: Comprehensive input validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing architecture
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section below
2. Review the API documentation
3. Create an issue in the repository

### Common Issues

**OpenAI API Errors**

-   Verify your API key is correct
-   Check your OpenAI account has sufficient credits
-   Ensure the API key has proper permissions

**Rate Limiting**

-   Wait for the rate limit window to reset
-   Consider implementing client-side caching
-   Contact support for higher limits if needed

**Validation Errors**

-   Check subject line length (max 200 characters)
-   Ensure industry is selected from the dropdown
-   Verify no special characters are causing issues
