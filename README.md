# Markdown Analyzer

[![Live App](https://img.shields.io/badge/Live_App-web.app-blue)](https://markdown-analyzer.web.app)
[![API](https://img.shields.io/badge/API-onrender.com-9cf)](https://markdown-analyzer.onrender.com/api/health)
[![Firebase Hosting](https://img.shields.io/badge/Hosting-Firebase-orange)](https://firebase.google.com/docs/hosting)
[![Backend](https://img.shields.io/badge/Backend-Render-00c7b7)](https://render.com/)

> **Links:** [Live app](https://markdown-analyzer.web.app) – [API health](https://markdown-analyzer.onrender.com/api/health)

A full-stack React application for analyzing, previewing, and comparing Markdown documents.

Features a live editor with diff visualization, AI-powered analysis, and a toggleable subscription model with Firebase authentication and Stripe integration (**Note:** Subscriptions and payments are currently disabled).

## Features

### Core Application

- **Markdown editor** with live preview
- **Diff viewer** for side-by-side comparison of edits
- **AI-powered analysis** (summary & insights)
- **Responsive split-pane layout** with TailwindCSS styling

### UI & Theming

- **Dynamic theme system** with 6 color schemes:
  - Light
  - Dark
  - Sunset
  - Midnight
  - Forest
  - Glacier
- **Theme persistence** across browser sessions
- **System preference detection** (light/dark mode)
- **Syntax highlighting** that adapts to theme changes

### Authentication & Payments

- **Multi-provider auth** with Google and GitHub (Firebase Auth)
- **Account linking** flow for existing accounts across providers
- **Subscription model** with Stripe (via Firestore extension)
- **Configurable paywall** — payments can be globally enabled/disabled from Firestore
- **Billing portal** access for active subscribers
- **Clear UI states** for all auth/payment conditions (disabled, active, errors, etc.)

### Testing & Quality

- **100% unit test coverage across both frontend and backend**
- **148 frontend tests** (Vitest + React Testing Library):
  - Auth states (signed in/out, subscribed/basic)
  - Payment gating (disabled, busy, active)
  - Stripe checkout & billing portal (mocked integration)
  - Error handling & UI feedback
- **12 backend tests** (Pytest + Flask test client):
  - Successful API flow with mocked OpenAI response
  - Input validation (missing/invalid fields)
  - Pydantic model validation
  - Error handling for OpenAI API exceptions (timeouts, rate limits, auth errors, unexpected errors)
- Strict error handling enforced across client + server

## Tech Stack

- **Frontend:** React + Vite, TailwindCSS
- **Code Editor:** CodeMirror with markdown support
- **Markdown Rendering:** ReactMarkdown with GitHub Flavored Markdown
- **Diff Visualization:** diff library for side-by-side comparison
- **Image Capture:** html2canvas for AI analysis
- **Authentication:** Firebase Auth (Google & GitHub)
- **Database:** Firestore (for user data & subscriptions)
- **Payments:** Stripe via Firebase Firestore Stripe Payments extension
- **Testing:** Vitest, React Testing Library, Jest DOM
- **Hosting:** Firebase Hosting / Vercel / Netlify (configurable)

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && pip install -r requirements.txt
   ```
3. Set up environment variables
4. Start development servers:

   ```bash
   # Frontend
   cd client && npm run dev

   # Backend
   cd server && python app.py
   ```

## Code Quality

- **Comprehensive documentation** with Google-style JSDoc comments
- **TypeScript-ready** codebase with proper type annotations
- **ESLint configuration** for code consistency
- **Accessibility-first** design with ARIA attributes

## Project Structure

```
markdown-analyzer/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # Utility functions
│   │   ├── lib/           # Firebase configuration
│   │   └── tests/         # Test files
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Python backend
│   ├── app.py
│   └── requirements.txt
└── README.md
```

## Security Notes

- Payment gating is enforced **client-side** for UX and should also be validated **server-side** in production.
- Firestore security rules recommended:
  - Allow checkout session creation only if `priceId` matches configured value.
  - Restrict subscription reads/writes by user.

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run coverage
```

Test suite achieves **100% statements, branches, functions, and lines** across both frontend and backend code.

## Deployment

1. Set up Firebase project + Firestore + Auth providers (Google, GitHub).
2. Enable Stripe Payments extension in Firebase.
3. Add Firestore config/payments doc:

```json
{
  "enabled": false,
  "priceId": "price_xxx"
}
```

4. Update environment variables in `.env`.
5. Deploy to Firebase Hosting / Vercel / Netlify.

## License

This project is licensed under the MIT License. See [LICENSE](https://github.com/Yosna/Markdown-Analyzer/blob/main/LICENSE) for details.
