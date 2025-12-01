const https = require('https');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  agent: new https.Agent({ rejectUnauthorized: false })
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:');
  console.log(res.headers);
  res.on('data', () => {});
  res.on('end', () => process.exit(0));
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.end();
