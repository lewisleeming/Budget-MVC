const mongoose = require('mongoose');

// Connect to MongoDB using environment variables
const connectDB = async (customUri) => {
    const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/budgetapp';
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    await mongoose.connect(uri);
    return mongoose.connection;
};

// In non-test environments, connect automatically
if (process.env.NODE_ENV !== 'test') {
    connectDB().catch((err) => {
        console.error(`Database connection error: ${err.message}`);
    });
}

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error(`Database connection error: ${err.message}`);
});

mongoose.connectDB = connectDB;
module.exports = mongoose;
