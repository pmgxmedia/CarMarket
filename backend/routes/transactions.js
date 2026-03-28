const express = require('express');
const auth = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');
const { getTransaction, uploadSaleDocument, uploadDeliveryPhoto, getMyTransactions } = require('../controllers/transactionController');

const router = express.Router();

router.get('/', auth, getMyTransactions);

router.get('/:id', auth, getTransaction);

router.post('/:id/document', auth, uploadDocument.single('document'), uploadSaleDocument);

router.post('/:id/delivery-photo', auth, uploadDocument.single('photo'), uploadDeliveryPhoto);

module.exports = router;
