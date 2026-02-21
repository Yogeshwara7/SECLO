import db from './database';

// Auto-create tables on server start (critical for Render ephemeral storage)
db.exec(`
  CREATE TABLE IF NOT EXISTS payroll_batches (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
    authorized_count INTEGER DEFAULT 0,
    rejected_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payroll_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT NOT NULL,
    wallet TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'SCLO',
    validation_status TEXT DEFAULT 'pending' CHECK(validation_status IN ('pending', 'authorized', 'rejected')),
    rejection_reason TEXT,
    FOREIGN KEY (batch_id) REFERENCES payroll_batches(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_records_batch_id ON payroll_records(batch_id);
  CREATE INDEX IF NOT EXISTS idx_batches_status ON payroll_batches(status);
  CREATE INDEX IF NOT EXISTS idx_batches_created_at ON payroll_batches(created_at);
`);

// Try to add new columns to existing tables (for migration)
try {
  db.exec(`ALTER TABLE payroll_batches ADD COLUMN authorized_count INTEGER DEFAULT 0`);
} catch (e) {
  // Column already exists
}

try {
  db.exec(`ALTER TABLE payroll_batches ADD COLUMN rejected_count INTEGER DEFAULT 0`);
} catch (e) {
  // Column already exists
}

try {
  db.exec(`ALTER TABLE payroll_records ADD COLUMN validation_status TEXT DEFAULT 'pending'`);
} catch (e) {
  // Column already exists
}

try {
  db.exec(`ALTER TABLE payroll_records ADD COLUMN rejection_reason TEXT`);
} catch (e) {
  // Column already exists
}

console.log('Database tables initialized');

