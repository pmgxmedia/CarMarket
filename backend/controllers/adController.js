const { validationResult } = require('express-validator');
const Ad = require('../models/Ad');
const User = require('../models/User');
const matchingService = require('../services/matchingService');
const notificationService = require('../services/notificationService');
const { invalidateCache } = require('../services/cacheService');
const { buildPaginationResponse } = require('../utils/responseUtils');

const createAd = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const adData = {
      ...req.body,
      sellerId: req.user._id
    };

    const ad = new Ad(adData);
    await ad.save();

    req.user.activeAds.push(ad._id);
    await req.user.save();

    invalidateCache('ads');
    invalidateCache('user:');

    res.status(201).json({
      message: 'Ad created successfully.',
      ad
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getAds = async (req, res) => {
  try {
    const { 
      category, location, status, targetAudience, 
      minPrice, maxPrice, page = 1, limit = 10,
      fields = 'default', sort = '-createdAt',
      excludeMyAds
    } = req.query;
    
    const query = {};
    const projection = fields === 'detailed' 
      ? 'sellerId images category make model year variant bodyType fuelType transmission kmDriven color condition askingPrice province location description status targetAudience features createdAt'
      : 'sellerId images category make model year askingPrice province location status createdAt';

    if (req.user.role === 'buyer') {
      query.category = { $in: req.user.category };
      query.status = 'bidding';
      
      if (targetAudience === 'both' || !targetAudience) {
        query.$or = [
          { targetAudience: 'both' },
          { targetAudience: req.user.buyerType }
        ];
      } else {
        query.targetAudience = targetAudience;
      }

      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }
    } else if (req.user.role === 'seller') {
      if (excludeMyAds === 'true') {
        query.sellerId = { $ne: req.user._id };
        query.status = { $in: ['bidding', 'published'] };
      } else {
        query.sellerId = req.user._id;
      }
    }

    if (category) query.category = category;
    if (status && !excludeMyAds) query.status = status;
    if (minPrice || maxPrice) {
      query.askingPrice = {};
      if (minPrice) query.askingPrice.$gte = Number(minPrice);
      if (maxPrice) query.askingPrice.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [ads, total] = await Promise.all([
      Ad.find(query)
        .select(projection)
        .populate('sellerId', 'name businessName location')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Ad.countDocuments(query)
    ]);

    res.json(buildPaginationResponse(ads, total, { page: pageNum, limit: limitNum }));
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getAdById = async (req, res) => {
  try {
    const { fields = 'full' } = req.query;
    
    let populateFields = 'sellerId name businessName location phone';
    if (fields === 'full') {
      populateFields += ' initialBids.buyerId name businessName location buyerType';
      populateFields += ' finalBids.buyerId name businessName location buyerType';
      populateFields += ' selectedBuyers name businessName location buyerType';
      populateFields += ' winningBuyer name businessName location phone';
    }

    const ad = await Ad.findById(req.params.id)
      .populate('sellerId', 'name businessName location phone')
      .populate('initialBids.buyerId', 'name businessName location buyerType')
      .populate('finalBids.buyerId', 'name businessName location buyerType')
      .populate('selectedBuyers', 'name businessName location buyerType')
      .populate('winningBuyer', 'name businessName location phone')
      .lean();

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    const isOwner = req.user._id.toString() === ad.sellerId?._id?.toString();
    const isSelectedBuyer = ad.selectedBuyers?.some(b => b._id.toString() === req.user._id.toString());

    if (!isOwner && !isSelectedBuyer && ad.initialBids) {
      ad.initialBids = ad.initialBids.map(bid => ({
        _id: bid._id,
        amount: bid.amount,
        message: bid.message,
        createdAt: bid.createdAt,
        buyerId: {
          _id: bid.buyerId._id,
          name: bid.buyerId.name,
          buyerType: bid.buyerId.buyerType
        }
      }));
      ad.finalBids = [];
    }

    if (!isOwner && !isSelectedBuyer) {
      delete ad.finalBids;
    }

    res.json({ ...ad, isOwner });
  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found or you do not own it.' });
    }

    if (ad.status !== 'draft') {
      return res.status(400).json({ error: 'Can only update draft ads.' });
    }

    const updates = req.body;
    const allowedUpdates = [
      'images', 'category', 'make', 'model', 'year', 'variant', 'bodyType',
      'fuelType', 'transmission', 'kmDriven', 'color', 'condition', 'previousOwners',
      'cylinderCount', 'engineSize', 'power', 'torque', 'location', 'province',
      'askingPrice', 'negotiable', 'description', 'targetAudience', 'features',
      'isLicensed', 'roadworthyAvailable', 'registrationNumber'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        ad[key] = updates[key];
      }
    });

    await ad.save();
    invalidateCache('ads');

    res.json({
      message: 'Ad updated successfully.',
      ad
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found or you do not own it.' });
    }

    if (ad.status !== 'draft') {
      return res.status(400).json({ error: 'Can only delete draft ads.' });
    }

    await Ad.findByIdAndDelete(ad._id);

    req.user.activeAds = req.user.activeAds.filter(id => id.toString() !== ad._id.toString());
    await req.user.save();
    invalidateCache('ads');
    invalidateCache('user:');

    res.json({ message: 'Ad deleted successfully.' });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const publishAd = async (req, res) => {
  try {
    const ad = await Ad.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    if (ad.status !== 'draft') {
      return res.status(400).json({ error: 'Ad is already published.' });
    }

    if (ad.images.length < 3) {
      return res.status(400).json({ error: 'Please upload at least 3 images.' });
    }

    ad.status = 'published';
    ad.bidEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await ad.save();

    const matchingBuyers = await matchingService.findMatchingBuyers(ad);

    const notificationPromises = matchingBuyers.map(buyer => 
      notificationService.sendNewAdNotification(buyer, ad)
    );
    await Promise.all(notificationPromises);

    ad.status = 'bidding';
    await ad.save();
    invalidateCache('ads');

    res.json({
      message: 'Ad published successfully.',
      ad,
      notifiedBuyers: matchingBuyers.length
    });
  } catch (error) {
    console.error('Publish ad error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getMyAds = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [ads, total] = await Promise.all([
      Ad.find({ sellerId: req.user._id })
        .select('images category make model year askingPrice location status createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Ad.countDocuments({ sellerId: req.user._id })
    ]);

    res.json(buildPaginationResponse(ads, total, { page: pageNum, limit: limitNum }));
  } catch (error) {
    console.error('Get my ads error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  createAd,
  getAds,
  getAdById,
  updateAd,
  deleteAd,
  publishAd,
  getMyAds
};
