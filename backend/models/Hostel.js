const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Please add hostel name'],
    maxlength: 100
  },
  hostelName: {
    type: String,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: 1000
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please add address']
    },
    area: {
      type: String,
      maxlength: 100
    },
    city: {
      type: String,
      required: [true, 'Please add city']
    },
    pincode: {
      type: String,
      maxlength: 10
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    type: String,
    maxlength: 20
  },
  // Warden Information
  wardenName: {
    type: String,
    maxlength: 100
  },
  wardenPhone: {
    type: String,
    maxlength: 20
  },
  // Hostel Type
  hostelType: {
    type: String,
    enum: ['boys', 'girls', 'mixed'],
    default: 'mixed'
  },
  distanceFromCollege: {
    type: Number,
    required: [true, 'Please add distance from college in KM'],
    min: 0
  },
  collegeName: {
    type: String,
    default: 'Dharamsinh Desai University (DDU)'
  },
  floorNumber: {
    type: Number,
    required: [true, 'Please specify floor number'],
    min: 0
  },
  price: {
    type: Number,
    required: [true, 'Please add rent price'],
    min: 0
  },
  predictedPrice: {
    type: Number,
    default: 0
  },
  roomType: {
    type: String,
    required: [true, 'Please specify room type'],
    enum: ['2-seater', '3-seater', '4-seater', 'Single', 'Double', 'Triple', 'Shared', 'Dormitory']
  },
  // Fees Structure
  fees: {
    monthly: { type: Number, min: 0, default: 0 },
    yearly: { type: Number, min: 0, default: 0 },
    feeType: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' }
  },
  roomSize: {
    type: Number, // in square feet
    required: [true, 'Please add room size in sq ft']
  },
  furnishing: {
    type: String,
    required: [true, 'Please specify furnishing level'],
    enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished']
  },
  facilities: [{
    type: String,
    enum: [
      'WiFi',
      'Hot water',
      'Laundry',
      'Mess',
      'CCTV',
      'AC',
      'Non-AC',
      'Parking',
      'Security',
      'Kitchen',
      'Study Room',
      'Recreation Room',
      'Gym',
      'Water Cooler',
      'Generator',
      'Cleaning Service'
    ]
  }],
  images: [{
    type: String,
    required: true
  }],
  videos: [{
    type: String
  }],
  ownerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerContact: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: [true, 'Please specify gender preference'],
    enum: ['Male', 'Female', 'Co-ed']
  },
  totalRooms: {
    type: Number,
    required: [true, 'Please add total number of rooms'],
    min: 1
  },
  availableRooms: {
    type: Number,
    required: [true, 'Please add available rooms'],
    min: 0
  },
  // Room Availability (Bed-level tracking)
  totalBeds: {
    type: Number,
    min: 0,
    default: 0
  },
  availableBeds: {
    type: Number,
    min: 0,
    default: 0
  },
  occupiedBeds: {
    type: Number,
    min: 0,
    default: 0
  },
  // Room Details (Optional sub-collection)
  rooms: [{
    roomNo: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    occupied: { type: Number, default: 0, min: 0 },
    available: { 
      type: Number, 
      default: function() { return this.capacity; },
      min: 0
    },
    floor: { type: Number, default: 0 },
    roomType: { type: String }
  }],
  rules: [{
    type: String
  }],
  // Rules & Regulations
  regulations: {
    gateCloseTime: { type: String, default: '10:00 PM' },
    visitorPolicy: { type: String, maxlength: 500 },
    electricityRules: { type: String, maxlength: 500 },
    noSmoking: { type: Boolean, default: true },
    noAlcohol: { type: Boolean, default: true },
    extraRules: [{ type: String, maxlength: 200 }]
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  likes: [{
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  // Admin management fields
  soldOut: {
    type: Boolean,
    default: false
  },
  soldOutDate: {
    type: Date
  },
  soldOutDuration: {
    amount: {
      type: Number,
      min: 1
    },
    unit: {
      type: String,
      enum: ['days', 'months', 'years']
    }
  },
  soldOutReason: {
    type: String,
    maxlength: 500
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Additional fields for AC/Non-AC and Mess details and fees breakdown
  acAvailable: { type: Boolean, default: false },
  nonAcAvailable: { type: Boolean, default: true },
  acRooms: { type: Number, min: 0, default: 0 },
  nonAcRooms: { type: Number, min: 0, default: 0 },
  messAvailable: { type: Boolean, default: false },
  messDetails: { type: String, maxlength: 1000 },
  // Mess Information
  mess: {
    messType: { 
      type: String, 
      enum: ['veg', 'nonveg', 'both'],
      default: 'veg'
    },
    messFees: { type: Number, min: 0, default: 0 },
    foodSchedule: {
      monday: { breakfast: String, lunch: String, dinner: String },
      tuesday: { breakfast: String, lunch: String, dinner: String },
      wednesday: { breakfast: String, lunch: String, dinner: String },
      thursday: { breakfast: String, lunch: String, dinner: String },
      friday: { breakfast: String, lunch: String, dinner: String },
      saturday: { breakfast: String, lunch: String, dinner: String },
      sunday: { breakfast: String, lunch: String, dinner: String }
    }
  },
  fees: {
    securityDeposit: { type: Number, min: 0, default: 0 },
    electricityPerUnit: { type: Number, min: 0, default: 0 },
    maintenancePerMonth: { type: Number, min: 0, default: 0 }
  },
  // Student Allotment (Most Important for Hostels)
  students: [{
    studentId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: { type: String, required: true },
    studentEmail: { type: String },
    studentPhone: { type: String },
    roomNo: { type: String, required: true },
    bedNo: { type: String },
    joinDate: { type: Date, default: Date.now },
    leaveDate: { type: Date },
    isActive: { type: Boolean, default: true },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
    lastPaymentDate: { type: Date },
    nextDueDate: { type: Date }
  }],
  // Payment Tracking (Optional - for admin dashboard)
  paymentTracking: {
    enabled: { type: Boolean, default: false },
    paymentHistory: [{
      studentId: { type: mongoose.Schema.ObjectId, ref: 'User' },
      amount: { type: Number, required: true },
      paymentDate: { type: Date, default: Date.now },
      paymentType: { type: String, enum: ['rent', 'mess', 'security', 'other'], default: 'rent' },
      month: { type: String },
      year: { type: Number },
      status: { type: String, enum: ['paid', 'pending'], default: 'paid' },
      receipt: { type: String }
    }]
  }
});

// Virtual field for room availability
hostelSchema.virtual('roomAvailability').get(function() {
  if (this.totalBeds && this.totalBeds > 0) {
    return this.totalBeds - this.occupiedBeds;
  }
  // Fallback to room-based calculation
  return this.totalRooms - (this.totalRooms - this.availableRooms);
});

// Update the updatedAt field before saving
hostelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-calculate availableBeds if not set
  if (this.totalBeds > 0 && !this.availableBeds) {
    this.availableBeds = this.totalBeds - this.occupiedBeds;
  }
  
  // Auto-calculate occupiedBeds from students array
  if (this.students && this.students.length > 0) {
    const activeStudents = this.students.filter(s => s.isActive !== false);
    this.occupiedBeds = activeStudents.length;
    if (this.totalBeds > 0) {
      this.availableBeds = this.totalBeds - this.occupiedBeds;
    }
  }
  
  // Set hostelName from name if not provided
  if (!this.hostelName && this.name) {
    this.hostelName = this.name;
  }
  
  next();
});

// Create index for text search
hostelSchema.index({
  name: 'text',
  description: 'text',
  'location.address': 'text',
  'location.city': 'text',
  facilities: 'text'
});

// Additional performance indexes for frequent filters/sorts
hostelSchema.index({ price: 1 });
hostelSchema.index({ distanceFromCollege: 1 });
hostelSchema.index({ gender: 1 });
hostelSchema.index({ roomType: 1 });
hostelSchema.index({ active: 1 });
hostelSchema.index({ ownerId: 1 });

// Create geospatial index for location-based queries (only when coordinates are valid)
hostelSchema.pre('save', function(next) {
  // Remove coordinates if they are null or invalid to avoid GeoJSON errors
  if (this.location && this.location.coordinates) {
    const { latitude, longitude } = this.location.coordinates;
    if (latitude === null || longitude === null || 
        latitude === undefined || longitude === undefined ||
        isNaN(latitude) || isNaN(longitude)) {
      this.location.coordinates = undefined;
    }
  }
  next();
});

// Create conditional geospatial index
hostelSchema.index(
  { 'location.coordinates': '2dsphere' },
  { 
    sparse: true, // Only index documents that have coordinates
    background: true 
  }
);

module.exports = mongoose.model('Hostel', hostelSchema);