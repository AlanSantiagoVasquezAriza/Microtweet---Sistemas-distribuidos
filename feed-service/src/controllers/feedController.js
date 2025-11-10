// ========================================
// feed-service/src/controllers/feedController.js
// ========================================
const { getPublicFeed, getPersonalFeed } = require('../services/aggregatorService');

const feedController = {
  // Get public feed (all tweets)
  getPublicFeed: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const feed = await getPublicFeed(req.redisClient, page, limit);

      res.json(feed);
    } catch (error) {
      console.error('Get public feed error:', error);
      res.status(500).json({ error: 'Error fetching public feed' });
    }
  },

  // Get personal feed (tweets from followed users)
  getPersonalFeed: async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      // Verify user is requesting their own feed
      if (req.userId && req.userId !== parseInt(userId)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const feed = await getPersonalFeed(req.redisClient, userId, page, limit);

      res.json(feed);
    } catch (error) {
      console.error('Get personal feed error:', error);
      res.status(500).json({ error: 'Error fetching personal feed' });
    }
  }
};

module.exports = feedController;