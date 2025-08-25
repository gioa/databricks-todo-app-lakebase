import { Pool } from 'pg';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory (parent of server directory)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

let postgresPassword = null;
let lastPasswordRefresh = 0;

function ensureHttps(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

async function getDatabricksOAuthToken() {
  const tokenUrl = `${ensureHttps(process.env.DATABRICKS_HOST)}/oidc/v1/token`;
  const basicAuth = Buffer.from(
    `${process.env.DATABRICKS_CLIENT_ID}:${process.env.DATABRICKS_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'all-apis',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Token endpoint response:', data);
    throw new Error(`Failed to get OAuth token: ${response.statusText}`);
  }
  if (!data.access_token) {
    throw new Error('No access_token in token response');
  }
  return data.access_token;
}

async function refreshOAuthToken() {
  // Refresh every 15 minutes (900 seconds)
  if (!postgresPassword || (Date.now() / 1000 - lastPasswordRefresh > 900)) {
    console.log('Refreshing PostgreSQL OAuth token');
    try {
      postgresPassword = await getDatabricksOAuthToken();
      lastPasswordRefresh = Date.now() / 1000;
    } catch (e) {
      console.error('Failed to refresh OAuth token:', e);
      throw new Error('Failed to refresh OAuth token');
    }
  }
}

async function getPool() {
  await refreshOAuthToken();
  return new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
    application_name: process.env.PGAPPNAME,
    password: postgresPassword,
  });
}

export { getPool };
