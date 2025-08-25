# Todo App with Lakebase Integration - Complete Example

A full-stack Todo application demonstrating how to integrate React frontend with Lakebase (Databricks) for data persistence, deployed as a unified application on Databricks.

## 🎯 What This Example Shows

This project demonstrates:
- **Unified deployment** - Single app serving both frontend and API
- **Lakebase integration** - PostgreSQL database with OAuth2 authentication
- **Modern React stack** - TypeScript, Vite, shadcn/ui, Tailwind CSS
- **Express.js backend** - RESTful API with automatic token management
- **Databricks deployment** - File-sync based deployment without app.yml

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Databricks App                           │
├─────────────────────────────────────────────────────────────┤
│  React Frontend (dist/) │  Express API (/api/*)            │
│  - Todo UI              │  - GET /api/todos                │
│  - Modern Design        │  - POST /api/todos               │
│  - Real-time Updates    │  - PATCH /api/todos/:id          │
│                         │  - DELETE /api/todos/:id         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Lakebase      │
                    │  PostgreSQL     │
                    │  (Databricks)   │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Databricks workspace with Lakebase access
- PostgreSQL database (via Lakebase)

### Local Development

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd todo-app-lakebase

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp server/env.example .env
# Edit .env with your Lakebase credentials

# 4. Build the frontend
npm run build

# 5. Start the unified server
npm start

# 6. Open http://localhost:3001
```

### Databricks Setup

1. **Fork this repository** to your own Git account
2. **Create a Git folder** in your Databricks workspace pointing to your forked repository
3. **Create a custom app** in Databricks Apps and deploy from the Git folder
   - **Important:** During app creation, add your database as a resource
   - This will automatically configure the necessary environment variables

### Environment Variables

The required environment variables will be automatically configured when you add the database as a resource during app creation. You can view and manage these variables in:

**App Detail Page → Environment Tab**

The following variables should be available:
- `DATABRICKS_HOST`
- `DATABRICKS_CLIENT_ID`
- `DATABRICKS_CLIENT_SECRET`
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGDATABASE`
- `PGSSLMODE`
- `PGAPPNAME`
- `PORT`

## 🗄️ Database Setup

The application expects a `public.todos` table with this structure:

```sql
CREATE TABLE public.todos (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Grant Permissions to Service Principal

After creating the table, you need to grant permissions to your app's service principal. Replace the service principal ID with your actual one:

```sql
-- Grant all privileges on the todos table
GRANT ALL PRIVILEGES ON TABLE public.todos TO "your-service-principal-id";
```


**Note:** The service principal ID can be found in the environment variables of your deployed app as `DATABRICKS_CLIENT_ID` or `PGUSER`.

## 🚀 Databricks Deployment

### Step 1: Prepare Your Repository

1. **Fork or clone this repository** to your own Git account
2. **Update environment variables** in your local `.env` file with your Lakebase credentials
3. **Build the application** locally to ensure everything works:

```bash
npm install
npm run build
```

### Step 2: Deploy to Databricks

1. **Create a Git folder** in your Databricks workspace that points to your repository
2. **Create a custom app** in Databricks Apps
3. **Deploy from the Git folder** - Databricks will auto-detect your app configuration

```bash
# Alternative: Deploy using Databricks CLI
databricks apps deploy
```

### Step 3: Verify Environment Variables

The environment variables should be automatically configured when you added the database as a resource. You can verify and manage them in:

**App Detail Page → Environment Tab**

**Important:** The `PGUSER` should match the service principal ID you granted permissions to in the database setup.


### Project Structure

```
todo-app-lakebase/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── services/          # API service layer
│   └── pages/             # Page components
├── server/                # Backend utilities
│   └── lakebase.js        # Lakebase connection
├── dist/                  # Built React app (generated)
├── server.js              # Unified server (frontend + API)
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🚨 Troubleshooting

### Common Issues

1. **"Database not connected"**
   - Check environment variables in `.env`
   - Verify Lakebase credentials
   - Ensure database permissions

2. **"Port already in use"**
   - Change `PORT` in `.env` or `app.yml`
   - Kill existing processes on the port

3. **"OAuth token failed"**
   - Verify `DATABRICKS_HOST`, `CLIENT_ID`, `CLIENT_SECRET`
   - Check network connectivity to Databricks

4. **"App not available" on Databricks**
   - Ensure `npm run build` was executed
   - Check that `dist/` folder exists
   - Verify environment variables in Databricks UI
   - Confirm Git folder is properly connected to your repository
   - Check that the custom app is deployed from the correct Git folder

### Debug Mode

For detailed logging, set `NODE_ENV=development` in your environment variables.

## 🤝 Contributing

This is an example project demonstrating Lakebase + Databricks integration. Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally and on Databricks
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Resources

- [Databricks Apps Documentation](https://docs.databricks.com/apps/index.html)
- [Lakebase Documentation](https://docs.databricks.com/lakebase/index.html)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Built with ❤️ using React, Express, and Lakebase**
