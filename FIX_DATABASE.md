# 🔧 Fix Database Connection

## The Problem

Your `.env.local` file has placeholder values:
- Username: `username` ❌
- This file takes priority over `.env`

## Quick Fix

### Option 1: Update .env.local (Recommended)

1. Open `my-app/.env.local` file
2. Find the `DATABASE_URL` line
3. Replace it with your actual PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/internly?schema=public"
```

Replace `YOUR_ACTUAL_PASSWORD` with your PostgreSQL password.

### Option 2: Delete .env.local (Use .env instead)

If your `.env` file already has correct credentials:

1. Delete or rename `my-app/.env.local`
2. Make sure `my-app/.env` has:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/internly?schema=public"
   ```

## Finding Your PostgreSQL Password

Since you have pgAdmin open:

1. **Check pgAdmin connection:**
   - Right-click "PostgreSQL 17" → Properties
   - The password is what you use to connect in pgAdmin

2. **Or test with psql:**
   ```powershell
   psql -U postgres -d internly
   ```
   Enter your password when prompted

3. **Common scenarios:**
   - If you installed PostgreSQL yourself: The password you set during installation
   - If it's a default install: Often `postgres` or empty (try both)
   - Check Windows Credential Manager for stored passwords

## After Fixing

1. **Test the connection:**
   ```powershell
   npm run test:db
   ```

2. **If successful, restart dev server:**
   ```powershell
   npm run dev
   ```

## Verify Your Fix

Run this to check your environment:
```powershell
node scripts/check-env.js
```

You should see:
- ✅ Username is NOT "username" or "user"
- ✅ Password is set (not empty)
