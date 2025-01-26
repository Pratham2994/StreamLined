import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

export const connectDb =async ()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO);
        console.log(`connection success  ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error : ${error.message} `);
        process.exit(1);
    }
}