# User Management Setup Guide

This guide will help you set up the user management system with Auth0 integration for the AI Blog Search Engine.

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Migration

The database schema has been updated to include user management. Run the migration:

```bash
npx prisma migrate dev --name add_user_management
npx prisma generate
```

### 3. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_blog_search"

# Elasticsearch
ELASTICSEARCH_NODE="http://localhost:9200"
ELASTICSEARCH_USERNAME="elastic"
ELASTICSEARCH_PASSWORD="password"

# Auth0 Configuration
AUTH0_DOMAIN="your-domain.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
AUTH0_AUDIENCE="your-api-audience"
AUTH0_SECRET="openssl rand -hex 32"

# Python Debug
PYTHON_DEBUG="0"
```

### 4. Auth0 Setup

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new application (Regular Web Application)
3. Configure the following settings:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
4. Create an API with the following settings:
   - Identifier: `https://your-api-audience`
   - Signing Algorithm: RS256
5. Update your `.env.local` file with the Auth0 credentials

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

### 2. Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Auth0 Configuration
AUTH0_SECRET=your-secret-key
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=your-api-audience
AUTH0_SECRET="openssl rand -hex 32"

# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

## Running the Application

### Backend

```bash
cd backend
npm run start:dev
```

### Frontend

```bash
cd frontend
npm run dev
```

## Features Implemented

### User Management

- User registration and authentication via Auth0
- User profile management (firstname, lastname, age, position, themes, tags, language)
- User search history tracking
- Favorite blog posts management

### RSS Feed Management

- Global RSS feeds with theme categorization
- User-specific RSS feed subscriptions
- RSS feed recommendations based on user themes
- CRUD operations for user RSS feeds

### Search Enhancements

- User-aware search with history tracking
- Favorite blog posts functionality
- Personalized search results

## API Endpoints

### User Endpoints (Protected)

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/search-history` - Get user search history
- `GET /users/favorites` - Get user favorites
- `POST /users/favorites/:blogPostId` - Add to favorites
- `POST /users/favorites/:blogPostId/remove` - Remove from favorites
- `GET /users/favorites/:blogPostId/check` - Check if post is favorited

### RSS Feed Endpoints

- `GET /rss/feeds/theme/:theme` - Get RSS feeds by theme
- `GET /rss/user/feeds` - Get user RSS feeds (Protected)
- `POST /rss/user/feeds/:rssFeedId` - Add RSS feed to user (Protected)
- `DELETE /rss/user/feeds/:rssFeedId` - Remove RSS feed from user (Protected)
- `GET /rss/user/recommendations` - Get recommended RSS feeds (Protected)

### Search Endpoints (Enhanced)

- All existing search endpoints now support user authentication
- Search history is automatically tracked for authenticated users

## Database Schema

### New Tables

- `users` - User profiles and preferences
- `user_rss_feeds` - User RSS feed subscriptions
- `favorites` - User favorite blog posts
- Updated `search_queries` - Now includes user tracking
- Updated `rss_feeds` - Now includes theme categorization

## Next Steps

1. Set up Auth0 application and API
2. Configure environment variables
3. Run database migrations
4. Start both backend and frontend servers
5. Test user registration and authentication
6. Test RSS feed management and favorites functionality

## Security Notes

- All user-specific endpoints are protected with Auth0 JWT authentication
- User data is properly isolated and secured
- Search endpoints support both authenticated and anonymous users
- Proper error handling and validation implemented
