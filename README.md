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

The fastest way to get started is to pull the pre-built image from Docker Hub.

**1. Create a `docker-compose.yaml`:**

```yaml
services:
  finance-app:
    image: julianhintermann/financeflow:latest
    ports:
      - "3000:3000"
    volumes:
      - financeflow-data:/app/data
    environment:
      - NODE_ENV=production
      - DATA_DIR=/app/data
      - OPENROUTER_API_KEY=your-api-key-here
      - OPENROUTER_MODEL=openai/gpt-4o-mini
      - OPENROUTER_VISION_MODEL=openai/gpt-4o-mini
    restart: unless-stopped

volumes:
  financeflow-data:
```

**2. Start the app:**

```bash
docker compose up -d
```

The app is available at `http://localhost:3000`.

> **NAS users (e.g. Synology):** You can use bind mounts instead of named volumes to store data on a specific path:
> ```yaml
> volumes:
>   - /volume1/data/financeflow:/app/data
> ```

## Building from Source

If you want to build the image yourself instead of pulling from Docker Hub:

```bash
git clone https://github.com/julianhintermann-cmd/financeflow.git
cd financeflow
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
docker compose up -d
```

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
