// ========================================
// feed-service/src/config/database.js
// ========================================
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'microtweet_db',
  username: process.env.DB_USER || 'microtweet',
  password: process.env.DB_PASSWORD || 'microtweet123',
  dialect: 'postgres',
  logging: false
});

module.exports = { sequelize };