const sqlite3 = require('sqlite3').verbose();

// Create in-memory test database
let testDb;

function setupTestDatabase() {
  return new Promise((resolve, reject) => {
    testDb = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        reject(err);
      } else {
        // Initialize test database schema
        testDb.exec(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
          else resolve(testDb);
        });
      }
    });
  });
}

function getTestDatabase() {
  return testDb;
}

function closeTestDatabase() {
  return new Promise((resolve, reject) => {
    if (testDb) {
      testDb.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}

function clearTestDatabase() {
  return new Promise((resolve, reject) => {
    if (testDb) {
      testDb.run('DELETE FROM users', (err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  setupTestDatabase,
  getTestDatabase,
  closeTestDatabase,
  clearTestDatabase,
};
