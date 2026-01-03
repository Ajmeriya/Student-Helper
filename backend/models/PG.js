/**
 * STEP 3: PG Model (Database Schema)
 * 
 * This defines what a PG document looks like in MongoDB.
 * Think of it as a blueprint for PG data.
 */

import mongoose from 'mongoose'

const pgSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  collegeName: {
    type: String,
    required: [true, 'College name is required'],
    trim: true
  },
  
  // Property Details
  sharingType: {
    type: String,
    required: true,
    enum: ['single', 'double', 'triple', 'quad']
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 1
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 1
  },
  floorNumber: {
    type: Number,
    default: 0
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  maintenance: {
    type: Number,
    default: 0
  },
  
  // Facilities (Boolean - true/false)
  ac: { type: Boolean, default: false },
  furnished: { type: Boolean, default: false },
  ownerOnFirstFloor: { type: Boolean, default: false },
  foodAvailable: { type: Boolean, default: false },
  powerBackup: { type: Boolean, default: false },
  parking: { type: Boolean, default: false },
  waterSupply: {
    type: String,
    enum: ['24x7', 'timing', 'limited', ''],
    default: ''
  },
  
  // Additional Info
  preferredTenant: {
    type: String,
    enum: ['student', 'working', 'both', ''],
    default: ''
  },
  availabilityDate: Date,
  nearbyLandmarks: String,
  instructions: String, // Combined instructions/rules
  
  // Location (for map)
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  
  // Distance to college (in kilometers)
  distanceToCollege: {
    type: Number,
    default: 0
  },
  
  // Media (file paths/URLs)
  images: [String],
  videos: [String],
  
  // Owner (Broker who created this PG)
  broker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Now required since we have authentication
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
})

// Create index for faster city searches
pgSchema.index({ city: 1 })
pgSchema.index({ isActive: 1 })

// Create the model
const PG = mongoose.model('PG', pgSchema)

export default PG

