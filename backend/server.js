// server.js
import express from 'express';
import { connectDb } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import cartRoutes from './routes/cartRoutes.js';


const app = express();

app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true 
}));
  
app.use(express.json());
app.use(cookieParser());

connectDb();

app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/cart', cartRoutes);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
