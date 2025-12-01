const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const https = require('https');
const helmet = require('helmet');

require('dotenv').config();

const encryption = require('./lib/encryption');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Security headers
app.use(helmet());

// HSTS (HTTP Strict Transport Security) - only when HTTPS is enabled
if (process.env.HTTPS === 'true' || process.env.HTTPS === '1') {
    app.use((req, res, next) => {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        next();
    });
}

// Strict Content Security Policy - adjust if your frontend loads external resources
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:; font-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self';");
    next();
});

// In-memory storage (use database in production)
const registrations = new Map();
const voterId = new Map();
const otpStorage = new Map();

// Validation functions
function isValidSSN(ssn) {
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnRegex.test(ssn)) return false;

    const parts = ssn.split('-');
    const area = parseInt(parts[0]);
    const group = parseInt(parts[1]);
    const serial = parseInt(parts[2]);

    // Invalid SSN patterns
    if (area === 0 || area === 666 || area >= 900) return false;
    if (group === 0) return false;
    if (serial === 0) return false;

    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidName(name) {
    return /^[a-zA-Z\s'-]{3,}$/.test(name);
}

function isValidCountry(country) {
    const validCountries = ['usa', 'canada', 'uk', 'australia', 'india', 'germany', 'france', 'japan', 'other'];
    return validCountries.includes(country.toLowerCase());
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Routes

/**
 * @route GET /api/health
 * @description Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * @route POST /api/voter-id/validate
 * @description Validate voter ID (SSN)
 * @param {string} voterId - The voter ID in XXX-XX-XXXX format
 */
app.post('/api/voter-id/validate', (req, res) => {
    try {
        const { voterId } = req.body;

        if (!voterId) {
            return res.status(400).json({
                status: 'error',
                message: 'Voter ID is required'
            });
        }

        if (!isValidSSN(voterId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid voter ID format. Expected XXX-XX-XXXX'
            });
        }

        const cleanSSN = voterId.replace(/\D/g, '');

        // Check if voter ID already registered
        if (voterId.has(cleanSSN)) {
            return res.status(409).json({
                status: 'error',
                message: 'This voter ID is already registered'
            });
        }

        // Simulate database check
        const isValid = Math.random() > 0.05; // 95% valid for demo

        if (!isValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Voter ID could not be verified. Please try again.'
            });
        }

        res.json({
            status: 'success',
            message: 'Voter ID is valid',
            masked: encryption.maskSSN(voterId),
            valid: true
        });
    } catch (error) {
        console.error('Voter ID validation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during validation'
        });
    }
});

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @body {string} fullName
 * @body {string} email
 * @body {string} phone
 * @body {string} country
 * @body {string} password
 * @body {string} voterId
 * @body {boolean} newsletter
 */
app.post('/api/auth/register', (req, res) => {
    try {
        const { fullName, email, phone, country, password, voterId, newsletter } = req.body;

        // Validation
        const errors = [];

        if (!fullName || !isValidName(fullName)) {
            errors.push('Invalid full name');
        }

        if (!email || !isValidEmail(email)) {
            errors.push('Invalid email address');
        }

        if (!country || !isValidCountry(country)) {
            errors.push('Invalid country selection');
        }

        if (!password || password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }

        if (!voterId || !isValidSSN(voterId)) {
            errors.push('Invalid voter ID format');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors
            });
        }

        const cleanSSN = voterId.replace(/\D/g, '');

        // Check if email already exists
        if (registrations.has(email)) {
            return res.status(409).json({
                status: 'error',
                message: 'Email is already registered'
            });
        }

        // Check if voter ID already exists
        if (voterId.has(cleanSSN)) {
            return res.status(409).json({
                status: 'error',
                message: 'Voter ID is already registered'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Create temporary registration
        const registrationId = crypto.randomBytes(16).toString('hex');
        const tempRegistration = {
            registrationId,
            fullName,
            email,
            phone: phone || null,
            country,
            voterId: encryption.encrypt(voterId),
            voterId_masked: encryption.maskSSN(voterId),
            password: crypto.createHash('sha256').update(password).digest('hex'), // Hash password
            newsletter: newsletter || false,
            verified: false,
            createdAt: new Date().toISOString(),
            otp,
            otpExpiry
        };

        // Store temporary registration
        registrations.set(email, tempRegistration);
        voterId.set(cleanSSN, registrationId);
        otpStorage.set(email, { otp, expiry: otpExpiry });

        res.status(201).json({
            status: 'success',
            message: 'Registration initiated. OTP sent to email.',
            registrationId,
            email: email,
            voterId_masked: encryption.maskSSN(voterId),
            otpExpiry: otpExpiry,
            // In production, OTP would be sent via email
            // For demo, we'll send it
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during registration'
        });
    }
});

/**
 * @route POST /api/auth/verify-otp
 * @description Verify OTP for registration
 * @body {string} email
 * @body {string} otp
 */
app.post('/api/auth/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and OTP are required'
            });
        }

        const registration = registrations.get(email);

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found. Please complete registration first.'
            });
        }

        // Check OTP expiry
        if (Date.now() > registration.otpExpiry) {
            registrations.delete(email);
            return res.status(400).json({
                status: 'error',
                message: 'OTP has expired. Please register again.'
            });
        }

        // Verify OTP
        if (registration.otp !== otp) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid OTP'
            });
        }

        // Mark as verified
        registration.verified = true;
        registration.verifiedAt = new Date().toISOString();
        registration.otp = null; // Clear OTP
        registration.otpExpiry = null;

        // Generate session token
        const token = crypto.randomBytes(32).toString('hex');
        registration.token = token;
        registration.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

        res.json({
            status: 'success',
            message: 'Email verified successfully',
            email: registration.email,
            voterId_masked: registration.voterId_masked,
            token,
            user: {
                fullName: registration.fullName,
                email: registration.email,
                country: registration.country,
                newsletter: registration.newsletter
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during verification'
        });
    }
});

