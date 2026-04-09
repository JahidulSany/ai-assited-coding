# REST API with JWT Authentication and SQLite

A full-featured REST API built with Express.js, featuring JWT authentication and SQLite database for user management.

## Features

- **User Registration**: Create new user accounts with hashed passwords
- **User Login**: Authenticate users and receive JWT tokens
- **JWT Authentication**: Protect routes with token-based authentication
- **User Management**: CRUD operations for user profiles
- **SQLite Database**: Persistent local data storage
- **Error Handling**: Comprehensive error messages and validation
- **Token Expiration**: 24-hour token expiration for security

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file in the root directory:

```
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important**: Change the `JWT_SECRET` in production to a strong, random string.

## Running the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check

- **GET** `/health` - Check if API is running

### Authentication Endpoints (No auth required)

#### Register

- **POST** `/api/auth/register`
- Body: `{ "username": "john", "email": "john@example.com", "password": "secure123" }`
- Returns: User object and JWT token

#### Login

- **POST** `/api/auth/login`
- Body: `{ "username": "john", "password": "secure123" }`
- Returns: User object and JWT token

### User Endpoints (JWT required)

All user endpoints require an `Authorization` header with the JWT token:

```
Authorization: Bearer <your_jwt_token>
```

#### Get All Users

- **GET** `/api/users`
- Returns: List of all users

#### Get User Profile

- **GET** `/api/users/profile`
- Returns: Currently authenticated user's profile

#### Get User by ID

- **GET** `/api/users/:id`
- Returns: Specific user by ID

#### Update User Profile

- **PUT** `/api/users/:id`
- Body: `{ "username": "newname", "email": "newemail@example.com" }`
- Returns: Updated user object
- Note: Users can only update their own profile

#### Delete User Account

- **DELETE** `/api/users/:id`
- Returns: Success message
- Note: Users can only delete their own account

## Example Usage with cURL

### Register a user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"secure123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"secure123"}'
```

### Access protected endpoint (replace TOKEN with actual JWT)

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TOKEN"
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Security Features

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire after 24 hours
- Users can only update/delete their own accounts
- Protected routes require valid JWT tokens
- Input validation on all endpoints

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate username/email
- `500 Internal Server Error` - Server error

## File Structure

```
.
├── server.js              # Main Express application
├── db.js                  # Database initialization
├── .env                   # Environment variables
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── routes/
│   ├── auth.js            # Authentication routes
│   └── users.js           # User management routes
└── users.db              # SQLite database (generated)
```

## Development Notes

- The SQLite database file (`users.db`) is created automatically on first run
- Tokens are valid for 24 hours
- Password requirements: currently accepts any non-empty string (add validation as needed)
- CORS is not enabled by default (add if needed for frontend integration)

## Future Enhancements

- Add password reset functionality
- Implement refresh tokens
- Add email verification
- Implement role-based access control (RBAC)
- Add rate limiting
- Add CORS support
- Add comprehensive logging
- Add unit tests
