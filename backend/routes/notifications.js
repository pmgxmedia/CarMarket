const express = require('express');
const auth = require('../middleware/auth');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', auth, getNotifications);

router.put('/:id/read', auth, markAsRead);

router.put('/read-all', auth, markAllAsRead);

router.delete('/:id', auth, deleteNotification);

module.exports = router;
