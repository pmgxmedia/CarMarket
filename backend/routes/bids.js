const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { placeInitialBid, getBids, selectBuyersForInspection, placeFinalBid, getFinalBids, selectWinner, getMyBids, confirmInspection } = require('../controllers/bidController');

const router = express.Router();

router.post('/:id/initial-bid', auth, [
  body('amount').isInt({ min: 1000 }).withMessage('Minimum bid is R1,000')
], placeInitialBid);

router.get('/:id/bids', auth, roleCheck('seller'), getBids);

router.post('/:id/select', auth, roleCheck('seller'), [
  body('buyerIds').isArray({ min: 1 }).withMessage('Select at least one buyer'),
  body('inspectionDateStart').isISO8601().withMessage('Invalid inspection start date'),
  body('inspectionDateEnd').isISO8601().withMessage('Invalid inspection end date')
], selectBuyersForInspection);

router.post('/:id/confirm-inspection', auth, confirmInspection);

router.post('/:id/final-bid', auth, [
  body('amount').isInt({ min: 1000 }).withMessage('Minimum bid is R1,000')
], placeFinalBid);

router.get('/:id/final-bids', auth, roleCheck('seller'), getFinalBids);

router.post('/:id/winner', auth, roleCheck('seller'), [
  body('buyerId').notEmpty().withMessage('Buyer ID is required'),
  body('pickupDate').isISO8601().withMessage('Invalid pickup date'),
  body('paymentDeadline').isISO8601().withMessage('Invalid payment deadline')
], selectWinner);

router.get('/my-bids', auth, getMyBids);

module.exports = router;
