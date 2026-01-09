# Internly Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Google OAuth credentials

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/internly?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

3. Set up the database:
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

4. Run the development server:
```bash
npm run dev
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env` file

## Database Setup

1. Create a PostgreSQL database named `internly`
2. Update the `DATABASE_URL` in your `.env` file with your database credentials
3. Run migrations to create the schema

## Features

- ✅ User authentication with Google OAuth
- ✅ Dashboard with application statistics
- ✅ Internship tracking (CRUD operations)
- ✅ Application management with follow-up dates
- ✅ Interview logging
- ✅ Analytics with charts and metrics
- ✅ Settings page

## Routes

- `/` - Redirects to login or dashboard
- `/login` - Login page
- `/dashboard` - Main dashboard
- `/internships` - Internship management
- `/applications` - Application tracking
- `/interviews` - Interview logs
- `/analytics` - Analytics and insights
- `/settings` - User settings

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database credentials

### Authentication Issues
- Verify Google OAuth credentials
- Check NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches your domain

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` for new migrations
- Check database connection string
