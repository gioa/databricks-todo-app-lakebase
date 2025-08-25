# Todo API Server with Lakebase Integration

This is the backend API server for the Todo application, integrated with Lakebase (Databricks) for data persistence.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your Lakebase credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual Lakebase/Databricks credentials:

```env
# Lakebase/Databricks Configuration
DATABRICKS_HOST=your-databricks-host
DATABRICKS_CLIENT_ID=your-client-id
DATABRICKS_CLIENT_SECRET=your-client-secret

# PostgreSQL Configuration
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=your-postgres-user
PGDATABASE=your-database-name
PGSSLMODE=require
PGAPPNAME=todo-app

# Server Configuration
PORT=3001
```

### 3. Database Setup

The server expects an existing `todos` table with the following structure:

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The server will test the connection and verify the table exists when it starts.

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on port 3001 (or the port specified in your .env file).

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PATCH /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `GET /api/health` - Health check

## Lakebase Integration

The server uses OAuth2 authentication with Databricks to connect to the PostgreSQL database. The OAuth token is automatically refreshed every 15 minutes.

## Error Handling

The server includes comprehensive error handling for:
- Database connection issues
- OAuth token refresh failures
- Invalid requests
- Database query errors

All errors are logged to the console and appropriate HTTP status codes are returned to the client.
