# 🔄 Quick Swap Guide - Fix PG/Hostel Mix-up

## TL;DR - What to Do:

Your PG data is in the Hostel collection and vice versa. Here's how to fix it:

### 1️⃣ Stop your server (if running)
Press `Ctrl+C` in the terminal

### 2️⃣ Navigate to scripts folder
```powershell
cd C:\Users\ADMIN\Documents\student-helper2\backend\scripts
```

### 3️⃣ Run the swap script
```powershell
node swapHostelsPGs.js
```

### 4️⃣ Type "yes" when prompted

### 5️⃣ Restart your server and verify
```powershell
cd ..
npm start
```

---

## ✅ What the Script Does:

1. **Backs up** your current data automatically
2. **Swaps** all Hostel ↔️ PG collection data
3. **Verifies** the swap was successful
4. Shows you a summary of what changed

---

## 🔄 Need to Undo?

Run the rollback script:
```powershell
node rollbackSwap.js
```

---

## 📂 Where Are My Backups?

Automatic backups are saved in:
```
C:\Users\ADMIN\Documents\student-helper2\backend\backups\
```

---

## 🎯 Expected Result:

**BEFORE:**
- `/hostels` page → Shows PG data ❌
- `/pgs` page → Shows Hostel data ❌

**AFTER:**
- `/hostels` page → Shows Hostel data ✅
- `/pgs` page → Shows PG data ✅

---

## 📋 Files Created for You:

1. **backend/scripts/swapHostelsPGs.js** - Main swap script
2. **backend/scripts/rollbackSwap.js** - Undo script
3. **backend/scripts/README_SWAP.md** - Detailed instructions
4. **QUICK_SWAP_GUIDE.md** - This quick reference

---

## ⚠️ Before Running:

- ✅ Make sure MongoDB is running
- ✅ Stop your backend server
- ✅ Optional: Manual backup using `mongodump` or MongoDB Compass

---

## 🚀 Ready to Swap?

1. Open PowerShell
2. Navigate to: `C:\Users\ADMIN\Documents\student-helper2\backend\scripts`
3. Run: `node swapHostelsPGs.js`
4. Type: `yes`
5. Wait for completion
6. Verify on your frontend

That's it! 🎉

---

**Need detailed instructions?** 
Check: `backend/scripts/README_SWAP.md`
