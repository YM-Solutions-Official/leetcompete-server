import mongoose from "mongoose";

const connectDB = async (URI) => {
    try {
        await mongoose.connect(URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
};

export default connectDB;