import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import payrollRoutes from './routes/payroll';
import aiRoutes from './routes/ai';
import registryRoutes from './routes/registry';

// Initialize database (auto-creates tables on startup - critical for Render)
import './db/init';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SECLO Backend API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Payroll routes
app.use('/payroll', payrollRoutes);

// AI routes
app.use('/ai', aiRoutes);

// Registry routes (for CRE workflow)
app.use('/registry', registryRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});