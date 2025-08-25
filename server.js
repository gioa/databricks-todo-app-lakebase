import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from './server/lakebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory (built React app)
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize database connection
async function initializeDatabase() {
  // Check if Lakebase environment variables are set
  if (!process.env.DATABRICKS_HOST) {
    console.log('⚠️  Lakebase environment variables not set. Running in local mode without database.');
    console.log('   Set DATABRICKS_HOST, DATABRICKS_CLIENT_ID, DATABRICKS_CLIENT_SECRET to connect to Lakebase.');
    return;
  }

  try {
    const pool = await getPool();
    console.log('Connecting to database and checking public.todos table...');
    
    // Test connection to public.todos table
    const { rows } = await pool.query('SELECT COUNT(*) FROM public.todos');
    console.log(`✅ Database connected successfully. Found ${rows[0].count} existing todos.`);
    await pool.end();
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    console.log('Please check:');
    console.log('1. Database permissions for the user on public.todos table');
    console.log('2. Environment variables in app.yml');
    console.log('3. Lakebase connection settings');
  }
}

// API Routes
// GET /api/todos - Get all todos
app.get('/api/todos', async (req, res) => {
  if (!process.env.DATABRICKS_HOST) {
    return res.status(503).json({ error: 'Database not connected. Please configure Lakebase environment variables.' });
  }

  try {
    const pool = await getPool();
    const { rows } = await pool.query('SELECT * FROM public.todos ORDER BY created_at DESC');
    res.json(rows);
    await pool.end();
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos', details: error.message });
  }
});

// POST /api/todos - Create a new todo
app.post('/api/todos', async (req, res) => {
  if (!process.env.DATABRICKS_HOST) {
    return res.status(503).json({ error: 'Database not connected. Please configure Lakebase environment variables.' });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const pool = await getPool();
    const { rows } = await pool.query(
      'INSERT INTO public.todos (text) VALUES ($1) RETURNING *',
      [text]
    );
    res.status(201).json(rows[0]);
    await pool.end();
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo', details: error.message });
  }
});

// PATCH /api/todos/:id - Update a todo
app.patch('/api/todos/:id', async (req, res) => {
  if (!process.env.DATABRICKS_HOST) {
    return res.status(503).json({ error: 'Database not connected. Please configure Lakebase environment variables.' });
  }

  try {
    const { id } = req.params;
    const { text, completed } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const pool = await getPool();
    
    // Build dynamic query based on what fields are provided
    let query, params;
    
    if (text !== undefined && completed !== undefined) {
      // Update both text and completed
      query = 'UPDATE public.todos SET text = $1, completed = $2, updated_at = NOW() WHERE id = $3 RETURNING *';
      params = [text, completed, id];
    } else if (text !== undefined) {
      // Update only text
      query = 'UPDATE public.todos SET text = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
      params = [text, id];
    } else if (completed !== undefined) {
      // Update only completed status
      query = 'UPDATE public.todos SET completed = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
      params = [completed, id];
    } else {
      return res.status(400).json({ error: 'Either text or completed must be provided' });
    }
    
    const { rows } = await pool.query(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(rows[0]);
    await pool.end();
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo', details: error.message });
  }
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  if (!process.env.DATABRICKS_HOST) {
    return res.status(503).json({ error: 'Database not connected. Please configure Lakebase environment variables.' });
  }

  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const pool = await getPool();
    const { rowCount } = await pool.query('DELETE FROM public.todos WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ success: true });
    await pool.end();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Unified Todo app server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  await initializeDatabase();
});
