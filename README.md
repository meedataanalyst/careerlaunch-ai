# CareerLaunch AI

CareerLaunch AI is a powerful web application powered by Google's Gemini 2.5 Flash model. It helps users optimize their resumes for specific job descriptions and automatically finds top matching active job listings in their location.

## Features

- **Resume Optimization**: Analyzes your resume against a target job description and rewrites it with professional formatting (Bold, Uppercase headers).
- **Smart Job Search**: Uses the optimized profile to find 5 active, safe, and location-specific job listings using Google Search Grounding.
- **Strict Location Filtering**: Prioritizes jobs in your specific city and country.
- **PDF Export**: Generate professional PDF versions of both your optimized resume and the matching job list.
- **Link Parsing**: Automatically extracts job details from URLs.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google GenAI SDK (`@google/genai`)
- **PDF Generation**: html2pdf.js
- **Icons**: Lucide React

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   API_KEY=your_api_key_here
   ```
4. Run the application:
   ```bash
   npm start
   ```

## License

MIT
