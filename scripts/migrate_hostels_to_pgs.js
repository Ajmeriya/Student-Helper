#!/usr/bin/env node
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Hostel = require('../backend/models/Hostel');
const PG = require('../backend/models/PG');

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI missing');
    await mongoose.connect(uri);
    const pattern = /\bpg\b/i;
    const candidates = await Hostel.find({ $or: [ { name: { $regex: pattern } }, { propertyType: 'PG' } ] }).lean();
    let moved = 0;
    for (const h of candidates) {
      try {
        const { _id, __v, ...rest } = h;
        await PG.create({ ...rest, datePosted: new Date() });
        await Hostel.deleteOne({ _id: h._id });
        moved++;
      } catch (e) {
        console.error('Failed to move', h._id, e.message);
      }
    }
    console.log(JSON.stringify({ success: true, checked: candidates.length, moved }));
    process.exit(0);
  } catch (e) {
    console.error(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
})();