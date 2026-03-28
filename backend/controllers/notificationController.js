const Notification = require('../models/Notification');
const { buildPaginationResponse } = require('../utils/responseUtils');

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    
    const query = { userId: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .select('type title message relatedAdId read createdAt metadata')
        .populate('relatedAdId', 'make model images')
        .populate('relatedUserId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: req.user._id, read: false })
    ]);

    res.json({
      notifications,
      unreadCount,
      ...buildPaginationResponse(notifications, total, { page: pageNum, limit: limitNum })
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    ).select('type title message relatedAdId read createdAt');

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({ 
      message: 'All notifications marked as read.',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.json({ message: 'Notification deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
