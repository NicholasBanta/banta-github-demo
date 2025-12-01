# API Testing Guide

Complete guide to test all endpoints of the Voter Registration REST API.

## Prerequisites

- Backend running: `npm run dev` (running on http://localhost:5000)
- cURL installed (or use Postman/Insomnia)
- Valid email for testing

## Test Workflow

### 1. Health Check

**Verify API is running**

```bash
curl -X GET http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```

---

### 2. Validate Voter ID

**Test voter ID validation endpoint**

```bash
curl -X POST http://localhost:5000/api/voter-id/validate \
  -H "Content-Type: application/json" \
  -d '{"voterId":"123-45-6789"}'
```

**Expected Response (Success):**
```json
{
  "status": "success",
  "message": "Voter ID is valid",
  "masked": "XXX-XX-6789",
  "valid": true
}
```

**Test Invalid Format:**
```bash
curl -X POST http://localhost:5000/api/voter-id/validate \
  -H "Content-Type: application/json" \
  -d '{"voterId":"invalid"}'
```

**Expected Response (Error):**
```json
{
  "status": "error",
  "message": "Invalid voter ID format. Expected XXX-XX-XXXX"
}
```

---

### 3. Register New User

**Complete registration with all fields**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "country": "usa",
    "password": "TestPassword123!",
    "voterId": "123-45-6789",
    "newsletter": true
  }'
```

**Expected Response (Success):**
```json
{
  "status": "success",
  "message": "Registration initiated. OTP sent to email.",
  "registrationId": "abc123def456...",
  "email": "john.doe@example.com",
  "voterId_masked": "XXX-XX-6789",
  "otpExpiry": 1701425400000,
  "otp": "123456"
}
```

**Save the OTP for next step!**

**Test Validation Error:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "JD",
    "email": "invalid-email",
    "country": "invalid",
    "password": "short",
    "voterId": "invalid",
    "newsletter": false
  }'
```

**Expected Response (Validation Error):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "Invalid full name",
    "Invalid email address",
    "Invalid country selection",
    "Password must be at least 8 characters",
    "Invalid voter ID format"
  ]
}
```

---

### 4. Verify OTP

**Verify the OTP received in registration response**

Replace `123456` with the actual OTP from step 3 response:

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

**Expected Response (Success):**
```json
{
  "status": "success",
  "message": "Email verified successfully",
  "email": "john.doe@example.com",
  "voterId_masked": "XXX-XX-6789",
  "token": "session-token-here",
  "user": {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "country": "usa",
    "newsletter": true
  }
}
```

**Save the token for authenticated requests**

**Test Invalid OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "000000"
  }'
```

**Expected Response (Error):**
```json
{
  "status": "error",
  "message": "Invalid OTP"
}
```

---

### 5. Resend OTP

**Request a new OTP to be sent**

```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com"}'
```

**Expected Response (Success):**
```json
{
  "status": "success",
  "message": "New OTP sent to email",
  "email": "john.doe@example.com",
  "otp": "654321"
}
```

**Note:** In production, OTP won't be in response (email only)

**Test Resend with Cooldown:**
```bash
# Call it immediately after the first resend
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com"}'
```

**Expected Response (Error):**
```json
{
  "status": "error",
  "message": "Please wait before requesting another code"
}
```

---

### 6. Get User Registration Status

**Retrieve user details**

```bash
curl -X GET http://localhost:5000/api/auth/user/john.doe@example.com
```

**Expected Response (Success):**
```json
{
  "status": "success",
  "user": {
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "country": "usa",
    "verified": true,
    "voterId_masked": "XXX-XX-6789",
    "createdAt": "2025-12-01T10:00:00.000Z",
    "verifiedAt": "2025-12-01T10:05:00.000Z"
  }
}
```

**Test Non-existent User:**
```bash
curl -X GET http://localhost:5000/api/auth/user/nonexistent@example.com
```

**Expected Response (Not Found):**
```json
{
  "status": "error",
  "message": "User not found"
}
```

---

### 7. Verify Voter ID Against Database

**Verify voter ID with full name (simulated DB check)**

```bash
curl -X POST http://localhost:5000/api/voter-id/verify \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "123-45-6789",
    "fullName": "John Doe"
  }'
```

**Expected Response (Success - 95% in demo):**
```json
{
  "status": "success",
  "message": "Voter ID verified successfully",
  "verified": true,
  "voterId_masked": "XXX-XX-6789"
}
```

**Expected Response (Failure - 5% in demo):**
```json
{
  "status": "error",
  "message": "Voter ID could not be verified against national records"
}
```

