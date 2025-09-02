# AI Blog Search Engine - Backend

A NestJS-based backend for an AI-powered tech blog search engine that collects blog posts from RSS feeds and provides intelligent search capabilities using ElasticSearch.

## Features

- 🔍 **Intelligent Search**: Natural language search using ElasticSearch
- 📰 **RSS Feed Collection**: Automated collection of blog posts from RSS feeds
- 🗄️ **Database Storage**: PostgreSQL with Prisma ORM
- 🔎 **Full-text Search**: Advanced search with ElasticSearch
- 📊 **Search Analytics**: Track search queries and results
- 🐳 **Containerized**: Docker support for easy deployment

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Search Engine**: ElasticSearch
- **RSS Processing**: Python script with feedparser
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 18+ 
- Python 3.8+
- Docker & Docker Compose
- npm or yarn

## Quick Start

### 1. Clone and Setup

```bash
cd ai-blog-search-engine/backend
npm install
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Start Infrastructure Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- ElasticSearch on port 9200

### 4. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 5. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Search API

- `POST /search` - Search for blog posts
- `GET /search?q=<query>&limit=<number>` - Search with query parameters
- `GET /search/health` - Health check

### RSS Management

- `POST /rss/feeds` - Add new RSS feed
- `GET /rss/feeds` - List all RSS feeds
- `POST /rss/fetch/:id` - Fetch specific RSS feed
- `POST /rss/fetch-all` - Fetch all RSS feeds
- `GET /rss/health` - Health check

## Environment Variables

Create a `.env-dev` file with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_blog_search?schema=public"

# ElasticSearch Configuration
ELASTICSEARCH_NODE="http://localhost:9200"
ELASTICSEARCH_USERNAME="elastic"
ELASTICSEARCH_PASSWORD="changeme"

# Application Configuration
PORT=3000
NODE_ENV=development

# RSS Feed Configuration
RSS_FEED_UPDATE_INTERVAL=3600000
RSS_FEED_BATCH_SIZE=100

# AI Configuration (for future use)
OPENAI_API_KEY="your-openai-api-key"
AI_MODEL="gpt-3.5-turbo"
```

## Usage Examples

### Add an RSS Feed

```bash
curl -X POST http://localhost:3000/rss/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCrunch",
    "url": "https://techcrunch.com/feed/"
  }'
```

### Search for Blog Posts

```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning tutorials",
    "limit": 10
  }'
```

### Fetch RSS Data

```bash
# Fetch all RSS feeds
curl -X POST http://localhost:3000/rss/fetch-all

# Fetch specific RSS feed
curl -X POST http://localhost:3000/rss/fetch/{feed-id}
```

## Development

### Available Scripts

- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start in production mode
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Main application module
├── controllers/           # API controllers
├── services/             # Business logic services
├── modules/              # Feature modules
│   ├── search/           # Search functionality
│   ├── rss/              # RSS feed management
│   ├── database/         # Database operations
│   └── elasticsearch/    # ElasticSearch operations
├── config/               # Configuration files
├── interfaces/           # TypeScript interfaces
└── utils/                # Utility functions

scripts/
└── fetch_rss.py          # Python RSS fetcher

prisma/
└── schema.prisma         # Database schema
```

## Database Schema

The application uses three main models:

- **BlogPost**: Stores blog post data
- **RssFeed**: Manages RSS feed sources
- **SearchQuery**: Tracks search analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC
