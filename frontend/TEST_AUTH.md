# Testing Authentication

## Steps to Debug Authentication Issue

1. **Clear localStorage** (in browser console):
   ```javascript
   localStorage.clear()
   ```

2. **Login again** to get a new token from Spring Boot backend

3. **Test the token** by calling the test endpoint:
   ```javascript
   const token = localStorage.getItem('token')
   fetch('http://localhost:5000/api/health/test-auth', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   .then(r => r.json())
   .then(console.log)
   ```

4. **Check backend logs** - you should see:
   - `🔐 Signing key initialized...`
   - `🔍 Validating token...`
   - `✅ Token validated successfully...` or error messages

5. **If token validation fails**, the logs will show the exact error:
   - Signature mismatch
   - Token expired
   - Weak key exception
   - etc.

## Common Issues

- **Old token from Node.js**: Clear localStorage and login again
- **Backend not running**: Make sure Spring Boot is running on port 5000
- **CORS issues**: Check browser console for CORS errors
- **Token format**: Token should be a JWT with 3 parts separated by dots

