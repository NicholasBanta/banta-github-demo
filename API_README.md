# Voter Registration REST API

A complete REST API backend for voter registration with voter ID (SSN) validation, OTP verification, and secure data handling.

## Features

✅ **Voter ID Validation** - Validates SSN format and checks against existing registrations
✅ **Secure Registration** - Full registration flow with encryption for sensitive data
✅ **OTP Verification** - 6-digit OTP with expiration and resend functionality
✅ **Data Encryption** - AES-256 encryption for SSN storage
✅ **Error Handling** - Comprehensive validation and error messages
✅ **Statistics** - Track registration metrics
✅ **CORS Support** - Cross-origin requests enabled for frontend integration

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables** (Optional)
```bash
# Create a .env file
NODE_ENV=development
PORT=5000
ENCRYPTION_KEY=your-secure-encryption-key-here
```

3. **Start the Server**
```bash
# Development mode (with detailed logging)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check
```
GET /api/health
```
Verify the API server is running.

**Response:**
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```

---

### 2. Validate Voter ID
```
POST /api/voter-id/validate
Content-Type: application/json

{
  "voterId": "123-45-6789"
}
```

Validates voter ID format and checks if already registered.

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Voter ID is valid",
  "masked": "XXX-XX-6789",
  "valid": true
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Invalid voter ID format. Expected XXX-XX-XXXX"
}
```

**Conflict Response (409):**
```json
{
  "status": "error",
  "message": "This voter ID is already registered"
}
```

---

### 3. User Registration
```
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-123-4567",
  "country": "usa",
  "password": "SecurePassword123!",
  "voterId": "123-45-6789",
  "newsletter": true
}
```

Initiates user registration and sends OTP to email.

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Registration initiated. OTP sent to email.",
  "registrationId": "abc123def456...",
  "email": "john@example.com",
  "voterId_masked": "XXX-XX-6789",
  "otpExpiry": 1701425400000,
  "otp": "123456"
}
```

**Validation Error Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "Invalid full name",
    "Invalid email address",
    "Password must be at least 8 characters"
  ]
}
```

**Duplicate Email Response (409):**
```json
{
  "status": "error",
  "message": "Email is already registered"
}
```

---

### 4. Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

Verifies OTP and completes user registration.

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Email verified successfully",
  "email": "john@example.com",
  "voterId_masked": "XXX-XX-6789",
  "token": "session-token-here",
  "user": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "country": "usa",
    "newsletter": true
  }
}
```

**Invalid OTP Response (400):**
```json
{
  "status": "error",
  "message": "Invalid OTP"
}
```

**Expired OTP Response (400):**
```json
{
  "status": "error",
  "message": "OTP has expired. Please register again."
}
```

---

### 5. Resend OTP
```
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

Sends a new OTP to the user's email (30-second cooldown).

**Success Response (200):**
```json
{
  "status": "success",
  "message": "New OTP sent to email",
  "email": "john@example.com",
  "otp": "654321"
}
```

---

### 6. Get User Registration Status
```
GET /api/auth/user/:email
```

Retrieves user registration details.

**Success Response (200):**
```json
{
  "status": "success",
  "user": {
    "email": "john@example.com",
    "fullName": "John Doe",
    "country": "usa",
    "verified": true,
    "voterId_masked": "XXX-XX-6789",
    "createdAt": "2025-12-01T10:00:00.000Z",
    "verifiedAt": "2025-12-01T10:05:00.000Z"
  }
}
```

**Not Found Response (404):**
```json
{
  "status": "error",
  "message": "User not found"
}
```

---

### 7. Verify Voter ID
```
POST /api/voter-id/verify
Content-Type: application/json

{
  "voterId": "123-45-6789",
  "fullName": "John Doe"
}
```

Verifies voter ID against national database (simulated).

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Voter ID verified successfully",
  "verified": true,
  "voterId_masked": "XXX-XX-6789"
}
```

---

### 8. Get Registration Statistics
```
GET /api/stats
```

