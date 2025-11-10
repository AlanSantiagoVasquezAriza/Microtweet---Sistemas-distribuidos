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

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  bio: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { tableName: 'users', timestamps: false });

module.exports = User;
module.exports.sequelize = sequelize;
