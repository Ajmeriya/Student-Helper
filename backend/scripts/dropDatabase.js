const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const dropDatabase = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    const dbName = conn.connection.db.databaseName;
    console.log(`\n⚠️  WARNING: You are about to DROP the database: ${dbName}`);
    console.log('This will DELETE ALL DATA in the database!');
    
    // Drop the database
    await conn.connection.db.dropDatabase();
    console.log(`\n✅ Database "${dbName}" has been dropped successfully!`);
    console.log('All collections and data have been deleted.');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. The database will be recreated automatically when you add new data');
    console.log('3. All collections will be created with fresh schemas');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping database:', error.message);
    process.exit(1);
  }
};

// Run the script
dropDatabase();