Retrieves registration statistics.

**Response (200):**
```json
{
  "status": "success",
  "stats": {
    "totalRegistrations": 150,
    "verifiedRegistrations": 145,
    "pendingVerifications": 5,
    "timestamp": "2025-12-01T10:30:00.000Z"
  }
}
```

---

## Validation Rules

### Full Name
- Required
- Minimum 3 characters
- Only letters, spaces, hyphens, and apostrophes

### Email
- Required
- Valid email format (RFC 5322 compliant)
- Must be unique (not already registered)

### Phone
- Optional
- Must contain only digits, spaces, hyphens, and parentheses

### Country
- Required
- Must be one of: USA, Canada, UK, Australia, India, Germany, France, Japan, Other

### Voter ID (SSN)
- Required
- Format: XXX-XX-XXXX
- Valid SSN patterns (area code, group, serial validations)
- Must be unique (not already registered)

### Password
- Required
- Minimum 8 characters
- Stored as SHA-256 hash

## Security Features

### Data Encryption
- SSN values encrypted with AES-256-CBC
- Encryption key configurable via environment variables
- Encrypted values stored, only masked SSN displayed to users

### SSN Masking
- SSN displayed as XXX-XX-XXXX (last 4 digits visible)
- Full SSN never exposed in API responses
- Prevents accidental data leaks

### OTP Security
- 6-digit OTP with 5-minute expiration
- Maximum 5 verification attempts
- 30-second resend cooldown
- OTP cleared after successful verification

### Password Security
- Passwords hashed using SHA-256
- Never stored in plain text
- Never returned in API responses

### CORS
- Configured for cross-origin requests
- Can be restricted to specific domains in production

## Error Handling

All error responses follow the format:
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "errors": ["Optional", "Detailed", "Errors"]
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Resource created
- `400` - Bad request / Validation error
- `404` - Not found
- `409` - Conflict (duplicate, already registered)
- `500` - Server error

## Testing with cURL

### Test Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### Test Voter ID Validation
```bash
curl -X POST http://localhost:5000/api/voter-id/validate \
  -H "Content-Type: application/json" \
  -d '{"voterId":"123-45-6789"}'
```

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"John Doe",
    "email":"john@example.com",
    "phone":"+1-555-123-4567",
    "country":"usa",
    "password":"SecurePassword123!",
    "voterId":"123-45-6789",
    "newsletter":true
  }'
```

### Test OTP Verification
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","otp":"123456"}'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode (development/production) | development |
| `ENCRYPTION_KEY` | AES encryption key for SSN | your-secret-encryption-key-change-in-production |

## Database Consideration

Currently uses in-memory storage. For production, consider:
- PostgreSQL with encrypted columns
- MongoDB with encryption middleware
- AWS RDS with encryption at rest
- Implement proper schema with migrations

## Frontend Integration

The frontend HTML file (`registration.html`) integrates with this API:
- Voter ID validation calls `/api/voter-id/validate`
- Registration calls `/api/auth/register`
- OTP verification calls `/api/auth/verify-otp`
- OTP resend calls `/api/auth/resend-otp`

## Production Checklist

- [ ] Replace ENCRYPTION_KEY with strong secret
- [ ] Set NODE_ENV to production
- [ ] Implement database instead of in-memory storage
- [ ] Add email service for OTP delivery
- [ ] Add rate limiting
- [ ] Add API authentication/token validation
- [ ] Enable HTTPS/TLS
- [ ] Set up monitoring and logging
- [ ] Configure CORS for specific domains
- [ ] Add input sanitization
- [ ] Implement database backups
- [ ] Add audit logging for security events

## Development Notes

- OTP is returned in development mode for testing
- In-memory storage resets when server restarts
- Voter ID verification success rate set to 95% for demo
- All timestamps in ISO 8601 format
- No external email service (implement in production)

## License

ISC

## Support

For issues or questions, please refer to the API documentation or create an issue in the repository.
