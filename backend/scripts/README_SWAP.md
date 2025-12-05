# Hostel ↔️ PG Data Swap Instructions

## Problem
You accidentally created PG data in the Hostel collection and Hostel data in the PG collection. This guide will help you swap them correctly.

## 🚨 IMPORTANT: Backup First!

Before running any swap operation, ensure you have a backup of your database.

### Manual MongoDB Backup (Recommended)
```powershell
# If MongoDB is running locally
mongodump --db student_helper --out C:\backup_student_helper
```

### Or use MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Export both `hostels` and `pgs` collections to JSON files

---

## 📋 Step-by-Step Process

### Step 1: Stop Your Server
```powershell
# Stop the backend server if it's running
# Press Ctrl+C in the terminal where the server is running
```

### Step 2: Navigate to the Scripts Directory
```powershell
cd C:\Users\ADMIN\Documents\student-helper2\backend\scripts
```

### Step 3: Run the Swap Script
```powershell
node swapHostelsPGs.js
```

**What the script does:**
1. ✅ Fetches all documents from both collections
2. ✅ Creates an automatic backup in `backend/backups/` folder
3. ✅ Clears both collections
4. ✅ Inserts PG data → Hostel collection
5. ✅ Inserts Hostel data → PG collection
6. ✅ Verifies the swap was successful

### Step 4: Verify the Results

After the swap, check your data:

1. **Using MongoDB Compass:**
   - Open the `hostels` collection - should now contain PG data
   - Open the `pgs` collection - should now contain Hostel data

2. **Using the Backend:**
   ```powershell
   # Start your backend server
   cd C:\Users\ADMIN\Documents\student-helper2\backend
   npm start
   ```

3. **Using the Frontend:**
   - Open your browser
   - Navigate to the Hostels page
   - Navigate to the PGs page
   - Verify the correct data is showing on each page

---

## 🔄 If Something Goes Wrong - Rollback

If the swap didn't work as expected, you can rollback to the backup:

```powershell
# From the scripts directory
node rollbackSwap.js
```

This will restore your data from the most recent backup created by the swap script.

---

## 📁 Files Included

- **swapHostelsPGs.js** - Main swap script
- **rollbackSwap.js** - Rollback script to undo the swap
- **README_SWAP.md** - This instruction file

---

## 🔍 Verification Checklist

After swapping, verify:

- [ ] Frontend Hostels page (`/hostels`) shows actual hostel listings
- [ ] Frontend PGs page (`/pgs`) shows actual PG listings
- [ ] "Add Hostel" button creates hostels in the Hostel collection
- [ ] "Add PG" button creates PGs in the PG collection
- [ ] All images and data display correctly
- [ ] Search functionality works on both pages

---

## 💡 Alternative: Manual Database Swap (Advanced)

If you prefer to swap manually using MongoDB Compass or CLI:

### Using MongoDB Shell:
```javascript
// Connect to your database
use student_helper

// 1. Backup collections
db.hostels.find().forEach(function(doc) {
    db.hostels_backup.insert(doc);
});

db.pgs.find().forEach(function(doc) {
    db.pgs_backup.insert(doc);
});

// 2. Rename collections (MongoDB command)
db.hostels.renameCollection("hostels_temp");
db.pgs.renameCollection("hostels");
db.hostels_temp.renameCollection("pgs");
```

---

## ⚠️ Common Issues

### Issue: "Cannot find module '../models/Hostel'"
**Solution:** Make sure you're running the script from the `backend/scripts` directory

### Issue: "MongoDB connection error"
**Solution:** 
1. Check if MongoDB is running
2. Verify your `.env` file has the correct `MONGO_URI`
3. Ensure you're in the correct directory

### Issue: "Backup folder not found"
**Solution:** The script will automatically create the `backend/backups` folder

---

## 📞 Need Help?

If you encounter any issues:
1. Check the backup file in `backend/backups/`
2. Use the rollback script to restore
3. Review the console output for error messages

---

## ✅ Success!

Once the swap is complete and verified:
- Your Hostels page will show hostel data
- Your PGs page will show PG data
- All future additions will go to the correct collections

The backup file will remain in `backend/backups/` folder for future reference.
