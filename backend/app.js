import express from 'express';
import cors from 'cors';
import './config/db.js';
import routes from './routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

export default app;
