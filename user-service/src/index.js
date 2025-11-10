// ========================================
// user-service/src/index.js
// ========================================
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'user-service' });
});

app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error('User Service error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    await sequelize.sync({ alter: false });
    app.listen(PORT, () => {
      console.log(`✓ User Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('✗ Unable to start User Service:', error);
    process.exit(1);
  }
};

startServer();
