# Step-by-Step: PG List API

## What We Just Built

We created the **simplest possible API** to get all PGs from the database.

### Files Created:

1. **`server.js`** - Basic Express server
2. **`config/db.js`** - MongoDB Atlas connection
3. **`models/PG.js`** - PG data structure (schema)
4. **`controllers/pgController.js`** - Business logic (getAllPGs function)
5. **`routes/pg.js`** - URL routing (connects URL to function)

## How It Works

```
User Request → Route → Controller → Model → Database
                ↓
            Response ← Controller ← Model ← Database
```

### Step-by-Step Flow:

1. **User makes request**: `GET http://localhost:5000/api/pg?city=Nadiad`
2. **Route receives it**: `routes/pg.js` sees `/api/pg` and calls `getAllPGs`
3. **Controller processes**: `pgController.js` builds filter and queries database
4. **Model queries DB**: `PG.js` model talks to MongoDB
5. **Response sent**: JSON data back to user

## Testing the API

### Using Browser:
```
http://localhost:5000/api/pg
http://localhost:5000/api/pg?city=Nadiad
http://localhost:5000/api/pg?city=Nadiad&minPrice=4000&ac=true
```

### Using Postman/Thunder Client:
- Method: GET
- URL: `http://localhost:5000/api/pg`
- Query Params:
  - city: Nadiad
  - minPrice: 4000
  - ac: true

## What's Next?

Once this works, we'll add:
- **Step 2**: Create PG API (POST /api/pg)
- **Step 3**: Get Single PG API (GET /api/pg/:id)
- etc.

## Understanding the Code

### Filter Building:
```javascript
const filter = { isActive: true }  // Start with active PGs only
if (city) filter.city = city        // Add city if provided
if (ac === 'true') filter.ac = true // Add AC filter if true
```

### Database Query:
```javascript
const pgs = await PG.find(filter)  // Find all matching PGs
  .sort({ createdAt: -1 })          // Sort by newest first
```

### Response:
```javascript
res.json({
  success: true,
  count: pgs.length,
  pgs
})
```

## Common Questions

**Q: Why MongoDB Atlas?**  
A: Cloud database = no local setup = easy deployment

**Q: What if I don't have data?**  
A: We'll add a "Create PG" API next to add test data

**Q: How do filters work?**  
A: We build a filter object, MongoDB finds matching documents

---

**Ready for next step?** Just tell me when you've tested this API!

