import mongoose from "mongoose"


const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected successfully!");
  } catch (error) {
    console.error(" Database connection failed:", error.message);
    process.exit(1); // stops the server if DB connection fails
  }
};

export default connectDb
