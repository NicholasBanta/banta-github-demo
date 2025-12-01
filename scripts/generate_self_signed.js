const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'certs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const attrs = [{ name: 'commonName', value: 'localhost' }];
const opts = {
  keySize: 2048,
  days: 365,
  algorithm: 'sha256'
};

console.log('Generating self-signed certificate for localhost...');
const pems = selfsigned.generate(attrs, opts);

fs.writeFileSync(path.join(outDir, 'server.key'), pems.private, { mode: 0o600 });
fs.writeFileSync(path.join(outDir, 'server.crt'), pems.cert, { mode: 0o644 });

console.log('Wrote:');
console.log('  ', path.join(outDir, 'server.key'));
console.log('  ', path.join(outDir, 'server.crt'));
console.log('Done.');
