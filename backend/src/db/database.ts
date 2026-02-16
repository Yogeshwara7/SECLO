import Database from 'better-sqlite3';
import path from 'path';

// Use relative path - works both locally and on Render
const dbPath = path.join(process.cwd(), 'database.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('✅ SQLite connected:', dbPath);

export default db;

