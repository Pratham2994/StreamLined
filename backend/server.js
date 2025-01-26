import express from 'express';
import { connectDb } from './config/db.js';
import userRoutes from './routes/userRoutes.js'; // Adjust path as necessary
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());

connectDb();
app.use(cookieParser());

app.use('/api/users', userRoutes);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
