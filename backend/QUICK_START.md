# Quick Start Guide - Authentication & PG API

## ✅ What's Ready

1. **Authentication System**
   - Signup (POST /api/auth/signup)
   - Login (POST /api/auth/login)
   - Get Current User (GET /api/auth/me)

2. **Complete PG API**
   - Get All PGs (GET /api/pg)
   - Get Single PG (GET /api/pg/:id)
   - Create PG (POST /api/pg) - Protected
   - Update PG (PUT /api/pg/:id) - Protected
   - Delete PG (DELETE /api/pg/:id) - Protected
   - Get My PGs (GET /api/pg/my-pgs) - Protected

---

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up MongoDB Atlas

Follow: `backend/MONGODB_ATLAS_SETUP.md`

**Quick Steps:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0)
4. Create database user
5. Whitelist IP (0.0.0.0/0 for all)
6. Get connection string

### 3. Create .env File

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-helper
JWT_SECRET=your_super_secret_key_change_this
FRONTEND_URL=http://localhost:3000
```

### 4. Run Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Atlas Connected!
🚀 Server running on port 5000
```

---

## Test Authentication

### 1. Signup (Create Account)

```bash
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test Broker",
  "email": "broker@test.com",
  "password": "Test123!@#",
  "phoneNumber": "1234567890",
  "city": "Nadiad",
  "role": "broker"
}
```

**Save the token from response!**

### 2. Login

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "broker@test.com",
  "password": "Test123!@#"
}
```

---

## Test PG API

### 1. Create PG (Requires Token)

```bash
POST http://localhost:5000/api/pg
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "title": "Comfortable PG",
  "location": "123 Main St, Nadiad",
  "city": "Nadiad",
  "collegeName": "Test College",
  "sharingType": "double",
  "bedrooms": 2,
  "bathrooms": 1,
  "price": 5000,
  "ac": true,
  "furnished": true,
  "coordinates": {
    "lat": 22.6944,
    "lng": 72.8606
  }
}
```

### 2. Get All PGs

```bash
GET http://localhost:5000/api/pg?city=Nadiad
```

### 3. Get My PGs

```bash
GET http://localhost:5000/api/pg/my-pgs
Authorization: Bearer <your-token>
```

---

## Next Steps

Once this works:
1. Connect frontend to authentication
2. Connect frontend to PG API
3. Add file upload for images
4. Build Hostel API

---

## Documentation

- **Authentication**: `backend/AUTHENTICATION_EXPLAINED.md`
- **PG API**: `backend/COMPLETE_PG_API.md`
- **Testing**: `backend/TESTING_AUTH.md`
- **MongoDB Setup**: `backend/MONGODB_ATLAS_SETUP.md`

