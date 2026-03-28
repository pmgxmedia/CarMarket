const Ad = require('../models/Ad');

const adLimitCheck = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.pendingDocuments) {
      return res.status(403).json({ 
        error: 'CANNOT_POST_AD_NO_DOCS',
        message: 'You have pending documents from a previous transaction. Please upload them first.' 
      });
    }

    if (user.role === 'buyer') {
      const activeTransaction = await Ad.findOne({
        _id: user.currentAdId,
        status: { $nin: ['completed', 'closed'] }
      });

      if (activeTransaction) {
        return res.status(403).json({
          error: 'CANNOT_VIEW_AD',
          message: 'You have an ongoing transaction. Please complete it before viewing new ads.'
        });
      }
    }

    if (user.role === 'seller') {
      const activeAds = await Ad.countDocuments({
        sellerId: user._id,
        status: { $nin: ['completed', 'closed'] }
      });

      if (activeAds >= user.maxActiveAds) {
        return res.status(403).json({
          error: 'CANNOT_POST_AD_LIMIT',
          message: `You have reached the maximum limit of ${user.maxActiveAds} active ads.`
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = adLimitCheck;
