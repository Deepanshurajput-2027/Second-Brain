import mongoose from 'mongoose';
import logger from '../utils/logger/logger.js';

// Global Mongoose Configuration
mongoose.set('strictQuery', true);

mongoose.connection.on("connected", () => {
  logger.info("Mongoose connected to database");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("Mongoose disconnected from database");
});

mongoose.connection.on("error", (error) => {
  logger.error("Mongoose connection error:", error);
});

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDatabase;
