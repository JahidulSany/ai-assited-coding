# AI-Assisted Coding: Bootcamp Project Guidelines

## Code Style

- **Module system**: CommonJS (`require`/`module.exports`) throughout
- **Async patterns**: Prefer callbacks in database queries (matches existing `db.js` SQLite3 callback API), but use modern promise-based patterns for new HTTP middleware
- **Naming conventions**:
  - Route handlers: `handleRegister`, `handleLogin`, `handleGetUsers` (action-first)
  - Database functions: `initDB`, `queryUsers`, callback pattern with `(err, result)` signature
  - Middleware: `verifyToken`, `logRequest`

## Architecture

**Layered structure**:

```
server.js (Express app setup)
├── middleware/auth.js (JWT token verification)
├── routes/ (HTTP endpoints organized by domain)
│   ├── auth.js (/register, /login endpoints)
│   └── users.js (/users CRUD—protected routes)
└── db.js (SQLite initialization, direct SQL queries)
```

**Key pattern**: Route handlers call database callbacks directly; no ORM layer (this is intentional for learning authentication patterns).

**⚠️ Important**: `User.js` and `User.test.js` are React frontend files and should not reference Node.js backend code. They're currently mixed into the root—mark for relocation to a separate `frontend/` folder if building a monorepo.

## Build and Test

```bash
npm install      # Install dependencies
npm run dev      # Development with auto-reload (--watch)
npm start        # Production mode (no reload)
npm test         # Currently placeholder—implement as tests are added
```

**Environment setup**: Requires `.env` file with:

```env
PORT=3000
JWT_SECRET=your_secure_secret_here
NODE_ENV=development
```

## Conventions

### Authentication & Authorization

- **Token expiry**: 24 hours (hardcoded in routes/auth.js)
- **Bearer token**: Passed in `Authorization: Bearer <token>` header
- **Row-level access**: Users can only fetch/modify their own profiles (enforced in routes/users.js)
- **Password hashing**: bcryptjs with 10 salt rounds

### Database (SQLite3)

- **Callback-based**: All queries use `db.run()` / `db.all()` with `(err, result)` callbacks
- **SQL queries**: Direct SQL strings (no parameterized queries yet—add `?` placeholders and params array for injection protection on new queries)
- **Schema**: Single `users` table with UNIQUE constraints on `username` and `email`

### Error Handling

- **Validation**: Check request payload before database operations
- **Status codes**:
  - 200 (success), 201 (created)
  - 400 (bad request/validation), 401 (unauthorized), 403 (forbidden), 404 (not found)
  - 500 (server error)
- **Error format**: `{ error: "message" }` in response body

### Graceful Shutdown

- `SIGINT` handler closes database before exit—preserve this pattern when adding resources

## Common Development Tasks

**Adding a new route**:

1. Create handler in `routes/` with explicit `verifyToken` middleware for protected endpoints
2. Add database query in `db.js` if needed
3. Test with `curl` or `test-api.sh` script

**Modifying authentication**: Update `middleware/auth.js` or token generation in `routes/auth.js`

**Database changes**: Update schema in `db.js` and create migration helpers if adding tables

See [API_README.md](API_README.md) for detailed endpoint documentation and request/response examples.
