const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['seller', 'buyer', 'admin'],
    required: true
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    trim: true
  },
  businessName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  productTypes: [{
    type: String,
    enum: ['car', 'bike', 'commercial']
  }],
  category: [{
    type: String,
    enum: ['car', 'bike', 'commercial']
  }],
  buyerType: {
    type: String,
    enum: ['dealer', 'individual']
  },
  gstin: {
    type: String,
    sparse: true
  },
  buyerDealerInfo: {
    registrationNumber: { type: String },
    establishedYear: { type: Number },
    about: { type: String },
    address: { type: String },
    city: { type: String },
    province: { type: String },
    postalCode: { type: String },
    tradeLicenseNumber: { type: String },
    vatNumber: { type: String }
  },
  activeAds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad'
  }],
  maxActiveAds: {
    type: Number,
    default: 3
  },
  pendingDocuments: {
    type: Boolean,
    default: false
  },
  currentAdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  pushSubscription: {
    type: Object
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'upi'],
    default: 'bank_transfer'
  },
  bankDetails: {
    accountHolderName: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String }
  },
  sellerType: {
    type: String,
    enum: ['individual', 'dealer'],
    default: 'individual'
  },
  dealerInfo: {
    registrationNumber: { type: String },
    establishedYear: { type: Number },
    about: { type: String },
    website: { type: String },
    address: { type: String },
    city: { type: String },
    province: { type: String },
    postalCode: { type: String },
    tradeLicenseNumber: { type: String },
    vatNumber: { type: String }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
