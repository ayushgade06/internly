# Database Setup Guide

## Error: Authentication failed against the database server

If you're seeing this error, your `DATABASE_URL` has incorrect credentials.

## Quick Fix

1. **Check your `.env` or `.env.local` file** in the `my-app` directory

2. **Update your DATABASE_URL** with the correct format:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/internly?schema=public"
```

## Step-by-Step Setup

### 1. Install PostgreSQL (if not already installed)

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Or use Chocolatey: `choco install postgresql`

**Mac:**
- `brew install postgresql`
- `brew services start postgresql`

**Linux:**
- `sudo apt-get install postgresql postgresql-contrib` (Ubuntu/Debian)
- `sudo systemctl start postgresql`

### 2. Create Database and User

Open PostgreSQL command line or pgAdmin:

```sql
-- Connect to PostgreSQL as superuser
-- Create database
CREATE DATABASE internly;

-- Create user (optional, you can use default 'postgres' user)
CREATE USER internly_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE internly TO internly_user;
```

### 3. Update .env File

Create or update `.env` or `.env.local` in the `my-app` directory:

```env
# Option 1: Using default postgres user
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/internly?schema=public"

# Option 2: Using custom user
DATABASE_URL="postgresql://internly_user:your_secure_password@localhost:5432/internly?schema=public"
```

### 4. Common DATABASE_URL Formats

**Local PostgreSQL:**
```
postgresql://username:password@localhost:5432/database_name?schema=public
```

**Remote PostgreSQL:**
```
postgresql://username:password@hostname:5432/database_name?schema=public
```

**With SSL:**
```
postgresql://username:password@hostname:5432/database_name?schema=public&sslmode=require
```

**Cloud Providers:**

**Supabase:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

**Railway:**
```
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway
```

**Neon:**
```
postgresql://[user]:[password]@[neon_hostname]/[dbname]?sslmode=require
```

### 5. Test Connection

Run this to test your connection:

```bash
npx prisma db pull
```

If successful, you should see your database schema.

### 6. Run Migrations

```bash
npx prisma migrate dev
```

## Troubleshooting

### Error: "password authentication failed"
- **Solution:** Check your password in DATABASE_URL
- Make sure there are no special characters that need URL encoding
- If password has special characters, URL encode them (e.g., `@` becomes `%40`)

### Error: "database does not exist"
- **Solution:** Create the database first:
  ```sql
  CREATE DATABASE internly;
  ```

### Error: "connection refused"
- **Solution:** Make sure PostgreSQL is running
  - Windows: Check Services, look for "postgresql"
  - Mac: `brew services start postgresql`
  - Linux: `sudo systemctl start postgresql`

### Error: "role does not exist"
- **Solution:** Use the correct username or create the user:
  ```sql
  CREATE USER your_username WITH PASSWORD 'your_password';
  ```

### Find Your PostgreSQL Credentials

**Windows (default installation):**
- Username: `postgres`
- Password: The one you set during installation
- Port: `5432`

**Mac (Homebrew):**
- Username: Your Mac username or `postgres`
- Password: Usually empty or your Mac password
- Port: `5432`

**Linux:**
- Username: `postgres`
- Password: Set during installation
- Port: `5432`

## Verify Your Setup

1. Check if PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Mac/Linux
   psql --version
   ```

2. Test connection manually:
   ```bash
   psql -U postgres -d internly
   ```

3. If connection works, your DATABASE_URL should work too!

## Still Having Issues?

1. Double-check your `.env` file is in the `my-app` directory
2. Make sure there are no extra spaces or quotes in DATABASE_URL
3. Restart your Next.js dev server after changing .env
4. Check PostgreSQL logs for more details
