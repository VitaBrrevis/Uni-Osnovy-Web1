import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import './models/index.js'; // ініціалізація моделей/зв’язків
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

app.get('/', (_req, res) => res.json({ ok: true }));

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});
