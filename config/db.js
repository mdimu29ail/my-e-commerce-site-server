const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // নতুন ভার্সনে কোনো অতিরিক্ত অপশন (useNewUrlParser ইত্যাদি) প্রয়োজন নেই
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
