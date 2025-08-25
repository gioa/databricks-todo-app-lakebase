# Databricks Deployment Guide

This guide explains how to deploy the unified Todo application to Databricks.

## Project Structure

```
neon-tasks-dream/
├── app.yml                    # Unified app specification
├── package.json               # All dependencies (frontend + backend)
├── server.js                  # Unified server (API + frontend)
├── src/                       # Frontend source code
├── server/
│   ├── lakebase.js           # Lakebase connection
│   └── index.js              # Original backend (not used in deployment)
└── README.md
```

## Deployment Steps

### Single App Deployment

Deploy the unified application:

```bash
databricks apps deploy
```

The app will be deployed with:
- **Name**: todo-app
- **Command**: `node server.js`
- **Port**: 3001
- **Single URL**: Both frontend and API served from one URL

### 2. Environment Configuration

The environment variables are configured in the `app.yml` file. Update the values with your actual Lakebase credentials:

**Environment Variables (in app.yml):**
- `DATABRICKS_HOST` - Your Databricks workspace URL
- `DATABRICKS_CLIENT_ID` - Your OAuth client ID
- `DATABRICKS_CLIENT_SECRET` - Your OAuth client secret
- `PGHOST` - PostgreSQL host
- `PGPORT` - PostgreSQL port (usually 5432)
- `PGUSER` - Database username
- `PGDATABASE` - Database name
- `PGSSLMODE` - SSL mode (usually 'require')
- `PGAPPNAME` - Application name

### 3. Build Process

The deployment will automatically:
1. Build the React frontend (`npm run build`)
2. Start the unified server (`node server.js`)
3. Serve both frontend and API from the same URL

## Troubleshooting

### Common Issues

1. **"No command to run" Error**
   - Ensure `app.yml` files exist and are properly formatted
   - Check that `package.json` has the correct scripts

2. **"Error loading app spec" Error**
   - Verify YAML syntax in `app.yml` files
   - Ensure all required fields are present

3. **Port Conflicts**
   - Backend uses port 3001
   - Frontend uses port 5174
   - Ensure these ports are available in your Databricks workspace

### Verification

After deployment, verify both services are running:

```bash
# Check backend health
curl https://your-backend-url/api/health

# Check frontend
curl https://your-frontend-url
```

## Notes

- The backend automatically connects to your existing `public.todos` table
- OAuth tokens are automatically refreshed every 15 minutes
- Both services use hot reload for development
