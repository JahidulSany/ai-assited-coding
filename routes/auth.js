const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Username, email, and password are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res
              .status(409)
              .json({ error: 'Username or email already exists' });
          }
          return res
            .status(500)
            .json({ error: 'Database error: ' + err.message });
        }

        // Create JWT token
        const token = jwt.sign(
          { id: this.lastID, username, email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' },
        );

        res.status(201).json({
          message: 'User registered successfully',
          user: { id: this.lastID, username, email },
          token,
        });
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username and password are required' });
    }

    // Find user in database
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, user) => {
        if (err) {
          return res
            .status(500)
            .json({ error: 'Database error: ' + err.message });
        }

        if (!user) {
          return res
            .status(401)
            .json({ error: 'Invalid username or password' });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res
            .status(401)
            .json({ error: 'Invalid username or password' });
        }

        // Create JWT token
        const token = jwt.sign(
          { id: user.id, username: user.username, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' },
        );

        res.json({
          message: 'Login successful',
          user: { id: user.id, username: user.username, email: user.email },
          token,
        });
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
