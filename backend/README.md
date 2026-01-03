# Backend API - Step by Step

We're building the backend **one API at a time** so you can understand each part.

## ✅ Completed: Authentication System

- User Signup (POST /api/auth/signup)
- User Login (POST /api/auth/login)
- Get Current User (GET /api/auth/me)
- JWT Token Authentication
- Password Hashing

## ⏳ Next: Complete PG API

Now we'll complete the PG API with authentication protection.

## Database: MongoDB Atlas (Cloud)

We're using **MongoDB Atlas** (cloud database) because:
- ✅ Free tier available
- ✅ No local setup needed
- ✅ Easy to deploy (works everywhere)
- ✅ No deployment headaches

## Setup Instructions

### Step 1: Get MongoDB Atlas (Free)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0 - Free tier)
4. Create a database user (username & password)
5. Get your connection string
6. Replace `<password>` with your password

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

### Step 3: Create .env File

Copy `.env.example` to `.env` and add your MongoDB Atlas connection string.

### Step 4: Run Server

```bash
npm run dev
```

## Current APIs

- ✅ `GET /api/pg` - Get all PGs (with filters)

## Next Steps

We'll add more APIs one by one:
- POST /api/pg (Create PG)
- GET /api/pg/:id (Get single PG)
- etc.

