import { Pool } from 'pg';
const globalForPg = global as unknown as { pool: Pool };

export const pool =
  globalForPg.pool ||
  new Pool({
    // Dein Connection String aus der .env
    connectionString: process.env.DATABASE_URL,
    
    // Pooling Einstellungen
    max: 10,                   // Max. 10 Verbindungen pro Repo
    idleTimeoutMillis: 30000,  // Schließt ungenutzte Verbindungen nach 30s
    connectionTimeoutMillis: 5000, // Wartezeit bei Überlastung
    
    // Wichtig für Cloud-DBs wie Neon oder Supabase
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

export const db = {
  query: async (text: string, params?: any[]) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    

    return res;
  },
};

export default db;