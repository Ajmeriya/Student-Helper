# Troubleshooting Guide

## User Data Not Saving to Database

If user data is not being saved after signup, check these common issues:

### 1. Check Database Connection

**Look for this in server logs:**
```
✅ MongoDB Atlas Connected!
📊 Database: student-helper
🌐 Host: cluster0.xxxxx.mongodb.net
```

**If you see connection errors:**
- Check your `.env` file has `MONGODB_URI`
- Verify MongoDB Atlas cluster is running
- Check IP whitelist (should include 0.0.0.0/0 for all IPs)
- Verify connection string format

### 2. Check Server Logs

When you try to signup, you should see:
```
📝 Signup attempt: { name: '...', email: '...', role: '...' }
💾 Creating user in database...
✅ User created successfully: 65a1b2c3d4e5f6g7h8i9j0k1
```

**If you see errors:**
- Check the error message
- Common errors are listed below

### 3. Common Errors

#### Error: "Email already exists"
- User with this email is already registered
- Try a different email

#### Error: "Validation error"
- Check the `errors` array in response
- Common issues:
  - Password too short (min 8 characters)
  - Invalid email format
  - Phone number not 10 digits
  - Invalid role (must be: student, broker, hostelAdmin)
  - Student missing college name

#### Error: "MongoDB connection error"
- Database is not connected
- Check `.env` file
- Check MongoDB Atlas cluster status

### 4. Test Database Connection

**Test if database is working:**

```bash
# In Postman/Thunder Client
GET http://localhost:5000/api/health
```

**Should return:**
```json
{
  "status": "OK",
  "message": "Student Helper API is running"
}
```

### 5. Verify User Was Created

**Check MongoDB Atlas:**
1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Look for `users` collection
4. Check if your user is there

**Or test login:**
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

If login works, user was created successfully!

### 6. Check Request Body

**Make sure you're sending:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phoneNumber": "1234567890",
  "city": "Nadiad",
  "role": "broker"
}
```

**For students, also include:**
```json
{
  "collegeName": "Example College"
}
```

### 7. Check Response

**Successful signup should return:**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "..."
  }
}
```

**If you get an error response:**
- Read the error message
- Check the `errors` field if it's a validation error
- Fix the issue and try again

### 8. Enable Detailed Logging

The signup controller now logs:
- Signup attempt details
- Database creation status
- Any errors with full details

**Check your server console for these logs!**

---

## Still Not Working?

1. **Check server is running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check .env file exists:**
   ```bash
   # Should be in backend/.env
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

3. **Check MongoDB Atlas:**
   - Cluster is running (not paused)
   - IP whitelist includes 0.0.0.0/0
   - Database user has read/write permissions

4. **Try creating user directly in MongoDB Atlas:**
   - Go to Collections
   - Click "Insert Document"
   - This will help verify database is working

5. **Check for typos:**
   - Email format
   - Role spelling (student, broker, hostelAdmin)
   - Phone number (exactly 10 digits)

---

## Quick Test

Run this complete test:

```bash
# 1. Test server
GET http://localhost:5000/api/health

# 2. Signup
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123!@#",
  "phoneNumber": "1234567890",
  "city": "Nadiad",
  "role": "broker"
}

# 3. Login (verify user was created)
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

If all three work, your setup is correct!

