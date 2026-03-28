const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  heroTitle: {
    type: String,
    default: 'Buy & Sell Vehicles'
  },
  heroSubtitle: {
    type: String,
    default: 'The Smarter Way'
  },
  heroDescription: {
    type: String,
    default: 'Connect with verified buyers and sellers. Get the best deals through our transparent bidding system.'
  },
  ctaPrimary: {
    type: String,
    default: 'Start Selling'
  },
  ctaSecondary: {
    type: String,
    default: 'Browse Ads'
  },
  categories: [{
    name: { type: String, default: '' },
    emoji: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  features: [{
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'We are currently under maintenance. Please check back soon.'
  }
}, {
  timestamps: true
});

platformSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
