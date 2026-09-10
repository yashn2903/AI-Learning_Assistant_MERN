import mongoose from 'mongoose'

// Cache the connection across warm serverless invocations so every request
// does not open a new pool against Atlas.
let cached = globalThis._mongooseCache;
if (!cached) {
    cached = globalThis._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI);
    }

    try {
        cached.conn = await cached.promise;
        console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
        return cached.conn;
    } catch (error) {
        // Reset so the next request retries instead of reusing a rejected promise.
        cached.promise = null;
        console.error(`Error connecting to MongoDB: ${error.message}`);
        throw error;
    }
};

export default connectDB;
