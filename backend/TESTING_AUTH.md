# Testing Authentication APIs

## Quick Test Guide

### Step 1: Start Server

```bash
cd backend
npm install
npm run dev
```

### Step 2: Test Signup

**Using Postman/Thunder Client:**

```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "John Student",
  "email": "john@example.com",
  "password": "Password123!",
  "phoneNumber": "1234567890",
  "city": "Nadiad",
  "role": "student",
  "collegeName": "Test College"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Student",
    "email": "john@example.com",
    "role": "student",
    "city": "Nadiad",
    "collegeName": "Test College",
    "phoneNumber": "1234567890"
  }
}
```

**Save the token!** You'll need it for protected routes.

### Step 3: Test Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Step 4: Test Protected Route

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your-token-here>
```

**Expected Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

### Step 5: Test Without Token (Should Fail)

```
GET http://localhost:5000/api/auth/me
(No Authorization header)
```

**Expected Response:**
```json
{
  "success": false,
  "message": "No token provided, authorization denied"
}
```

---

## Test Different Roles

### Create Broker:
```json
{
  "name": "Broker Name",
  "email": "broker@example.com",
  "password": "Password123!",
  "phoneNumber": "9876543210",
  "city": "Nadiad",
  "role": "broker"
}
```

### Create Hostel Admin:
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "Password123!",
  "phoneNumber": "5555555555",
  "city": "Nadiad",
  "role": "hostelAdmin"
}
```

---

## Common Errors

**Error: "User with this email already exists"**
- Email is already registered
- Try different email

**Error: "Invalid email or password"**
- Wrong email or password
- Check your credentials

**Error: "No token provided"**
- Missing Authorization header
- Add: `Authorization: Bearer <token>`

**Error: "Token expired"**
- Token is older than 30 days
- Login again to get new token

---

## Next: Connect Frontend

Once authentication works, we'll:
1. Connect frontend signup form
2. Connect frontend login form
3. Store token in frontend
4. Use token for protected routes

