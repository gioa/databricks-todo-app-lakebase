import express from 'express';
import cors from 'cors';
import { getPool } from './lakebase.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
async function initializeDatabase() {
  const pool = await getPool();
  try {
    console.log('Connecting to database and checking public.todos table...');
    
    // Test connection to public.todos table
    const { rows } = await pool.query('SELECT COUNT(*) FROM public.todos');
    console.log(`✅ Database connected successfully. Found ${rows[0].count} existing todos.`);
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    console.log('Please check:');
    console.log('1. Database permissions for the user on public.todos table');
    console.log('2. Environment variables in .env file');
    console.log('3. Lakebase connection settings');
  } finally {
    await pool.end();
  }
}

// GET /api/todos - Get all todos
app.get('/api/todos', async (req, res) => {
  const pool = await getPool();
  try {
    // Use explicit public schema
    const { rows } = await pool.query('SELECT * FROM public.todos ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos', details: error.message });
  } finally {
    await pool.end();
  }
});

// POST /api/todos - Create a new todo
app.post('/api/todos', async (req, res) => {
  const pool = await getPool();
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const { rows } = await pool.query(
      'INSERT INTO public.todos (text) VALUES ($1) RETURNING *',
      [text]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo', details: error.message });
  } finally {
    await pool.end();
  }
});

// PATCH /api/todos/:id - Update a todo
app.patch('/api/todos/:id', async (req, res) => {
  const pool = await getPool();
  try {
    const { id } = req.params;
    const { text, completed } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const { rows } = await pool.query(
      'UPDATE public.todos SET text = $1, completed = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [text, completed, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  } finally {
    await pool.end();
  }
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  const pool = await getPool();
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const { rowCount } = await pool.query('DELETE FROM public.todos WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  } finally {
    await pool.end();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});
