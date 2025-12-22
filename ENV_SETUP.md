# Environment Variables Configuration

This file documents the environment variables needed for local development vs production.

---

## Local Development (.env.local)

Create a `.env.local` file in the project root with these variables:

```env
# Environment
NODE_ENV=development

# Database (Demo/Development)
DATABASE_URL_DEV=postgresql://user:password@your-demo-db.neon.tech/photolibrary_demo

# Cloudinary (Same account, demo folder will be used automatically)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Auth
NEXTAUTH_SECRET=your-local-secret-key
NEXTAUTH_URL=http://localhost:3000

# Other variables...
```

---

## Production (.env)

Your production environment should have these variables:

```env
# Environment
NODE_ENV=production

# Database (Production)
POSTGRES_URL=postgresql://user:password@your-prod-db.neon.tech/photolibrary
# or
DATABASE_URL=postgresql://user:password@your-prod-db.neon.tech/photolibrary

# Cloudinary (Same account, production folder will be used automatically)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Auth
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-domain.com

# Other variables...
```

---

## How It Works

### Cloudinary Folders
- **Development**: Uploads go to `photolibrary-demo` folder
- **Production**: Uploads go to `photolibrary` folder
- Same Cloudinary account, automatically separated by environment

### Neon Databases
- **Development**: Uses `DATABASE_URL_DEV` (separate demo database)
- **Production**: Uses `POSTGRES_URL` or `DATABASE_URL` (production database)
- Completely separate databases for isolation

---

## Setup Instructions

1. **Create Demo Database** (if you haven't):
   - Go to Neon console
   - Create a new database or branch for demo/development
   - Copy the connection string

2. **Update .env.local**:
   - Add `DATABASE_URL_DEV` with your demo database connection string
   - Set `NODE_ENV=development`

3. **Verify Production .env**:
   - Ensure `POSTGRES_URL` or `DATABASE_URL` points to production database
   - Set `NODE_ENV=production` (or omit, as production is default)

4. **Test**:
   - Run locally: `npm run dev` → should use demo database and `photolibrary-demo` folder
   - Deploy to production → should use production database and `photolibrary` folder
