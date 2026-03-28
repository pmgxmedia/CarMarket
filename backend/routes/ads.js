const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const adLimitCheck = require('../middleware/adLimitCheck');
const { cached } = require('../services/cacheService');
const { createAd, getAds, getAdById, updateAd, deleteAd, publishAd, getMyAds } = require('../controllers/adController');

const router = express.Router();

router.post('/', auth, roleCheck('seller'), adLimitCheck, [
  body('category').isIn(['car', 'bike', 'commercial']).withMessage('Invalid category'),
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
  body('fuelType').isIn(['petrol', 'diesel', 'electric', 'cng', 'hybrid']).withMessage('Invalid fuel type'),
  body('transmission').isIn(['manual', 'automatic']).withMessage('Invalid transmission'),
  body('kmDriven').isInt({ min: 0 }).withMessage('Invalid km driven'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('askingPrice').isInt({ min: 1000 }).withMessage('Invalid asking price'),
  body('description').isLength({ min: 50 }).withMessage('Description must be at least 50 characters')
], createAd);

router.get('/', auth, cached('ads', 60), getAds);

router.get('/my-ads', auth, roleCheck('seller'), getMyAds);

router.get('/:id', auth, getAdById);

router.put('/:id', auth, roleCheck('seller'), updateAd);

router.delete('/:id', auth, roleCheck('seller'), deleteAd);

router.post('/:id/publish', auth, roleCheck('seller'), publishAd);

module.exports = router;
