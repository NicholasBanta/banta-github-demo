const http = require('http');

http.get('http://localhost:5000/api/health', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:');
  console.log(res.headers);
  res.resume();
}).on('error', (err) => {
  console.error('Request error:', err.message);
  process.exit(1);
});
