import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    // Assert that the environment variable exists and is a string
    const mongoURI = process.env.MONGO_URI as string;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    // Type-check the error object
    if (error instanceof Error) {
      console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    } else {
      console.error("❌ An unknown error occurred during database connection");
    }

    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
