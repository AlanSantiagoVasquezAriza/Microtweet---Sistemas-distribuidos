// ========================================
// user-service/src/controllers/userController.js
// ========================================
const { User, Follow } = require('../models');
const { Op } = require('sequelize');

const userController = {
  // Get user profile
  getUser: async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        attributes: ['id', 'username', 'email', 'bio', 'avatar_url', 'created_at']
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get follower/following counts
      const followerCount = await Follow.count({ where: { following_id: id } });
      const followingCount = await Follow.count({ where: { follower_id: id } });

      res.json({
        ...user.toJSON(),
        followerCount,
        followingCount
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Error fetching user' });
    }
  },

  // Update user profile
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { bio, avatar_url } = req.body;

      // Check if user is updating their own profile
      if (req.userId !== parseInt(id)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({
        bio: bio !== undefined ? bio : user.bio,
        avatar_url: avatar_url !== undefined ? avatar_url : user.avatar_url,
        updated_at: new Date()
      });

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar_url: user.avatar_url
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Error updating user' });
    }
  },

  // Follow a user
  followUser: async (req, res) => {
    try {
      const { id } = req.params;
      const followerId = req.userId;

      if (followerId === parseInt(id)) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      // Check if target user exists
      const targetUser = await User.findByPk(id);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if already following
      const existingFollow = await Follow.findOne({
        where: { follower_id: followerId, following_id: id }
      });

      if (existingFollow) {
        return res.status(409).json({ error: 'Already following this user' });
      }

      await Follow.create({
        follower_id: followerId,
        following_id: id
      });

      res.status(201).json({ message: 'User followed successfully' });
    } catch (error) {
      console.error('Follow user error:', error);
      res.status(500).json({ error: 'Error following user' });
    }
  },

  // Unfollow a user
  unfollowUser: async (req, res) => {
    try {
      const { id } = req.params;
      const followerId = req.userId;

      const follow = await Follow.findOne({
        where: { follower_id: followerId, following_id: id }
      });

      if (!follow) {
        return res.status(404).json({ error: 'Not following this user' });
      }

      await follow.destroy();
      res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
      console.error('Unfollow user error:', error);
      res.status(500).json({ error: 'Error unfollowing user' });
    }
  },

  // Get followers
  getFollowers: async (req, res) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const follows = await Follow.findAndCountAll({
        where: { following_id: id },
        include: [{
          model: User,
          as: 'follower',
          attributes: ['id', 'username', 'bio', 'avatar_url']
        }],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        followers: follows.rows.map(f => f.follower),
        total: follows.count,
        page,
        pages: Math.ceil(follows.count / limit)
      });
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({ error: 'Error fetching followers' });
    }
  },

  // Get following
  getFollowing: async (req, res) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const follows = await Follow.findAndCountAll({
        where: { follower_id: id },
        include: [{
          model: User,
          as: 'following',
          attributes: ['id', 'username', 'bio', 'avatar_url']
        }],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        following: follows.rows.map(f => f.following),
        total: follows.count,
        page,
        pages: Math.ceil(follows.count / limit)
      });
    } catch (error) {
      console.error('Get following error:', error);
      res.status(500).json({ error: 'Error fetching following' });
    }
  }
};

// Define associations
const { User: UserModel, Follow: FollowModel } = require('../models');
FollowModel.belongsTo(UserModel, { foreignKey: 'follower_id', as: 'follower' });
FollowModel.belongsTo(UserModel, { foreignKey: 'following_id', as: 'following' });

module.exports = userController;
