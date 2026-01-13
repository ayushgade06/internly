# Next.js App with NextAuth

## Overview
A Next.js 16 application with NextAuth authentication using Google OAuth provider.

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components
- `src/lib/` - Utility libraries and auth configuration
- `public/` - Static assets

## Key Technologies
- Next.js 16.1.1 with App Router
- NextAuth 4.x for authentication
- Tailwind CSS 4 for styling
- TypeScript

## Authentication Setup
The app uses NextAuth with Google OAuth. Requires environment variables:
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXTAUTH_SECRET` - Secret for NextAuth session encryption
- `NEXTAUTH_URL` - The canonical URL of the site

## Development
- Dev server runs on port 5000
- Command: `npm run dev`

## Deployment
- Build: `npm run build`
- Start: `npm run start`
