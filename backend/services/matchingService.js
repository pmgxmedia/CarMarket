const User = require('../models/User');

const findMatchingBuyers = async (ad) => {
  try {
    const query = {
      role: 'buyer',
      isActive: true,
      category: ad.category
    };

    if (ad.targetAudience !== 'both') {
      query.buyerType = ad.targetAudience;
    }

    if (ad.locationFilter) {
      query.location = { $regex: ad.locationFilter, $options: 'i' };
    }

    const buyers = await User.find(query).select('_id');
    return buyers;
  } catch (error) {
    console.error('Find matching buyers error:', error);
    return [];
  }
};

module.exports = {
  findMatchingBuyers
};
