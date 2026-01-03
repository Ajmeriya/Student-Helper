# Role-Based Access Control

## How It Works

We have **3 user roles**:
1. **student** - Can view PGs and hostels
2. **broker** - Can create, update, delete PGs
3. **hostelAdmin** - Can create, update, delete hostels

## PG API Access

| Endpoint | Public | Student | Broker | Hostel Admin |
|----------|--------|---------|--------|--------------|
| GET /api/pg | ✅ | ✅ | ✅ | ✅ |
| GET /api/pg/:id | ✅ | ✅ | ✅ | ✅ |
| POST /api/pg | ❌ | ❌ | ✅ | ❌ |
| PUT /api/pg/:id | ❌ | ❌ | ✅* | ❌ |
| DELETE /api/pg/:id | ❌ | ❌ | ✅* | ❌ |
| GET /api/pg/my-pgs | ❌ | ❌ | ✅ | ❌ |

*✅ = Only if they own the PG

## How Role Checking Works

### Middleware Chain:

```
Request → auth middleware → requireRole middleware → Controller
           ↓                        ↓
      Verifies token        Checks user role
      Adds req.user         Allows/Denies access
```

### Example: Create PG

```javascript
router.post('/', auth, requireRole('broker'), createPG)
```

**Flow:**
1. `auth` middleware runs first
   - Verifies JWT token
   - Gets user from database
   - Adds `req.user` to request

2. `requireRole('broker')` middleware runs next
   - Checks if `req.user.role === 'broker'`
   - If yes → continue to controller
   - If no → return 403 Forbidden

3. `createPG` controller runs
   - Only brokers reach here
   - Creates PG with broker ID

## Testing Role Protection

### Test 1: Student tries to create PG (Should Fail)

1. Create student account:
```json
POST /api/auth/signup
{
  "role": "student",
  ...
}
```

2. Try to create PG:
```json
POST /api/pg
Authorization: Bearer <student-token>
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. This action requires one of these roles: broker"
}
```

### Test 2: Broker creates PG (Should Work)

1. Create broker account:
```json
POST /api/auth/signup
{
  "role": "broker",
  ...
}
```

2. Create PG:
```json
POST /api/pg
Authorization: Bearer <broker-token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "PG created successfully",
  "pg": { ... }
}
```

## Error Responses

### 401 Unauthorized (No Token)
```json
{
  "success": false,
  "message": "No token provided, authorization denied"
}
```

### 401 Unauthorized (Invalid Token)
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden (Wrong Role)
```json
{
  "success": false,
  "message": "Access denied. This action requires one of these roles: broker"
}
```

### 403 Forbidden (Not Owner)
```json
{
  "success": false,
  "message": "Not authorized to update this PG"
}
```

## Summary

✅ **Authentication** (`auth` middleware) - Verifies user is logged in  
✅ **Authorization** (`requireRole` middleware) - Verifies user has correct role  
✅ **Ownership** (in controller) - Verifies user owns the resource  

This ensures:
- Only brokers can create PGs
- Only owners can update/delete their PGs
- Students can only view PGs

