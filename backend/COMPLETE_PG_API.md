# Complete PG API - All Endpoints

## ✅ What We Built

Complete PG API with all CRUD operations:

1. **GET /api/pg** - Get all PGs (public, with filters)
2. **GET /api/pg/:id** - Get single PG (public)
3. **POST /api/pg** - Create PG (protected - requires login)
4. **PUT /api/pg/:id** - Update PG (protected - owner only)
5. **DELETE /api/pg/:id** - Delete PG (protected - owner only)
6. **GET /api/pg/my-pgs** - Get my PGs (protected - broker only)

---

## API Endpoints Explained

### 1. Get All PGs (Public)

**Endpoint:** `GET /api/pg`

**Query Parameters (all optional):**
- `city` - Filter by city
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sharingType` - single, double, triple, quad
- `ac` - true/false
- `furnished` - true/false
- `ownerOnFirstFloor` - true/false
- `foodAvailable` - true/false
- `parking` - true/false
- `minDistance` - Minimum distance to college
- `maxDistance` - Maximum distance to college
- `search` - Search in title or location

**Example:**
```
GET /api/pg?city=Nadiad&minPrice=4000&ac=true&furnished=true
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "pgs": [ ... ]
}
```

---

### 2. Get Single PG (Public)

**Endpoint:** `GET /api/pg/:id`

**Example:**
```
GET /api/pg/65a1b2c3d4e5f6g7h8i9j0k1
```

**Response:**
```json
{
  "success": true,
  "pg": {
    "id": "...",
    "title": "...",
    "broker": {
      "name": "...",
      "email": "..."
    },
    ...
  }
}
```

---

### 3. Create PG (Protected - Broker Only)

**Endpoint:** `POST /api/pg`

**Requires:** 
- Authentication token in header
- User must have "broker" role

**Headers:**
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Comfortable PG near College",
  "location": "123 Main Street, Nadiad",
  "city": "Nadiad",
  "collegeName": "Example College",
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

**Response:**
```json
{
  "success": true,
  "message": "PG created successfully",
  "pg": { ... }
}
```

---

### 4. Update PG (Protected - Broker & Owner Only)

**Endpoint:** `PUT /api/pg/:id`

**Requires:** 
- Authentication token
- User must have "broker" role
- Must be the owner of the PG

**Example:**
```
PUT /api/pg/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer <your-token>
```

**Body:** (only fields you want to update)
```json
{
  "price": 5500,
  "ac": true
}
```

---

### 5. Delete PG (Protected - Broker & Owner Only)

**Endpoint:** `DELETE /api/pg/:id`

**Requires:**
- Authentication token
- User must have "broker" role
- Must be the owner

**Example:**
```
DELETE /api/pg/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer <your-token>
```

**Response:**
```json
{
  "success": true,
  "message": "PG deleted successfully"
}
```

---

### 6. Get My PGs (Protected - Broker Only)

**Endpoint:** `GET /api/pg/my-pgs`

**Requires:** 
- Authentication token
- User must have "broker" role

**Example:**
```
GET /api/pg/my-pgs
Authorization: Bearer <your-token>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "pgs": [ ... ]
}
```

---

## Testing Complete Flow

### Step 1: Create User (Broker)
```
POST /api/auth/signup
{
  "name": "Broker Name",
  "email": "broker@example.com",
  "password": "Password123!",
  "phoneNumber": "1234567890",
  "city": "Nadiad",
  "role": "broker"
}
```
**Save the token!**

### Step 2: Create PG
```
POST /api/pg
Authorization: Bearer <token>
{
  "title": "My First PG",
  "location": "123 Street",
  "city": "Nadiad",
  "collegeName": "Test College",
  "sharingType": "double",
  "bedrooms": 2,
  "bathrooms": 1,
  "price": 5000,
  "coordinates": {
    "lat": 22.6944,
    "lng": 72.8606
  }
}
```
**Save the PG ID!**

### Step 3: Get All PGs
```
GET /api/pg?city=Nadiad
```

### Step 4: Get Single PG
```
GET /api/pg/<pg-id>
```

### Step 5: Get My PGs
```
GET /api/pg/my-pgs
Authorization: Bearer <token>
```

### Step 6: Update PG
```
PUT /api/pg/<pg-id>
Authorization: Bearer <token>
{
  "price": 5500
}
```

---

## Security Features

✅ **Authentication Required** - Create/Update/Delete need login  
✅ **Role-Based Access** - Only brokers can create/update/delete PGs  
✅ **Ownership Check** - Only owner can update/delete their own PGs  
✅ **Soft Delete** - Sets isActive=false (data preserved)  
✅ **Public Read** - Anyone can view PGs (for students)  

---

## Next Steps

Now that PG API is complete, we can:
1. Connect frontend to these APIs
2. Add file upload for images/videos
3. Add distance calculation
4. Build Hostel API (similar to PG)

**Ready to test?** Follow the testing steps above!

