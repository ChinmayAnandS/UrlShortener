# URL Shortener

A simple, end-to-end URL shortener service built with Node.js, Express, and SQLite.

## Features

- Shorten long URLs into compact short links
- Automatic redirection when accessing short URLs
- SQLite database for persistent storage
- Simple web interface
- RESTful API for URL shortening

## Architecture

### Components

1. **Backend (Express.js)**: Handles API requests and serves the frontend
2. **Database (SQLite)**: Stores URL mappings
3. **Frontend (HTML/CSS/JS)**: User interface for creating short URLs

### Database Schema

```sql
CREATE TABLE urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_code TEXT UNIQUE,
  original_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ChinmayAnandS/UrlShortener.git
   cd UrlShortener
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Web Interface

1. Open `http://localhost:3000` in your browser
2. Enter a long URL in the input field
3. Click "Shorten URL"
4. Copy the generated short URL

### API Usage

**Shorten a URL:**

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com/very/long/url/that/needs/shortening"}'
```

Response:
```json
{
  "short_url": "http://localhost:3000/abc123"
}
```

## How Redirection Works

When a user accesses a shortened URL (e.g., `http://localhost:3000/abc123`), the following process occurs:

1. **Request Reception**: The Express server receives the GET request for the path `/abc123`

2. **Route Matching**: The server matches the route `/:shortCode` where `shortCode = "abc123"`

3. **Database Lookup**: The server queries the SQLite database:
   ```sql
   SELECT original_url FROM urls WHERE short_code = 'abc123'
   ```

4. **Redirection Response**:
   - If the short code exists: Server responds with HTTP 302 (Temporary Redirect) to the original URL
   - If not found: Server responds with HTTP 404 and "URL not found" message

5. **Browser Redirection**: The user's browser automatically follows the redirect to the original URL

### HTTP Response Flow

```
User Browser -> Short URL (GET /abc123)
             <- 302 Redirect to Original URL
             -> Original URL
```

### Short Code Generation

Short codes are generated using Base62 encoding of the database record ID:
- Characters: `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ` (62 chars)
- Algorithm: Convert auto-incrementing ID to Base62 string
- Example: ID 1 → "1", ID 62 → "10", ID 3843 → "ZZ"

## API Endpoints

- `POST /api/shorten`: Create a short URL
  - Body: `{"url": "https://example.com"}`
  - Response: `{"short_url": "http://localhost:3000/abc123"}`

- `GET /:shortCode`: Redirect to original URL
  - Response: 302 redirect or 404 if not found

## Files Structure

```
UrlShortener/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── urls.db           # SQLite database (created automatically)
├── public/
│   └── index.html    # Frontend interface
└── README.md         # This file
```

## Technologies Used

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **SQLite3**: Database
- **HTML/CSS/JavaScript**: Frontend
