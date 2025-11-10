// ========================================
// tweet-service/src/controllers/tweetController.js
// ========================================
const Tweet = require('../models/Tweet');
const { invalidateFeedCache } = require('../utils/cacheInvalidator');

const tweetController = {
  // Create tweet
  createTweet: async (req, res) => {
    try {
      const { content } = req.body;
      const userId = req.userId;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Tweet content is required' });
      }

      if (content.length > 280) {
        return res.status(400).json({ error: 'Tweet cannot exceed 280 characters' });
      }

      const tweet = await Tweet.create({
        user_id: userId,
        content: content.trim()
      });

      // Invalidate feed cache
      await invalidateFeedCache(req.redisClient, userId);

      res.status(201).json({
        message: 'Tweet created successfully',
        tweet: {
          id: tweet.id,
          user_id: tweet.user_id,
          content: tweet.content,
          created_at: tweet.created_at
        }
      });
    } catch (error) {
      console.error('Create tweet error:', error);
      res.status(500).json({ error: 'Error creating tweet' });
    }
  },

  // Get tweet by ID
  getTweet: async (req, res) => {
    try {
      const { id } = req.params;

      const tweet = await Tweet.findByPk(id);

      if (!tweet) {
        return res.status(404).json({ error: 'Tweet not found' });
      }

      res.json(tweet);
    } catch (error) {
      console.error('Get tweet error:', error);
      res.status(500).json({ error: 'Error fetching tweet' });
    }
  },

  // Update tweet
  updateTweet: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.userId;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Tweet content is required' });
      }

      if (content.length > 280) {
        return res.status(400).json({ error: 'Tweet cannot exceed 280 characters' });
      }

      const tweet = await Tweet.findByPk(id);

      if (!tweet) {
        return res.status(404).json({ error: 'Tweet not found' });
      }

      // Check if user is the author
      if (tweet.user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await tweet.update({
        content: content.trim(),
        updated_at: new Date()
      });

      // Invalidate feed cache
      await invalidateFeedCache(req.redisClient, userId);

      res.json({
        message: 'Tweet updated successfully',
        tweet
      });
    } catch (error) {
      console.error('Update tweet error:', error);
      res.status(500).json({ error: 'Error updating tweet' });
    }
  },

  // Delete tweet
  deleteTweet: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const tweet = await Tweet.findByPk(id);

      if (!tweet) {
        return res.status(404).json({ error: 'Tweet not found' });
      }

      // Check if user is the author
      if (tweet.user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await tweet.destroy();

      // Invalidate feed cache
      await invalidateFeedCache(req.redisClient, userId);

      res.json({ message: 'Tweet deleted successfully' });
    } catch (error) {
      console.error('Delete tweet error:', error);
      res.status(500).json({ error: 'Error deleting tweet' });
    }
  },

  // Get tweets by user
  getUserTweets: async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const tweets = await Tweet.findAndCountAll({
        where: { user_id: userId },
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        tweets: tweets.rows,
        total: tweets.count,
        page,
        pages: Math.ceil(tweets.count / limit)
      });
    } catch (error) {
      console.error('Get user tweets error:', error);
      res.status(500).json({ error: 'Error fetching tweets' });
    }
  }
};

module.exports = tweetController;