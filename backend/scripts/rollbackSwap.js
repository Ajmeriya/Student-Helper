const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars
dotenv.config({ path: require('path').join(__dirname, '../.env') });

// Import models
const Hostel = require('../models/Hostel');
const PG = require('../models/PG');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const getLatestBackup = () => {
  const backupDir = '../backups';
  if (!fs.existsSync(backupDir)) {
    console.error('❌ Backups directory does not exist!');
    return null;
  }

  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('swap_backup_') && file.endsWith('.json'))
    .map(file => ({
      name: file,
      path: path.join(backupDir, file),
      time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  return files.length > 0 ? files[0] : null;
};

const rollbackSwap = async (backupFile) => {
  try {
    console.log('\n========================================');
    console.log('Starting Rollback Process');
    console.log('========================================\n');

    // Load backup data
    console.log(`📥 Loading backup from: ${backupFile.name}...`);
    const backupData = JSON.parse(fs.readFileSync(backupFile.path, 'utf8'));
    console.log(`   Backup timestamp: ${new Date(backupData.timestamp).toLocaleString()}`);
    console.log(`   Hostels in backup: ${backupData.hostelCount}`);
    console.log(`   PGs in backup: ${backupData.pgCount}\n`);

    // Clear current collections
    console.log('🗑️  Clearing current collections...');
    await Hostel.deleteMany({});
    await PG.deleteMany({});
    console.log('   ✅ Collections cleared\n');

    // Restore hostels
    if (backupData.hostels && backupData.hostels.length > 0) {
      console.log('📤 Restoring Hostels...');
      const hostelDocs = backupData.hostels.map(h => {
        const { _id, __v, ...rest } = h;
        return rest;
      });
      await Hostel.insertMany(hostelDocs);
      console.log(`   ✅ Restored ${hostelDocs.length} hostels\n`);
    }

    // Restore PGs
    if (backupData.pgs && backupData.pgs.length > 0) {
      console.log('📤 Restoring PGs...');
      const pgDocs = backupData.pgs.map(p => {
        const { _id, __v, ...rest } = p;
        return rest;
      });
      await PG.insertMany(pgDocs);
      console.log(`   ✅ Restored ${pgDocs.length} PGs\n`);
    }

    console.log('========================================');
    console.log('✅ Rollback Complete!');
    console.log('========================================\n');

    // Verify
    const hostelCount = await Hostel.countDocuments();
    const pgCount = await PG.countDocuments();
    console.log('🔍 Verification:');
    console.log(`   Hostel collection: ${hostelCount} documents`);
    console.log(`   PG collection: ${pgCount} documents\n`);

  } catch (error) {
    console.error('❌ Error during rollback:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();

    // Find latest backup
    const latestBackup = getLatestBackup();
    if (!latestBackup) {
      console.error('❌ No backup file found!');
      process.exit(1);
    }

    console.log(`\nLatest backup found: ${latestBackup.name}`);
    console.log(`Backup date: ${new Date(latestBackup.time).toLocaleString()}\n`);

    // Prompt for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('⚠️  This will restore data from the backup. Continue? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        await rollbackSwap(latestBackup);
        console.log('✅ Rollback completed successfully!');
      } else {
        console.log('❌ Rollback cancelled by user.');
      }
      readline.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
};

// Run the script
main();
