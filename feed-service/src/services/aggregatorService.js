// ========================================
// feed-service/src/services/aggregatorService.js
// ========================================
const axios = require('axios');
const { sequelize } = require('../config/database');

const TWEET_SERVICE_URL = process.env.TWEET_SERVICE_URL || 'http://localhost:3003';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const CACHE_TTL = 300; // 5 minutes

// Get public feed with caching
const getPublicFeed = async (redisClient, page = 1, limit = 20) => {
  const cacheKey = `feed:public:${page}:${limit}`;

  try {
    // Try to get from cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Returning cached public feed');
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }

  // Get tweets from database
  const offset = (page - 1) * limit;
  const [tweets] = await sequelize.query(`
    SELECT t.*, u.username, u.avatar_url
    FROM tweets t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
    LIMIT :limit OFFSET :offset
  `, {
    replacements: { limit, offset }
  });

  const [countResult] = await sequelize.query('SELECT COUNT(*) as count FROM tweets');
  const total = parseInt(countResult[0].count);

  const result = {
    tweets,
    total,
    page,
    pages: Math.ceil(total / limit)
  };

  // Store in cache
  try {
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
  } catch (error) {
    console.error('Cache write error:', error);
  }

  return result;
};

// Get personal feed with caching
const getPersonalFeed = async (redisClient, userId, page = 1, limit = 20) => {
  const cacheKey = `feed:personal:${userId}:${page}:${limit}`;

  try {
    // Try to get from cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Returning cached personal feed');
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }

  // Get user's following list
  const offset = (page - 1) * limit;
  const [followingIds] = await sequelize.query(`
    SELECT following_id FROM follows WHERE follower_id = :userId
  `, {
    replacements: { userId }
  });

  if (followingIds.length === 0) {
    return {
      tweets: [],
      total: 0,
      page,
      pages: 0,
      message: 'Follow some users to see their tweets here'
    };
  }

  const ids = followingIds.map(f => f.following_id);

  // Get tweets from followed users
  const [tweets] = await sequelize.query(`
    SELECT t.*, u.username, u.avatar_url
    FROM tweets t
    JOIN users u ON t.user_id = u.id
    WHERE t.user_id IN (:ids)
    ORDER BY t.created_at DESC
    LIMIT :limit OFFSET :offset
  `, {
    replacements: { ids, limit, offset }
  });

  const [countResult] = await sequelize.query(`
    SELECT COUNT(*) as count FROM tweets WHERE user_id IN (:ids)
  `, {
    replacements: { ids }
  });
  
  const total = parseInt(countResult[0].count);

  const result = {
    tweets,
    total,
    page,
    pages: Math.ceil(total / limit)
  };

  // Store in cache
  try {
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
  } catch (error) {
    console.error('Cache write error:', error);
  }

  return result;
};

module.exports = {
  getPublicFeed,
  getPersonalFeed
};