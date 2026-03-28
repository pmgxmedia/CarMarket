const User = require('../models/User');
const Ad = require('../models/Ad');
const Transaction = require('../models/Transaction');
const { buildPaginationResponse } = require('../utils/responseUtils');

const getStats = async (req, res) => {
  try {
    const [
      users, ads, transactions,
      completedTransactions, activeAds, sellers, buyers
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Ad.countDocuments(),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'completed' }),
      Ad.countDocuments({ status: { $in: ['bidding', 'inspection_phase', 'final_bidding'] } }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'buyer' })
    ]);

    res.json({
      stats: {
        totalUsers: users,
        totalAds: ads,
        totalTransactions: transactions,
        completedTransactions,
        activeAds,
        sellers,
        buyers
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    const query = { role: { $ne: 'admin' } };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email phone location role buyerType isActive createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json(buildPaginationResponse(users, total, { page: pageNum, limit: limitNum }));
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email role isActive');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot suspend admin.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: user.isActive ? 'User activated.' : 'User suspended.',
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const getAllAds = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [ads, total] = await Promise.all([
      Ad.find(query)
        .select('sellerId images category make model year askingPrice status createdAt')
        .populate('sellerId', 'name email location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Ad.countDocuments(query)
    ]);

    res.json(buildPaginationResponse(ads, total, { page: pageNum, limit: limitNum }));
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }

    res.json({ message: 'Ad deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .select('adId sellerId buyerId finalPrice status createdAt')
        .populate('adId', 'make model')
        .populate('sellerId', 'name email')
        .populate('buyerId', 'name email')
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
  getStats,
  getAllUsers,
  suspendUser,
  getAllAds,
  deleteAd,
  getAllTransactions
};
