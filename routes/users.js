const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all users (protected route)
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT id, username, email, created_at FROM users', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json({ users });
  });
});

// Get current user profile (protected route)
router.get('/profile', authenticateToken, (req, res) => {
  db.get(
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

// Get user by ID (protected route)
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(
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

// Update user profile (protected route)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  // Users can only update their own profile
  if (req.user.id != id) {
    return res
      .status(403)
      .json({ error: 'Unauthorized: Cannot update other users' });
  }

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  db.run(
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

// Delete user account (protected route)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Users can only delete their own account
  if (req.user.id != id) {
    return res
      .status(403)
      .json({ error: 'Unauthorized: Cannot delete other users' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;
