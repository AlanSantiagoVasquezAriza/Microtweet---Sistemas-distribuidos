// ========================================
// user-service/src/routes/userRoutes.js
// ========================================
const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', userController.getUser);
router.put('/:id', authMiddleware, userController.updateUser);
router.post('/:id/follow', authMiddleware, userController.followUser);
router.delete('/:id/follow', authMiddleware, userController.unfollowUser);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);

module.exports = router;