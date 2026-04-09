const express = require('express');

function createTestApp(testDb) {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'API is running' });
  });

  // Auth routes
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res
          .status(400)
          .json({ error: 'Username, email, and password are required' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      testDb.run(
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

  app.post('/api/auth/login', (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ error: 'Username and password are required' });
      }

      testDb.get(
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

          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            return res
              .status(401)
              .json({ error: 'Invalid username or password' });
          }

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

  // User routes with auth middleware
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
      }

      req.user = user;
      next();
    });
  };

  app.get('/api/users', authenticateToken, (req, res) => {
    testDb.all('SELECT id, username, email, created_at FROM users', (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      res.json({ users });
    });
  });

  app.get('/api/users/profile', authenticateToken, (req, res) => {
    testDb.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.id],
      (err, user) => {
        if (err) {
          return res
            .status(500)
            .json({ error: 'Database error: ' + err.message });
        }
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
      },
    );
  });

  app.get('/api/users/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    testDb.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id],
      (err, user) => {
        if (err) {
          return res
            .status(500)
            .json({ error: 'Database error: ' + err.message });
        }
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
      },
    );
  });

  app.put('/api/users/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    if (req.user.id != id) {
      return res
        .status(403)
        .json({ error: 'Unauthorized: Cannot update other users' });
    }

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    testDb.run(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, id],
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
        res.json({
          message: 'User updated successfully',
          user: { id, username, email },
        });
      },
    );
  });

  app.delete('/api/users/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    if (req.user.id != id) {
      return res
        .status(403)
        .json({ error: 'Unauthorized: Cannot delete other users' });
    }

    testDb.run('DELETE FROM users WHERE id = ?', [id], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      res.json({ message: 'User deleted successfully' });
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createTestApp };
