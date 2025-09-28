## Architecture

```
src/
├── config/           # Configuration management
├── controllers/      # Request handling and orchestration
├── services/         # Business logic and external integrations
├── validators/       # Input validation and sanitization
├── middleware/       # Cross-cutting concerns (rate limiting, error handling)
└── routes/          # API endpoint definitions
```

### Prerequisites

-   Node.js (v16 or higher)
-   OpenAI API key

### Installation

1.  ```bash
    npm install && npm run create:env
    ```

2.  **Environment Configuration**

    Edit `.env` and add your OpenAI API key:

    ```
    OPENAI_API_KEY=your_openai_api_key_here
    ```

3.  **Start the application**

    ```bash
    npm run dev
    ```

4.  **Access the application**
    Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### POST /api/analyze-subject

### GET /api/validation-rules

### GET /api/health

### GET /api/info

## Scoring Algorithm

The scoring system combines multiple factors which in incorporated from internet (chatGPT):

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

### Rate Limiting

-   Analysis endpoint: 20 requests per 15 minutes
-   General API: 100 requests per 15 minutes
-   Configurable via environment variables
