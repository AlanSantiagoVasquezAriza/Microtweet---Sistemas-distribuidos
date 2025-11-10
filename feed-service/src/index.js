// ========================================
// feed-service/src/index.js
// ========================================
const express = require('express');
const cors = require('cors');
const redis = require('redis');
const { sequelize } = require('./config/database');
const feedRoutes = require('./routes/feedRoutes');

const app = express();
const PORT = process.env.PORT || 3004;

// Redis client
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

// Attach redis client to requests
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'feed-service' });
});

app.use('/api/feeds', feedRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Feed Service error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    await redisClient.connect();
    app.listen(PORT, () => {
      console.log(`✓ Feed Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('✗ Unable to start Feed Service:', error);
    process.exit(1);
  }
};

startServer();
