import express from 'express';
import cors from 'cors';
import sitesRouter from './routes/sites';
import workersRouter from './routes/workers';
import attendanceRouter from './routes/attendance';
import attendanceStandaloneRouter from './routes/attendanceStandalone';
import materialsRouter from './routes/materials';
import materialsStandaloneRouter from './routes/materialsStandalone';
import expensesRouter from './routes/expenses';
import expensesStandaloneRouter from './routes/expensesStandalone';
import reportsRouter from './routes/reports';
import reportsStandaloneRouter from './routes/reportsStandalone';
import payrollRouter from './routes/payroll';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/sites', sitesRouter);
app.use('/api/workers', workersRouter);

app.use('/api/attendance', attendanceStandaloneRouter);
app.use('/api/materials', materialsStandaloneRouter);
app.use('/api/expenses', expensesStandaloneRouter);
app.use('/api/reports', reportsStandaloneRouter);

app.use('/api/sites', attendanceRouter);
app.use('/api/sites', materialsRouter);
app.use('/api/sites', expensesRouter);
app.use('/api/sites', reportsRouter);
app.use('/api/sites', payrollRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
