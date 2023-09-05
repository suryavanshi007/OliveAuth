// config/db.ts
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();
const MONGO_URI = process.env.MONGO_URL || 'default-secret'
console.log("Mongo url", MONGO_URI)
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
