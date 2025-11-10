const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway' });
});

app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  changeOrigin: true
}));

app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://user-service:3002',
  changeOrigin: true
}));

app.use('/api/tweets', createProxyMiddleware({
  target: process.env.TWEET_SERVICE_URL || 'http://tweet-service:3003',
  changeOrigin: true
}));

app.use('/api/feeds', createProxyMiddleware({
  target: process.env.FEED_SERVICE_URL || 'http://feed-service:3004',
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(`✓ API Gateway running on port ${PORT}`);
});
