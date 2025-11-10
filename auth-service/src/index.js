const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models/User');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/api/auth', authRoutes);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ DB connected');
    await sequelize.sync({ alter: false });
    app.listen(PORT, () => console.log(`✓ Auth Service: ${PORT}`));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

start();
