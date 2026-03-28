const { validationResult } = require('express-validator');
const Ad = require('../models/Ad');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const notificationService = require('../services/notificationService');
const { invalidateCache } = require('../services/cacheService');
const { buildPaginationResponse } = require('../utils/responseUtils');

const placeInitialBid = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    if (ad.status !== 'bidding') {
      return res.status(400).json({ error: 'Bids are not open for this ad.' });
    }

    if (ad.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'CANNOT_BID_OWN_AD', message: 'You cannot bid on your own ad.' });
    }

    if (req.user.role === 'buyer') {
      if (req.user.category && !req.user.category.includes(ad.category)) {
        return res.status(400).json({ error: 'You do not deal in this category.' });
      }

      if (ad.targetAudience !== 'both' && ad.targetAudience !== req.user.buyerType) {
        return res.status(400).json({ error: 'This ad is not accepting bids from your category.' });
      }
    }

    const existingBid = ad.initialBids.find(bid => bid.buyerId.toString() === req.user._id.toString());
    if (existingBid) {
      return res.status(400).json({ error: 'You have already placed an initial bid on this ad.' });
    }

    const bid = {
      buyerId: req.user._id,
      amount: req.body.amount,
      message: req.body.message || ''
    };

    ad.initialBids.push(bid);
    await ad.save();
    invalidateCache('ads');

    await notificationService.sendBidReceivedNotification(ad.sellerId, ad, req.user, bid.amount);

    res.status(201).json({
      message: 'Initial bid placed successfully.',
      bid: ad.initialBids[ad.initialBids.length - 1]
    });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getBids = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const ad = await Ad.findById(req.params.id)
      .select('initialBids sellerId')
      .populate('initialBids.buyerId', 'name businessName location buyerType email phone')
      .lean();

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    if (ad.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const sortedBids = [...ad.initialBids].sort((a, b) => b.amount - a.amount);
    const paginatedBids = sortedBids.slice(skip, skip + limitNum);

    res.json(buildPaginationResponse({
      bids: paginatedBids,
      topBids: sortedBids.slice(0, 5)
    }, sortedBids.length, { page: pageNum, limit: limitNum }));
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const selectBuyersForInspection = async (req, res) => {
  try {
    const { buyerIds, inspectionDateStart, inspectionDateEnd } = req.body;

    if (!buyerIds || buyerIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one buyer.' });
    }

    if (buyerIds.length > 5) {
      return res.status(400).json({ error: 'You can select a maximum of 5 buyers.' });
    }

    const ad = await Ad.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    if (ad.status !== 'bidding') {
      return res.status(400).json({ error: 'INVALID_STATUS_TRANSITION', message: 'Cannot select buyers at this stage.' });
    }

    const validBuyerIds = buyerIds.every(id => 
      ad.initialBids.some(bid => bid.buyerId.toString() === id)
    );

    if (!validBuyerIds) {
      return res.status(400).json({ error: 'Invalid buyer IDs selected.' });
    }

    ad.selectedBuyers = buyerIds;
    ad.inspectionDateStart = new Date(inspectionDateStart);
    ad.inspectionDateEnd = new Date(inspectionDateEnd);
    ad.status = 'inspection_phase';
    await ad.save();
    invalidateCache('ads');

    const notificationPromises = buyerIds.map(buyerId => 
      notificationService.sendInspectionNotification(buyerId, ad)
    );

    const nonSelectedBuyers = ad.initialBids
      .filter(bid => !buyerIds.includes(bid.buyerId.toString()))
      .map(bid => bid.buyerId);

    nonSelectedBuyers.forEach(buyer => {
      notificationPromises.push(notificationService.sendNotSelectedNotification(buyer, ad));
    });

    await Promise.all(notificationPromises);

    res.json({
      message: 'Buyers selected for inspection.',
      selectedBuyers: ad.selectedBuyers,
      ad
    });
  } catch (error) {
    console.error('Select buyers error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const placeFinalBid = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    if (ad.status !== 'inspection_phase' && ad.status !== 'final_bidding') {
      return res.status(400).json({ error: 'INSPECTION_NOT_CONFIRMED', message: 'Cannot place final bid at this stage.' });
    }

    if (!ad.selectedBuyers.includes(req.user._id)) {
      return res.status(403).json({ error: 'You are not selected for inspection.' });
    }

    const existingFinalBid = ad.finalBids.find(bid => bid.buyerId.toString() === req.user._id.toString());
    if (existingFinalBid) {
      existingFinalBid.amount = req.body.amount;
      existingFinalBid.message = req.body.message || '';
    } else {
      ad.finalBids.push({
        buyerId: req.user._id,
        amount: req.body.amount,
        message: req.body.message || ''
      });
    }

    await ad.save();
    invalidateCache('ads');

    res.json({
      message: 'Final bid placed successfully.',
      bids: ad.finalBids
    });
  } catch (error) {
    console.error('Place final bid error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getFinalBids = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .select('finalBids sellerId')
      .populate('finalBids.buyerId', 'name businessName location buyerType email phone')
      .lean();

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    if (ad.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const sortedBids = [...ad.finalBids].sort((a, b) => b.amount - a.amount);

    res.json({ bids: sortedBids });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const selectWinner = async (req, res) => {
  try {
    const { buyerId, pickupDate, paymentDeadline } = req.body;

    const ad = await Ad.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    if (ad.status !== 'inspection_phase' && ad.status !== 'final_bidding') {
      return res.status(400).json({ error: 'INVALID_STATUS_TRANSITION', message: 'Cannot select winner at this stage.' });
    }

    const validBuyer = ad.finalBids.find(bid => bid.buyerId.toString() === buyerId);
    if (!validBuyer) {
      return res.status(400).json({ error: 'Buyer did not place a final bid.' });
    }

    ad.winningBuyer = buyerId;
    ad.finalPrice = validBuyer.amount;
    ad.pickupDate = new Date(pickupDate);
    ad.paymentDeadline = new Date(paymentDeadline);
    ad.status = 'winner_selected';
    await ad.save();
    invalidateCache('ads');

    const [winningBuyer] = await Promise.all([
      User.findById(buyerId),
      notificationService.sendWinnerNotification(buyerId, ad)
    ]);

    const transaction = new Transaction({
      adId: ad._id,
      sellerId: ad.sellerId,
      buyerId,
      finalPrice: validBuyer.amount,
      status: 'pending'
    });
    await transaction.save();

    if (winningBuyer) {
      winningBuyer.currentAdId = ad._id;
      await winningBuyer.save();
    }

    res.json({
      message: 'Winner selected successfully.',
      ad,
      transaction
    });
  } catch (error) {
    console.error('Select winner error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getMyBids = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { 'initialBids.buyerId': req.user._id };
    if (status) query.status = status;

    const [ads, total] = await Promise.all([
      Ad.find(query)
        .select('images category make model year askingPrice location status initialBids finalBids selectedBuyers inspectionConfirmed winningBuyer sellerId inspectionDateStart inspectionDateEnd')
        .populate('sellerId', 'name businessName location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Ad.countDocuments(query)
    ]);

    const bids = ads.map(ad => {
      const myInitialBid = ad.initialBids?.find(b => b.buyerId.toString() === req.user._id.toString());
      const myFinalBid = ad.finalBids?.find(b => b.buyerId.toString() === req.user._id.toString());
      const isSelected = ad.selectedBuyers?.some(s => s.toString() === req.user._id.toString());
      const hasConfirmed = ad.inspectionConfirmed?.some(s => s.toString() === req.user._id.toString());
      const isWinner = ad.winningBuyer?.toString() === req.user._id.toString();

      return {
        _id: ad._id,
        images: ad.images,
        category: ad.category,
        make: ad.make,
        model: ad.model,
        year: ad.year,
        askingPrice: ad.askingPrice,
        location: ad.location,
        status: ad.status,
        sellerId: ad.sellerId,
        initialBid: myInitialBid ? { amount: myInitialBid.amount, createdAt: myInitialBid.createdAt } : null,
        finalBid: myFinalBid ? { amount: myFinalBid.amount, createdAt: myFinalBid.createdAt } : null,
        isSelected,
        hasConfirmed,
        isWinner,
        inspectionDateStart: ad.inspectionDateStart,
        inspectionDateEnd: ad.inspectionDateEnd,
        statusLabel: isWinner ? 'won' : ad.status
      };
    });

    res.json(buildPaginationResponse(bids, total, { page: pageNum, limit: limitNum }));
  } catch (error) {
    console.error('Get my bids error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const confirmInspection = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    if (ad.status !== 'inspection_phase') {
      return res.status(400).json({ error: 'Inspection is not open for this ad.' });
    }

    if (!ad.selectedBuyers.includes(req.user._id)) {
      return res.status(403).json({ error: 'You are not selected for inspection.' });
    }

    if (!ad.inspectionConfirmed) {
      ad.inspectionConfirmed = [];
    }

    if (ad.inspectionConfirmed.includes(req.user._id)) {
      return res.status(400).json({ error: 'You have already confirmed your inspection.' });
    }

    ad.inspectionConfirmed.push(req.user._id);
    
    const allConfirmed = ad.selectedBuyers.every(buyerId => 
      ad.inspectionConfirmed.includes(buyerId)
    );

    if (allConfirmed && ad.selectedBuyers.length > 0) {
      ad.status = 'final_bidding';
    }

    await ad.save();
    invalidateCache('ads');

    res.json({
      message: 'Inspection confirmed successfully.',
      confirmed: ad.inspectionConfirmed.length,
      totalSelected: ad.selectedBuyers.length,
      status: ad.status
    });
  } catch (error) {
    console.error('Confirm inspection error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  placeInitialBid,
  getBids,
  selectBuyersForInspection,
  placeFinalBid,
  getFinalBids,
  selectWinner,
  getMyBids,
  confirmInspection
};
