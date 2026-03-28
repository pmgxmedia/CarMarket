const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getStats, getAllUsers, suspendUser, getAllAds, deleteAd, getAllTransactions } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', auth, roleCheck('admin'), getStats);

router.get('/users', auth, roleCheck('admin'), getAllUsers);

router.put('/users/:id/suspend', auth, roleCheck('admin'), suspendUser);

router.get('/ads', auth, roleCheck('admin'), getAllAds);

router.delete('/ads/:id', auth, roleCheck('admin'), deleteAd);

router.get('/transactions', auth, roleCheck('admin'), getAllTransactions);

module.exports = router;
