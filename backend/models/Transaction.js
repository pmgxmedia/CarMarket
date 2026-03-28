const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  adId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  finalPrice: {
    type: Number,
    required: true
  },
  saleDocument: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  deliveryPhoto: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'document_pending', 'photo_pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
