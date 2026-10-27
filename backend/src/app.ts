import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes';
import { donationRouter } from './routes/donationRoutes';
import { taskRouter } from './routes/taskRoutes';
import { siteRouter } from './routes/siteRoutes';
import { openGateRouter } from './routes/openGateRoutes';
import { creditRouter } from './routes/creditRoutes';
import { notificationRouter } from './routes/notificationRoutes';
import { adminRouter } from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(cors());
app.use(express.json());

// Authoritative server-now clock synchronization (INV-10)
app.get('/api/time/now', (req, res) => {
  res.json({ server_now: new Date().toISOString() });
});

// Domain Routes
app.use('/api/auth', authRouter);
app.use('/api/donations', donationRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/sites', siteRouter);
app.use('/api/open-gate', openGateRouter);
app.use('/api/credits', creditRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);

// Central Error Handler
app.use(errorHandler);