---

### 8. Get Registration Statistics

**View overall registration stats**

```bash
curl -X GET http://localhost:5000/api/stats
```

**Expected Response:**
```json
{
  "status": "success",
  "stats": {
    "totalRegistrations": 5,
    "verifiedRegistrations": 3,
    "pendingVerifications": 2,
    "timestamp": "2025-12-01T10:30:00.000Z"
  }
}
```

---

## Complete Registration Flow Test

**Execute all steps in sequence:**

```bash
# Step 1: Check health
echo "1. Health Check:"
curl -X GET http://localhost:5000/api/health
echo "\n"

# Step 2: Validate voter ID
echo "2. Validate Voter ID:"
curl -X POST http://localhost:5000/api/voter-id/validate \
  -H "Content-Type: application/json" \
  -d '{"voterId":"123-45-6789"}'
echo "\n"

# Step 3: Register user
echo "3. Register User:"
RESPONSE=$(curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-987-6543",
    "country": "usa",
    "password": "SecurePassword123!",
    "voterId": "987-65-4321",
    "newsletter": true
  }')
echo $RESPONSE
OTP=$(echo $RESPONSE | grep -o '"otp":"[^"]*' | cut -d'"' -f4)
echo "Extracted OTP: $OTP"
echo "\n"

# Step 4: Verify OTP
echo "4. Verify OTP:"
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"jane.smith@example.com\",\"otp\":\"$OTP\"}"
echo "\n"

# Step 5: Get user status
echo "5. Get User Status:"
curl -X GET http://localhost:5000/api/auth/user/jane.smith@example.com
echo "\n"

# Step 6: View statistics
echo "6. View Statistics:"
curl -X GET http://localhost:5000/api/stats
echo "\n"
```

---

## Error Scenarios to Test

### Duplicate Email
```bash
# Register with same email twice
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "duplicate@example.com",
    "country": "usa",
    "password": "TestPass123!",
    "voterId": "111-11-1111",
    "newsletter": false
  }'

# Try registering again with same email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Another User",
    "email": "duplicate@example.com",
    "country": "usa",
    "password": "TestPass123!",
    "voterId": "222-22-2222",
    "newsletter": false
  }'
```

**Expected:** Second request returns 409 Conflict

### Duplicate Voter ID
```bash
# Register with same voter ID twice
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "User One",
    "email": "user1@example.com",
    "country": "usa",
    "password": "TestPass123!",
    "voterId": "555-55-5555",
    "newsletter": false
  }'

# Try registering again with same voter ID
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "User Two",
    "email": "user2@example.com",
    "country": "usa",
    "password": "TestPass123!",
    "voterId": "555-55-5555",
    "newsletter": false
  }'
```

**Expected:** Second request returns 409 Conflict

### OTP Expiration
```bash
# Wait 5+ minutes after registration, then try to verify
# OTP will have expired
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

**Expected:** Returns 400 Bad Request - "OTP has expired"

---

## Using Postman

1. Create collection "Voter Registration API"
2. Add requests for each endpoint:
   - **GET** `/api/health`
   - **POST** `/api/voter-id/validate`
   - **POST** `/api/auth/register`
   - **POST** `/api/auth/verify-otp`
   - **POST** `/api/auth/resend-otp`
   - **GET** `/api/auth/user/:email`
   - **POST** `/api/voter-id/verify`
   - **GET** `/api/stats`

3. Set `{{base_url}}` variable to `http://localhost:5000/api`
4. Set `{{email}}` and `{{otp}}` variables from registration response

---

## Response Codes

| Code | Meaning | Examples |
|------|---------|----------|
| 200 | Success | Health check, OTP verification |
| 201 | Created | User registration |
| 400 | Bad Request | Invalid format, validation error |
| 404 | Not Found | User not found |
| 409 | Conflict | Duplicate email or voter ID |
| 500 | Server Error | Unexpected error |

---

## Tips for Testing

✅ **Use unique emails** for each test to avoid "already registered" errors
✅ **Check timestamps** - OTP expires after 5 minutes
✅ **Save OTP** from registration response for verification
✅ **Test validation** with invalid data first
✅ **Check server console** for detailed error logs
✅ **Monitor network** in browser DevTools

---

## Production Testing Checklist

- [ ] Test with real database
- [ ] Test with real email service
- [ ] Test rate limiting
- [ ] Test with HTTPS
- [ ] Load test with multiple concurrent requests
- [ ] Security test (SQL injection, XSS, etc.)
- [ ] Test error recovery scenarios
- [ ] Performance benchmarking
