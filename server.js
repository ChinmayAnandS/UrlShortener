const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./urls.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create table
db.run(`CREATE TABLE IF NOT EXISTS urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_code TEXT UNIQUE,
  original_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Generate short code using base62
function generateShortCode(id) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  let num = id;
  do {
    code = chars[num % 62] + code;
    num = Math.floor(num / 62);
  } while (num > 0);
  return code;
}

// API to shorten URL
app.post('/api/shorten', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Insert into DB and get ID
  db.run('INSERT INTO urls (original_url) VALUES (?)', [url], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    const shortCode = generateShortCode(this.lastID);
    // Update the short_code
    db.run('UPDATE urls SET short_code = ? WHERE id = ?', [shortCode, this.lastID], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
      res.json({ short_url: shortUrl });
    });
  });
});

// Redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  db.get('SELECT original_url FROM urls WHERE short_code = ?', [shortCode], (err, row) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    if (row) {
      res.redirect(row.original_url);
    } else {
      res.status(404).send('URL not found');
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
