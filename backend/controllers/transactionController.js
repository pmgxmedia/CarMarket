const Transaction = require('../models/Transaction');
const Ad = require('../models/Ad');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const { invalidateCache } = require('../services/cacheService');
const { buildPaginationResponse } = require('../utils/responseUtils');

const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('adId', 'images category make model year')
      .populate('sellerId', 'name email phone location')
      .populate('buyerId', 'name email phone location')
      .lean();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const isParticipant = 
      transaction.sellerId._id.toString() === req.user._id.toString() ||
      transaction.buyerId._id.toString() === req.user._id.toString();

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const uploadSaleDocument = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    if (transaction.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only seller can upload sale documents.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    transaction.saleDocument = {
      url: req.file.path,
      publicId: req.file.filename,
      uploadedAt: new Date()
    };

    let ad, seller;

    if (transaction.deliveryPhoto) {
      transaction.status = 'completed';
      
      [ad, seller] = await Promise.all([
        Ad.findById(transaction.adId),
        User.findById(transaction.sellerId)
      ]);

      if (ad) {
        ad.status = 'completed';
        await ad.save();
      }

      if (seller) {
        seller.pendingDocuments = false;
        seller.currentAdId = null;
        await seller.save();
      }

      await notificationService.sendTransactionCompletedNotification(transaction.buyerId, ad);
    } else {
      transaction.status = 'document_pending';
    }

    await transaction.save();
    invalidateCache('transactions');

    res.json({
      message: 'Sale document uploaded successfully.',
      transaction
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const uploadDeliveryPhoto = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    if (transaction.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only buyer can upload delivery photo.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    transaction.deliveryPhoto = {
      url: req.file.path,
      publicId: req.file.filename,
      uploadedAt: new Date()
    };

    let ad, buyer, seller;

    if (transaction.saleDocument) {
      transaction.status = 'completed';
      
      [ad, buyer, seller] = await Promise.all([
        Ad.findById(transaction.adId),
        User.findById(transaction.buyerId),
        User.findById(transaction.sellerId)
      ]);

      if (ad) {
        ad.status = 'completed';
        await ad.save();
      }

      if (buyer) {
        buyer.currentAdId = null;
        await buyer.save();
      }

      if (seller) {
        seller.pendingDocuments = false;
        await seller.save();
      }

      await notificationService.sendTransactionCompletedNotification(transaction.sellerId, ad);
    } else {
      transaction.status = 'photo_pending';
    }

    await transaction.save();
    invalidateCache('transactions');

    res.json({
      message: 'Delivery photo uploaded successfully.',
      transaction
    });
  } catch (error) {
    console.error('Upload delivery photo error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      $or: [
        { sellerId: req.user._id },
        { buyerId: req.user._id }
      ]
    };

    if (status) query.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .select('adId sellerId buyerId finalPrice status saleDocument deliveryPhoto createdAt')
        .populate('adId', 'images category make model year')
        .populate('sellerId', 'name email phone location')
        .populate('buyerId', 'name email phone location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(query)
    ]);

    res.json(buildPaginationResponse(transactions, total, { page: pageNum, limit: limitNum }));
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  getTransaction,
  uploadSaleDocument,
  uploadDeliveryPhoto,
  getMyTransactions
};
