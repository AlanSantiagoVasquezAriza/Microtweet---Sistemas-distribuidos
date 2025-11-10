// ========================================
// tweet-service/src/models/Tweet.js
// ========================================
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'microtweet_db',
  username: process.env.DB_USER || 'microtweet',
  password: process.env.DB_PASSWORD || 'microtweet123',
  dialect: 'postgres',
  logging: false
});

const Tweet = sequelize.define('Tweet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.STRING(280),
    allowNull: false,
    validate: {
      len: [1, 280],
      notEmpty: true
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'tweets',
  timestamps: false,
  hooks: {
    beforeUpdate: (tweet) => {
      tweet.updated_at = new Date();
    }
  }
});

module.exports = Tweet;
module.exports.sequelize = sequelize;