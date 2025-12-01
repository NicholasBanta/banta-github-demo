# HTTPS & Security Setup Guide

## Quick Start: HTTPS on Windows

### 1. Generate Self-Signed Certificate (One-time)
```powershell
node scripts/generate_self_signed.js
```
Creates `certs/server.key` and `certs/server.crt`.

### 2. Start HTTPS Server
**Option A: Using .bat script (easiest)**
```powershell
.\start-https.bat
```

**Option B: Manual PowerShell**
```powershell
$env:HTTPS='true'
$env:SSL_KEY_PATH='certs/server.key'
$env:SSL_CERT_PATH='certs/server.crt'
node server.js
```

You should see:
```
╔════════════════════════════════════════╗
║   Voter Registration API Server        ║
║   Running on https://localhost:5000     ║
╚════════════════════════════════════════╝
```

### 3. Verify Security Headers
```powershell
node scripts/check_headers_https.js
```

Expected headers:
- `content-security-policy` — Restricts resource loading
- `strict-transport-security` — Enforces HTTPS (HSTS)
- `x-content-type-options: nosniff` — Prevents MIME type sniffing (from helmet)
- `x-frame-options: DENY` — Prevents clickjacking (from helmet)

## Trust Certificate (Optional - Eliminates Browser Warning)

### Windows: Import to OS Trust Store
```powershell
.\scripts\trust_self_signed_cert.ps1
```

This requires **Administrator** privileges. The script will:
1. Check if you're running as admin; if not, re-launch with elevated privileges.
2. Import the certificate to your Trusted Root Certification Authorities.
3. Browsers will no longer show "untrusted certificate" warnings for `https://localhost:5000`.

**Note:** After importing, you may need to restart your browser to see the change.

### Verify Certificate was Trusted
- Open `https://localhost:5000` in your browser.
- If the address bar shows a green lock (or no warning), the cert is trusted.

### Remove from Trust Store (if needed)
1. Press `Win + R`, type `certmgr.msc`, press Enter.
2. Navigate to: Certificates - Current User → Trusted Root Certification Authorities → Certificates
3. Find the certificate with CN=localhost.
4. Right-click and select Delete.
5. Restart your browser.

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `HTTPS` | `false` | Set to `true` to enable HTTPS |
| `SSL_KEY_PATH` | `./certs/server.key` | Path to private key file |
| `SSL_CERT_PATH` | `./certs/server.crt` | Path to certificate file |
| `PORT` | `5000` | Server port (HTTP or HTTPS) |
| `ENCRYPTION_KEY` | (required) | Secret for AES-256 SSN encryption |
| `NODE_ENV` | `development` | Set to `production` for production deployments |

## Security Features

✅ **Content Security Policy (CSP)**
- Restricts script/style/image loading to `'self'`.
- Prevents inline scripts and external CDN loading (unless configured).

✅ **HTTP Strict Transport Security (HSTS)**
- When HTTPS is enabled, forces all future requests to HTTPS for one year.
- Set to: `max-age=31536000; includeSubDomains; preload`.

✅ **Helmet.js Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

✅ **AES-256-CBC Encryption**
- Voter ID (SSN) encrypted at rest.
- Random IV per encryption (safe cryptography).

## Production Deployment

1. **Obtain Real Certificates**
   - Use a provider like Let's Encrypt, Digicert, or AWS Certificate Manager.
   - Place key in `SSL_KEY_PATH`, cert in `SSL_CERT_PATH`.

2. **Set Environment Variables**
   ```env
   HTTPS=true
   SSL_KEY_PATH=/etc/ssl/private/server.key
   SSL_CERT_PATH=/etc/ssl/certs/server.crt
   ENCRYPTION_KEY=<your-strong-secret>
   NODE_ENV=production
   ```

3. **Run Behind Reverse Proxy (Recommended)**
   - Use nginx or Apache to terminate TLS.
   - Forward requests to Node on localhost.
   - Offloads SSL/TLS processing.

4. **Enable CSP Reporting**
   - Add CSP violation reporting endpoint (future enhancement).

## Troubleshooting

**Q: Server says HTTPS but browser shows warning**
- A: Certificate is self-signed. Either trust it (see above) or use a real certificate.

**Q: "Cannot find cert files" error**
- A: Run `node scripts/generate_self_signed.js` first.

**Q: Port 5000 already in use**
- A: Set `PORT=3000` (or another free port) before running server.

**Q: CSP blocks my resources**
- A: Update CSP header in `server.js` to allow the domain/source.

## Files Reference

| File | Purpose |
|------|---------|
| `certs/server.key` | Private key (generated) |
| `certs/server.crt` | Self-signed certificate (generated) |
| `scripts/generate_self_signed.js` | Generator script |
| `scripts/check_headers_https.js` | HTTPS header verification |
| `scripts/trust_self_signed_cert.ps1` | Windows certificate trust (PowerShell) |
| `start-https.bat` | Convenience .bat launcher (Windows) |

---

**Ready to test?** Run `.\start-https.bat` and open `https://localhost:5000` in your browser.
