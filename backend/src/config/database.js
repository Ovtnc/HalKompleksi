const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Deprecated options removed (useNewUrlParser, useUnifiedTopology no longer needed in v4+)
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi');

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('💡 Make sure MongoDB is running: sudo systemctl start mongod');
    process.exit(1);
  }
};

module.exports = connectDB;
