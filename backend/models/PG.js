const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add PG name'], maxlength: 100 },
  description: { type: String, required: [true, 'Please add a description'], maxlength: 1000 },
  location: {
    address: { type: String, required: [true, 'Please add address'] },
    city: { type: String, required: [true, 'Please add city'] },
    coordinates: { latitude: Number, longitude: Number }
  },
  distanceFromCollege: { type: Number, required: [true, 'Please add distance from college in KM'], min: 0 },
  collegeName: { type: String, default: 'Dharamsinh Desai University (DDU)' },
  floorNumber: { type: Number, required: [true, 'Please specify floor number'], min: 0 },
  price: { type: Number, required: [true, 'Please add rent price'], min: 0 },
  predictedPrice: { type: Number, default: 0 },
  roomType: { type: String, required: [true, 'Please specify room type'], enum: ['Single', 'Double', 'Triple', 'Shared', 'Dormitory'] },
  roomSize: { type: Number, required: [true, 'Please add room size in sq ft'] },
  furnishing: { type: String, required: [true, 'Please specify furnishing level'], enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'] },
  facilities: [{
    type: String,
    enum: ['WiFi','AC','Laundry','Parking','Security','Mess','Kitchen','Study Room','Recreation Room','Gym','Water Cooler','Generator','CCTV','Cleaning Service']
  }],
  images: [{ type: String, required: true }],
  videos: [{ type: String }],
  ownerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, required: true },
  ownerContact: { type: String, required: true },
  gender: { type: String, required: [true, 'Please specify gender preference'], enum: ['Male', 'Female', 'Co-ed'] },
  totalRooms: { type: Number, required: [true, 'Please add total number of rooms'], min: 1 },
  availableRooms: { type: Number, required: [true, 'Please add available rooms'], min: 0 },
  rules: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  likes: [{ userId: { type: mongoose.Schema.ObjectId, ref: 'User' } }],
  views: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  // Admin management fields
  soldOut: { type: Boolean, default: false },
  soldOutDate: { type: Date },
  soldOutDuration: {
    amount: { type: Number, min: 1 },
    unit: { type: String, enum: ['days', 'months', 'years'] }
  },
  soldOutReason: { type: String, maxlength: 500 },
  datePosted: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Additional fields similar to Hostel for consistency
  acAvailable: { type: Boolean, default: false },
  nonAcAvailable: { type: Boolean, default: true },
  acRooms: { type: Number, min: 0, default: 0 },
  nonAcRooms: { type: Number, min: 0, default: 0 },
  messAvailable: { type: Boolean, default: false },
  messDetails: { type: String, maxlength: 1000 },
  fees: {
    securityDeposit: { type: Number, min: 0, default: 0 },
    electricityPerUnit: { type: Number, min: 0, default: 0 },
    maintenancePerMonth: { type: Number, min: 0, default: 0 }
  }
});

pgSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

pgSchema.index({
  name: 'text',
  description: 'text',
  'location.address': 'text',
  'location.city': 'text',
  facilities: 'text'
});
pgSchema.index({ price: 1 });
pgSchema.index({ distanceFromCollege: 1 });
pgSchema.index({ gender: 1 });
pgSchema.index({ roomType: 1 });
pgSchema.index({ active: 1 });
pgSchema.index({ ownerId: 1 });

pgSchema.pre('save', function(next) {
  if (this.location && this.location.coordinates) {
    const { latitude, longitude } = this.location.coordinates;
    if (latitude === null || longitude === null || latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
      this.location.coordinates = undefined;
    }
  }
  next();
});

pgSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true, background: true });

module.exports = mongoose.model('PG', pgSchema);
