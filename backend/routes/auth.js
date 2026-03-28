const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { sellerRegister, buyerRegister, login, getProfile, updateProfile, updatePaymentSettings, getPaymentSettings, getPublicProfile, becomeSeller } = require('../controllers/authController');

const router = express.Router();

router.post('/seller/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('productTypes').isArray({ min: 1 }).withMessage('Select at least one product type')
], sellerRegister);

router.post('/buyer/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('category').isArray({ min: 1 }).withMessage('Select at least one category'),
  body('buyerType').isIn(['individual', 'business', 'other']).withMessage('Invalid buyer type')
], buyerRegister);

router.post('/admin/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('secretKey').equals(process.env.ADMIN_SECRET_KEY || 'admin-secret-key').withMessage('Invalid admin key')
], async (req, res) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const User = require('../models/User');
  const jwt = require('jsonwebtoken');
  const { name, email, phone, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    
    const user = new User({
      role: 'admin',
      name,
      email,
      phone,
      password,
      location: 'N/A'
    });
    
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    res.status(201).json({
      message: 'Admin registered successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Admin register error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.get('/profile', auth, getProfile);

router.put('/profile', auth, updateProfile);

router.get('/profile/:id', auth, getPublicProfile);

router.get('/payment-settings', auth, getPaymentSettings);

router.put('/payment-settings', auth, updatePaymentSettings);

router.post('/become-seller', auth, becomeSeller);

module.exports = router;
