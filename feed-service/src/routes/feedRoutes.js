// ========================================
// feed-service/src/routes/feedRoutes.js
// ========================================
const express = require('express');
const feedController = require('../controllers/feedController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/public', feedController.getPublicFeed);
router.get('/personal/:userId', optionalAuth, feedController.getPersonalFeed);

module.exports = router;