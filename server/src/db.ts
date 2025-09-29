import mongoose from 'mongoose';
import { env } from './config';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
  return mongoose.connection;
}
