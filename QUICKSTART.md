# Quick Start Guide - Voter Registration System

## Overview
This is a complete voter registration system with:
- Frontend: HTML/CSS/JavaScript registration form
- Backend: Node.js/Express REST API
- Features: Voter ID validation, OTP verification, secure data storage

## Quick Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Backend Server
```bash
# Development mode (recommended for testing)
npm run dev

# Or production mode
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║   Voter Registration API Server        ║
║   Running on http://localhost:5000     ║
╚════════════════════════════════════════╝
```

### Step 3: Open the Frontend
1. Open `registration.html` in your web browser
2. Or run a local server in the directory:
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000
```

Then visit: `http://localhost:8000/registration.html`

## Test Workflow

### 1. Register a New User
1. Fill in the registration form:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: +1-555-123-4567
   - Country: United States
   - Voter ID: 123-45-6789
   - Password: TestPass123!
   - Confirm Password: TestPass123!
   - Check Terms & Newsletter (optional)

2. Click "Register"
3. The system will validate the voter ID with the API

### 2. Verify OTP
1. After registration, an OTP modal will appear
2. Check the server console for the OTP (displayed in development mode)
3. Enter the 6-digit OTP in the form
4. Click "Verify & Complete"

### 3. Success
- You'll see "Registration successful! Welcome aboard!" message
- The form will reset
- User data is logged to the console

## API Endpoints

All endpoints are available at `http://localhost:5000/api`

### Key Endpoints:
- `GET /api/health` - Check if API is running
- `POST /api/voter-id/validate` - Validate voter ID
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/stats` - Get registration statistics

See `API_README.md` for complete API documentation.

## Testing OTP in Development

When running in development mode (`npm run dev`), the API returns the OTP in the response:

```json
{
  "status": "success",
  "otp": "123456"
}
```

You can:
1. Check the browser console network tab (request/response)
2. Check the server console logs
3. Enter the displayed OTP in the modal

## Troubleshooting

### "Cannot connect to API" error
- Make sure the backend server is running (`npm run dev`)
- Check that PORT 5000 is not in use
- Verify CORS is enabled (it is by default)

### OTP not working
- Check the server console for the generated OTP
- Make sure OTP hasn't expired (5 minute timeout)
- In production, implement actual email sending

### Voter ID validation fails
- Ensure format is XXX-XX-XXXX (three-two-four digits)
- Check if voter ID is already registered
- Server simulates database verification (95% success rate in demo)

### Port already in use
```bash
# Change the port in server.js or use:
set PORT=5001 && npm run dev
```

## Features to Test

✅ **Real-time Form Validation**
- Try entering invalid email, name, SSN
- See error messages update in real-time

✅ **Password Strength Indicator**
- Watch as you type a password
- Indicators show weak/medium/strong

✅ **Responsive Design**
- Test on desktop (browser devtools) and mobile
- Form adapts to different screen sizes

✅ **OTP System**
- 60-second countdown timer
- Auto-advance between OTP digits
- Paste entire OTP at once
- Resend with cooldown timer
- Auto-clear on wrong entry

✅ **Mobile-Friendly**
- Touch-optimized inputs
- Numeric keyboard on mobile
- Proper spacing and font sizes
- Landscape mode support

✅ **Accessibility**
- Keyboard navigation
- Screen reader support
- ARIA labels
- High contrast
- Dark mode support

## File Structure

```
.
├── server.js                 # Express backend API
├── registration.html         # Frontend form
├── package.json             # Node dependencies
├── API_README.md            # API documentation
├── .env.example             # Environment variables template
└── QUICKSTART.md            # This file
```

## Database Notes

Currently using in-memory storage (data resets on server restart).

For production, implement:
- PostgreSQL or MongoDB
- Encrypted SSN storage
- Proper user schema
- Transaction support
- Regular backups

## Security Notes

⚠️ **Development Only:**
- ENCRYPTION_KEY is not production-safe
- No rate limiting
- In-memory storage
- No HTTPS

🔒 **Before Production:**
- Generate strong ENCRYPTION_KEY
- Implement rate limiting
- Use proper database with encryption
- Enable HTTPS/TLS
- Add authentication middleware
- Implement audit logging
- Add input sanitization

## Next Steps

1. **Test the registration flow** - Complete the above workflow
2. **Review API documentation** - See `API_README.md` for details
3. **Customize** - Modify form fields, validation rules, styling
4. **Integrate database** - Replace in-memory storage
5. **Add email service** - Send actual OTPs via email
6. **Deploy** - Use Heroku, AWS, or your preferred platform

## Common Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Check API health
curl http://localhost:5000/api/health

# View registration stats
curl http://localhost:5000/api/stats
```

## Support

For detailed API documentation, see `API_README.md`
For frontend features, check `registration.html` comments

---

**Ready to test?** Start the server with `npm run dev` and open `registration.html` in your browser!
