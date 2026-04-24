# FinanceFlow

Modern finance web app for tracking expenses, budgets, and reports. Containerized with Docker.

## Features

- Expense management with categories
- Budget planning with color-coded progress bar
- Charts (donut chart, bar chart)
- AI analysis via OpenRouter (summary, saving tips, trends)
- Receipt upload with automatic recognition (AI vision)
- PDF reports (custom date range + automatic monthly reports)
- Dark/Light mode
- Responsive design

## Quick Start with Docker

```bash
# Create .env file
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

# Start
docker compose up -d
```

The app is available at `http://localhost:3000`.

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3000`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key | - |
| `OPENROUTER_MODEL` | AI model for analysis | `openai/gpt-4o-mini` |
| `OPENROUTER_VISION_MODEL` | Vision model for receipts | `openai/gpt-4o-mini` |
| `PORT` | Server port | `3000` |
| `DATA_DIR` | Data directory | `./data` |

## Monthly Reports

Automatically generated on the 1st of each month. Stored in `./Monatsreport/` on the host.
File format: `MonthlyReport-MMYYYY-MMYYYY.pdf`