/**
 * @route POST /api/auth/resend-otp
 * @description Resend OTP to email
 * @body {string} email
 */
app.post('/api/auth/resend-otp', (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is required'
            });
        }

        const registration = registrations.get(email);

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        if (registration.verified) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is already verified'
            });
        }

        // Generate new OTP
        const newOtp = generateOTP();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

        registration.otp = newOtp;
        registration.otpExpiry = otpExpiry;

        res.json({
            status: 'success',
            message: 'New OTP sent to email',
            email,
            // In production, OTP would be sent via email
            otp: process.env.NODE_ENV === 'development' ? newOtp : undefined
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during resend'
        });
    }
});

/**
 * @route GET /api/auth/user/:email
 * @description Get user registration status
 */
app.get('/api/auth/user/:email', (req, res) => {
    try {
        const { email } = req.params;
        const registration = registrations.get(email);

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            user: {
                email: registration.email,
                fullName: registration.fullName,
                country: registration.country,
                verified: registration.verified,
                voterId_masked: registration.voterId_masked,
                createdAt: registration.createdAt,
                verifiedAt: registration.verifiedAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    }
});

/**
 * @route POST /api/voter-id/verify
 * @description Verify voter ID against national database (simulated)
 * @body {string} voterId
 * @body {string} fullName
 */
app.post('/api/voter-id/verify', (req, res) => {
    try {
        const { voterId, fullName } = req.body;

        if (!voterId || !fullName) {
            return res.status(400).json({
                status: 'error',
                message: 'Voter ID and full name are required'
            });
        }

        if (!isValidSSN(voterId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid voter ID format'
            });
        }

        // Simulate database verification
        const isVerified = Math.random() > 0.05; // 95% success rate for demo

        if (!isVerified) {
            return res.status(400).json({
                status: 'error',
                message: 'Voter ID could not be verified against national records'
            });
        }

        res.json({
            status: 'success',
            message: 'Voter ID verified successfully',
            verified: true,
            voterId_masked: encryption.maskSSN(voterId)
        });
    } catch (error) {
        console.error('Voter ID verification error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during verification'
        });
    }
});

/**
 * @route GET /api/stats
 * @description Get registration statistics
 */
app.get('/api/stats', (req, res) => {
    try {
        const totalRegistrations = registrations.size;
        const verifiedRegistrations = Array.from(registrations.values()).filter(r => r.verified).length;
        const pendingVerifications = totalRegistrations - verifiedRegistrations;

        res.json({
            status: 'success',
            stats: {
                totalRegistrations,
                verifiedRegistrations,
                pendingVerifications,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found'
    });
});

// Start server (HTTP or HTTPS depending on env)
function logServer(protocol, port) {
    console.log(`
╔════════════════════════════════════════╗
║   Voter Registration API Server        ║
║   Running on ${protocol}://localhost:${port}     ║
╚════════════════════════════════════════╝
    `);
    console.log('Available endpoints:');
    console.log('  GET  /api/health');
    console.log('  POST /api/voter-id/validate');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/auth/verify-otp');
    console.log('  POST /api/auth/resend-otp');
    console.log('  GET  /api/auth/user/:email');
    console.log('  POST /api/voter-id/verify');
    console.log('  GET  /api/stats');
}

const useHttps = (process.env.HTTPS === 'true' || process.env.HTTPS === '1');

if (useHttps) {
    const keyPath = process.env.SSL_KEY_PATH || './certs/server.key';
    const certPath = process.env.SSL_CERT_PATH || './certs/server.crt';
    try {
        const key = fs.readFileSync(keyPath);
        const cert = fs.readFileSync(certPath);
        https.createServer({ key, cert }, app).listen(PORT, () => logServer('https', PORT));
    } catch (err) {
        console.error('Failed to start HTTPS server - falling back to HTTP.', err.message);
        app.listen(PORT, () => logServer('http', PORT));
    }
} else {
    app.listen(PORT, () => logServer('http', PORT));
}

module.exports = app;
