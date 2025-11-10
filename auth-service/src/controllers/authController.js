const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  try {
    const { username, email, password, bio } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email y password son obligatorios' });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: normalizedEmail }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'El usuario o correo ya existen' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email: normalizedEmail,
      password_hash: hash,
      bio: bio || '',
    });

    return res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
      },
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: error.errors?.[0]?.message || 'Datos inválidos' });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
      },
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};
