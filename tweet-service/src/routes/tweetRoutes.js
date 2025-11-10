// ========================================
// tweet-service/src/routes/tweetRoutes.js
// ========================================
const express = require('express');
const tweetController = require('../controllers/tweetController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, tweetController.createTweet);
router.get('/:id', tweetController.getTweet);
router.put('/:id', authMiddleware, tweetController.updateTweet);
router.delete('/:id', authMiddleware, tweetController.deleteTweet);
router.get('/user/:userId', tweetController.getUserTweets);

module.exports = router;