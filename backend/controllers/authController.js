const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const sellerRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, businessName, email, phone, password, location, productTypes } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = new User({
      role: 'seller',
      name,
      businessName,
      email,
      phone,
      password,
      location,
      productTypes
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Seller registered successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Seller register error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const buyerRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, businessName, email, phone, password, location, category, buyerType, gstin } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    if (buyerType === 'business' && !gstin) {
      return res.status(400).json({ error: 'GSTIN is required for business buyers.' });
    }

    const user = new User({
      role: 'buyer',
      name,
      businessName,
      email,
      phone,
      password,
      location,
      category,
      buyerType,
      gstin: buyerType === 'business' ? gstin : undefined
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Buyer registered successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Buyer register error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Your account has been suspended.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful.',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'businessName', 'phone', 'location', 'productTypes', 'category', 'pushSubscription', 'sellerType', 'buyerType'];
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        req.user[key] = updates[key];
      }
    });

    if (updates.dealerInfo) {
      req.user.dealerInfo = {
        ...req.user.dealerInfo,
        ...updates.dealerInfo
      };
    }

    if (updates.buyerDealerInfo) {
      req.user.buyerDealerInfo = {
        ...req.user.buyerDealerInfo,
        ...updates.buyerDealerInfo
      };
    }

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const updatePaymentSettings = async (req, res) => {
  try {
    const { paymentMethod, bankDetails } = req.body;

    req.user.paymentMethod = paymentMethod || req.user.paymentMethod;
    
    if (bankDetails) {
      req.user.bankDetails = {
        accountHolderName: bankDetails.accountHolderName || req.user.bankDetails?.accountHolderName,
        bankName: bankDetails.bankName || req.user.bankDetails?.bankName,
        accountNumber: bankDetails.accountNumber || req.user.bankDetails?.accountNumber,
        ifscCode: bankDetails.ifscCode || req.user.bankDetails?.ifscCode,
        upiId: bankDetails.upiId || req.user.bankDetails?.upiId
      };
    }

    await req.user.save();
    res.json({
      message: 'Payment settings updated successfully.',
      paymentMethod: req.user.paymentMethod,
      bankDetails: req.user.bankDetails
    });
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getPaymentSettings = async (req, res) => {
  try {
    res.json({
      paymentMethod: req.user.paymentMethod,
      bankDetails: req.user.bankDetails
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name businessName location buyerType createdAt');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const becomeSeller = async (req, res) => {
  try {
    const { productTypes } = req.body;

    if (req.user.role === 'seller') {
      return res.status(400).json({ error: 'You are already a seller.' });
    }

    if (!productTypes || productTypes.length === 0) {
      return res.status(400).json({ error: 'Select at least one product type.' });
    }

    req.user.role = 'seller';
    req.user.productTypes = productTypes;

    if (req.body.sellerType) {
      req.user.sellerType = req.body.sellerType;
    }

    if (req.body.businessName) {
      req.user.businessName = req.body.businessName;
    }

    await req.user.save();

    res.json({
      message: 'You are now a seller!',
      user: req.user
    });
  } catch (error) {
    console.error('Become seller error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  sellerRegister,
  buyerRegister,
  login,
  getProfile,
  updateProfile,
  updatePaymentSettings,
  getPaymentSettings,
  getPublicProfile,
  becomeSeller
};
