const mongoose = require('mongoose');

// Import models
const Hostel = require('../models/Hostel');
const PG = require('../models/PG');

// Connect to LOCAL MongoDB (not Atlas)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/student-helper-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const swapCollections = async () => {
  try {
    console.log('\n========================================');
    console.log('Starting Hostel ↔️ PG Swap Process');
    console.log('========================================\n');

    // Step 1: Get all data from both collections
    console.log('📥 Fetching all Hostels...');
    const hostels = await Hostel.find({}).lean();
    console.log(`   Found ${hostels.length} hostels`);

    console.log('📥 Fetching all PGs...');
    const pgs = await PG.find({}).lean();
    console.log(`   Found ${pgs.length} PGs\n`);

    // Step 2: Create backup info
    console.log('💾 Creating backup info...');
    const backupData = {
      hostels: hostels,
      pgs: pgs,
      timestamp: new Date(),
      hostelCount: hostels.length,
      pgCount: pgs.length
    };
    
    // Optional: Save backup to file
    const fs = require('fs');
    const backupPath = `../backups/swap_backup_${Date.now()}.json`;
    fs.mkdirSync('../backups', { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`   ✅ Backup saved to: ${backupPath}\n`);

    // Step 3: Delete all documents from both collections
    console.log('🗑️  Clearing collections...');
    const hostelDeleteResult = await Hostel.deleteMany({});
    console.log(`   Deleted ${hostelDeleteResult.deletedCount} hostels`);
    
    const pgDeleteResult = await PG.deleteMany({});
    console.log(`   Deleted ${pgDeleteResult.deletedCount} PGs\n`);

    // Step 4: Insert swapped data
    console.log('🔄 Inserting swapped data...');
    
    // Insert old PG data into Hostel collection
    if (pgs.length > 0) {
      console.log('   📤 Inserting PG data into Hostel collection...');
      const hostelDocs = pgs.map(pg => {
        const { _id, __v, ...rest } = pg;
        return {
          ...rest,
          datePosted: rest.datePosted || new Date(),
          updatedAt: new Date()
        };
      });
      await Hostel.insertMany(hostelDocs);
      console.log(`   ✅ Inserted ${hostelDocs.length} documents into Hostel collection`);
    }

    // Insert old Hostel data into PG collection
    if (hostels.length > 0) {
      console.log('   📤 Inserting Hostel data into PG collection...');
      const pgDocs = hostels.map(hostel => {
        const { _id, __v, ...rest } = hostel;
        return {
          ...rest,
          datePosted: rest.datePosted || new Date(),
          updatedAt: new Date()
        };
      });
      await PG.insertMany(pgDocs);
      console.log(`   ✅ Inserted ${pgDocs.length} documents into PG collection`);
    }

    console.log('\n========================================');
    console.log('✅ Swap Complete!');
    console.log('========================================');
    console.log(`Hostel collection now has: ${pgs.length} documents (was ${hostels.length})`);
    console.log(`PG collection now has: ${hostels.length} documents (was ${pgs.length})`);
    console.log('========================================\n');

    // Verify the swap
    const newHostelCount = await Hostel.countDocuments();
    const newPGCount = await PG.countDocuments();
    console.log('🔍 Verification:');
    console.log(`   Hostel collection: ${newHostelCount} documents`);
    console.log(`   PG collection: ${newPGCount} documents\n`);

    if (newHostelCount === pgs.length && newPGCount === hostels.length) {
      console.log('✅ Swap verified successfully!\n');
    } else {
      console.log('⚠️  Warning: Document counts do not match expected values!\n');
    }

  } catch (error) {
    console.error('❌ Error during swap:', error);
    throw error;
  }
};

const main = async () => {
  try {
    // Connect to database
    await connectDB();

    // Prompt user for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\n⚠️  WARNING: This will swap all data between Hostel and PG collections!\nDo you want to continue? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        await swapCollections();
        console.log('✅ Process completed successfully!');
      } else {
        console.log('❌ Swap cancelled by user.');
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
