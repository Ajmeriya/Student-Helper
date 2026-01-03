# Debugging: Data Not Saving to Database

## Problem
You can login/create user, but MongoDB Atlas shows 0 documents in the `users` collection.

## Possible Causes

### 1. **Wrong Database Name**
Your connection string might be connecting to a different database than what you're viewing in Atlas.

**Check:**
```bash
cd backend
npm run check-db
```

This will show:
- Which database you're actually connected to
- How many users exist
- If database names match

### 2. **Frontend Using Mock Data**
The frontend might still be using mock data instead of calling the real API.

**Check frontend:**
- Look for `TODO: Replace with actual API call` comments
- Check if `AuthContext.jsx` is making real API calls
- Verify API base URL is correct

### 3. **Database Name Mismatch**
Your `.env` file might have:
```
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/student-helper
```

But you're looking at the `test` database in Atlas.

**Solution:**
- Either change connection string to use `test` database
- Or look at the correct database in Atlas

## Quick Debug Steps

### Step 1: Check Which Database You're Connected To

```bash
cd backend
npm run check-db
```

**Look for:**
```
📊 Database Name: student-helper
🔍 Database name in connection string: "student-helper"
🔍 Actual connected database: "student-helper"
```

If they don't match, that's your problem!

### Step 2: Check Server Logs

When you signup, you should see:
```
📝 Signup attempt: { name: '...', email: '...', role: 'student' }
💾 Creating user in database...
📦 User data (without password): { ... }
🗄️  Database name: student-helper
🗄️  Collection name: users
✅ User created successfully!
   User ID: 65a1b2c3d4e5f6g7h8i9j0k1
✅ Verification: User found in database!
```

**If you see errors, check the error message!**

### Step 3: Verify in MongoDB Atlas

1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. **Check the database name** in the left sidebar
4. Make sure it matches what your connection string says

**Example:**
- Connection string: `mongodb+srv://...@cluster.mongodb.net/student-helper`
- Look for database: `student-helper` (not `test`)

### Step 4: Test Direct Database Access

```bash
cd backend
npm run test-signup
```

This will:
- Create a test user
- Verify it was saved
- Show you the user ID

If this works but your signup doesn't, the issue is in the API call.

## Common Issues

### Issue 1: Database Name Mismatch

**Symptom:** Data saves but you can't see it in Atlas

**Solution:**
1. Check your `.env` file for `MONGODB_URI`
2. Extract database name from connection string (last part before `?`)
3. Look for that database name in Atlas (not `test`)

**Example:**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/my-database
                                                              ^^^^^^^^^^^
                                                              This is the database name
```

### Issue 2: Frontend Not Calling API

**Symptom:** Login works but no API calls in server logs

**Check:**
- Open browser DevTools → Network tab
- Try to signup
- Look for POST request to `/api/auth/signup`
- If no request, frontend is using mock data

**Fix:**
- Update `AuthContext.jsx` to use real API
- Check `API_BASE_URL` in `src/utils/constants.js`

### Issue 3: Connection to Wrong Cluster

**Symptom:** Data saves but in different cluster

**Solution:**
- Verify connection string matches your cluster
- Check cluster name in Atlas matches connection string

## Quick Fix

**Most likely issue:** Database name mismatch

1. Run: `npm run check-db`
2. Note the database name it shows
3. In Atlas, look for that database name (not `test`)
4. Or update your `.env` to use `test` database:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/test
```

## Still Not Working?

1. **Check server logs** - Look for errors
2. **Check database name** - Run `npm run check-db`
3. **Check frontend** - Verify it's calling the API
4. **Check .env file** - Verify MONGODB_URI is correct
5. **Check Atlas** - Look at the correct database

Share the output of `npm run check-db` and I can help further!

