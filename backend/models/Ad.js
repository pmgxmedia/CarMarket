const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const adSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  category: {
    type: String,
    enum: ['car', 'bike', 'commercial'],
    required: true
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1990,
    max: new Date().getFullYear() + 1
  },
  variant: {
    type: String,
    trim: true
  },
  bodyType: {
    type: String,
    trim: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'semi-auto'],
    required: true
  },
  kmDriven: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Needs Work'],
    default: 'Good'
  },
  previousOwners: {
    type: String,
    enum: ['1st Owner', '2nd Owner', '3rd Owner', '4th Owner', 'Fleet Managed'],
    default: '1st Owner'
  },
  cylinderCount: {
    type: String,
    trim: true
  },
  engineSize: {
    type: Number
  },
  power: {
    type: Number
  },
  torque: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    trim: true
  },
  askingPrice: {
    type: Number,
    required: true,
    min: 1000
  },
  negotiable: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    required: true,
    minlength: 50
  },
  targetAudience: {
    type: String,
    enum: ['dealer', 'individual', 'both'],
    default: 'both'
  },
  features: [{
    type: String,
    trim: true
  }],
  isLicensed: {
    type: Boolean,
    default: true
  },
  roadworthyAvailable: {
    type: Boolean,
    default: false
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'bidding', 'inspection_phase', 'final_bidding', 'winner_selected', 'completed', 'closed'],
    default: 'draft'
  },
  inspectionDateStart: {
    type: Date
  },
  inspectionDateEnd: {
    type: Date
  },
  selectedBuyers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  inspectionConfirmed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  winningBuyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  finalPrice: {
    type: Number
  },
  pickupDate: {
    type: Date
  },
  paymentDeadline: {
    type: Date
  },
  initialBids: [bidSchema],
  finalBids: [bidSchema],
  bidEndDate: {
    type: Date
  }
}, {
  timestamps: true
});

adSchema.index({ category: 1, status: 1, location: 1 });
adSchema.index({ sellerId: 1 });
adSchema.index({ make: 1, model: 1 });
adSchema.index({ province: 1, location: 1 });

module.exports = mongoose.model('Ad', adSchema);
