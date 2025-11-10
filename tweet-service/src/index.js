// ========================================
// tweet-service/src/index.js
// ========================================
const express = require('express');
const cors = require('cors');
const redis = require('redis');
const Tweet = require('./models/Tweet');
const tweetRoutes = require('./routes/tweetRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('✓ Redis connected'));

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'tweet-service' });
});

app.use('/api/tweets', tweetRoutes);

app.use((err, req, res, next) => {
  console.error('Tweet Service error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  try {
    await Tweet.sequelize.authenticate();
    console.log('✓ Database connection established');
    await Tweet.sequelize.sync({ alter: false });
    await redisClient.connect();
    app.listen(PORT, () => {
      console.log(`✓ Tweet Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('✗ Unable to start Tweet Service:', error);
    process.exit(1);
  }
};

startServer();
