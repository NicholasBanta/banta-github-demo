const crypto = require('crypto');

const DEFAULT_KEY = 'change-this-key-in-production';

function getKeyFromEnv(envKey) {
    const key = envKey || process.env.ENCRYPTION_KEY || DEFAULT_KEY;
    // Ensure a 32-byte key (AES-256) by hashing the provided secret
    return crypto.createHash('sha256').update(key).digest();
}

function encrypt(text, envKey) {
    if (!text && text !== '') return null;
    const key = getKeyFromEnv(envKey);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
    // Store iv + encrypted (hex)
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(encryptedText, envKey) {
    if (!encryptedText) return null;
    try {
        const key = getKeyFromEnv(envKey);
        const parts = String(encryptedText).split(':');
        if (parts.length !== 2) return null;
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = Buffer.from(parts[1], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        return null;
    }
}

function maskSSN(ssn) {
    if (!ssn) return null;
    const clean = String(ssn).replace(/\D/g, '');
    if (clean.length < 4) return 'XXX-XX-XXXX';
    return `XXX-XX-${clean.slice(-4)}`;
}

module.exports = {
    encrypt,
    decrypt,
    maskSSN
};
