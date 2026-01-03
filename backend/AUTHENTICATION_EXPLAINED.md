# Authentication System - Step by Step Explanation

## What We Built

A complete authentication system with:
1. **User Registration** (Signup)
2. **User Login**
3. **JWT Token** (Secure way to identify users)
4. **Protected Routes** (Routes that require login)

---

## How Authentication Works

### Step 1: User Signs Up

```
User fills form → POST /api/auth/signup → Server creates user → Returns token
```

**What happens:**
1. User provides: name, email, password, etc.
2. Server validates data
3. Password is **hashed** (encrypted) before saving
4. User is saved to database
5. Server generates **JWT token**
6. Token is sent back to user

### Step 2: User Logs In

```
User enters email/password → POST /api/auth/login → Server verifies → Returns token
```

**What happens:**
1. User provides email and password
2. Server finds user by email
3. Server compares password (hashed comparison)
4. If correct, generates JWT token
5. Token is sent back to user

### Step 3: Using Protected Routes

```
User sends request with token → Middleware verifies token → Allows access
```

**What happens:**
1. User includes token in header: `Authorization: Bearer <token>`
2. Auth middleware extracts token
3. Verifies token is valid
4. Adds userId to request
5. Route handler can use req.userId

---

## JWT Token Explained

**JWT = JSON Web Token**

Think of it like a **temporary ID card**:
- Contains user ID
- Signed with secret key (can't be faked)
- Expires after 30 days
- Sent with every protected request

**Format:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIn0...
```

**Parts:**
1. Header (algorithm info)
2. Payload (user ID)
3. Signature (verification)

---

## Password Hashing

**Why hash passwords?**
- Never store passwords in plain text!
- If database is hacked, passwords are safe

**How it works:**
1. User enters password: "MyPassword123"
2. Server adds "salt" (random data)
3. Server hashes: "a8f5f167f44f4964e6c998dee827110c"
4. Stores hash in database
5. Original password is never stored

**Login:**
1. User enters password: "MyPassword123"
2. Server hashes it with same salt
3. Compares with stored hash
4. If match → login successful

---

## API Endpoints

### 1. Signup
```
POST /api/auth/signup
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phoneNumber": "1234567890",
  "city": "Nadiad",
  "role": "student",
  "collegeName": "Example College"
}

Response: {
  "success": true,
  "token": "eyJhbGci...",
  "user": { ... }
}
```

### 2. Login
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "Password123!"
}

Response: {
  "success": true,
  "token": "eyJhbGci...",
  "user": { ... }
}
```

### 3. Get Current User (Protected)
```
GET /api/auth/me
Headers: {
  "Authorization": "Bearer eyJhbGci..."
}

Response: {
  "success": true,
  "user": { ... }
}
```

---

## Testing Authentication

### Test Signup:
```bash
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123!@#",
  "phoneNumber": "1234567890",
  "city": "Nadiad",
  "role": "student",
  "collegeName": "Test College"
}
```

### Test Login:
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

### Test Protected Route:
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your-token-here>
```

---

## Security Features

✅ **Password Hashing** - Passwords never stored in plain text  
✅ **JWT Tokens** - Secure, time-limited access  
✅ **Token Expiration** - Tokens expire after 30 days  
✅ **Email Validation** - Ensures valid email format  
✅ **Unique Emails** - No duplicate accounts  
✅ **Password Strength** - Minimum 8 characters  
✅ **Role-Based Access** - Different roles have different permissions  

---

## Next Steps

Now that authentication is ready, we can:
1. Protect PG routes (only brokers can create PGs)
2. Link PGs to users (who created them)
3. Add user info to PG responses

**Ready to continue?** We'll update the PG API to use authentication!

