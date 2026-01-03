# MongoDB Atlas Setup Guide

## Why MongoDB Atlas?

✅ **Cloud Database** - No local installation needed  
✅ **Free Tier** - 512MB storage (perfect for learning)  
✅ **Easy Deployment** - Works everywhere  
✅ **No Headaches** - Managed by MongoDB

## Step-by-Step Setup

### Step 1: Create Account

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google

### Step 2: Create Free Cluster

1. After signup, you'll see "Create a Deployment"
2. Choose **FREE** tier (M0)
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region closest to you
5. Click "Create"

⏳ Wait 3-5 minutes for cluster to be created

### Step 3: Create Database User

1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username (e.g., `studenthelper`)
5. Enter password (save this!)
6. Click "Add User"

### Step 4: Whitelist Your IP

1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP
4. Click "Confirm"

### Step 5: Get Connection String

1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`
5. Replace `<password>` with your actual password
6. Add database name at the end: `...mongodb.net/student-helper`

### Step 6: Add to .env File

Create `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/student-helper
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Example Connection String

```
mongodb+srv://studenthelper:MyPassword123@cluster0.abc123.mongodb.net/student-helper
```

**Parts:**
- `studenthelper` - Your username
- `MyPassword123` - Your password
- `cluster0.abc123` - Your cluster name
- `student-helper` - Database name

## Test Connection

Run the server:
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ MongoDB Atlas Connected!
📊 Database: student-helper
```

## Troubleshooting

**Connection Error?**
- Check your password is correct
- Check IP is whitelisted
- Check connection string format

**Can't create cluster?**
- Make sure you verified your email
- Try different region

## Free Tier Limits

- 512MB storage
- Shared RAM
- Perfect for learning and small projects!

