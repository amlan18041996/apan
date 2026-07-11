# APAN Store

A Nuxt 4 e-commerce storefront powered by Shopify and Typesense search.

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for Typesense)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

3. Start Typesense (required for search):

```bash
docker compose up -d typesense
```

This starts a self-hosted Typesense instance on `http://localhost:8108` using the default API key `typesense_dev_key` defined in your `.env` file. Data is persisted in a Docker volume (`typesense-data`).

4. Start the development server:

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

## Typesense

APAN uses [Typesense](https://typesense.org/) as its search engine, running as a self-hosted Docker service.

### Configuration

| Variable                  | Default             | Description                                           |
| ------------------------- | ------------------- | ----------------------------------------------------- |
| `NUXT_TYPESENSE_HOST`     | `localhost`         | Typesense server hostname                             |
| `NUXT_TYPESENSE_PORT`     | `8108`              | Typesense server port                                 |
| `NUXT_TYPESENSE_API_KEY`  | `typesense_dev_key` | API key (must match the server's `TYPESENSE_API_KEY`) |
| `NUXT_TYPESENSE_PROTOCOL` | `http`              | Protocol (`http` or `https`)                          |

### Common commands

```bash
# Start Typesense
docker compose up -d typesense

# Stop Typesense
docker compose down

# Stop and wipe all data
docker compose down -v

# View Typesense logs
docker compose logs -f typesense

# Check health
curl http://localhost:8108/health
```

### Production

The production compose file (`docker-compose.prod.yml`) includes Typesense alongside the app and Nginx reverse proxy:

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Development

```bash
npm run dev       # Start dev server on http://localhost:3000
npm run lint      # Lint with ESLint
npm run format    # Check formatting with Prettier
```

## Production

```bash
npm run build     # Build for production
npm run preview   # Preview the production build locally
```

## Tech Stack

- **Framework:** Nuxt 4 (Vue 3)
- **Styling:** Tailwind CSS
- **State:** Pinia
- **Search:** Typesense (self-hosted)
- **Backend:** Shopify Storefront API
- **Validation:** Zod

Check out the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) and the [deployment docs](https://nuxt.com/docs/getting-started/deployment) for more information.
