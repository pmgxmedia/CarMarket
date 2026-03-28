const Notification = require('../models/Notification');

const createNotification = async (data) => {
  try {
    const notification = new Notification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedAdId: data.relatedAdId,
      relatedUserId: data.relatedUserId
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

const sendNewAdNotification = async (buyer, ad) => {
  const notification = await createNotification({
    userId: buyer._id,
    type: 'new_ad',
    title: 'New Ad Available!',
    message: `A new ${ad.category} matching your interest is available: ${ad.make} ${ad.model}`,
    relatedAdId: ad._id
  });

  if (global.io) {
    global.io.to(`user_${buyer._id}`).emit('notification:new', notification);
  }

  return notification;
};

const sendBidReceivedNotification = async (sellerId, ad, buyer, amount) => {
  const notification = await createNotification({
    userId: sellerId,
    type: 'bid_received',
    title: 'New Bid Received!',
    message: `${buyer.name} placed a bid for ${ad.make} ${ad.model}`,
    relatedAdId: ad._id,
    relatedUserId: buyer._id,
    metadata: { amount, type: 'bid_received', buyerName: buyer.name, car: `${ad.make} ${ad.model}` }
  });

  if (global.io) {
    global.io.to(`user_${sellerId}`).emit('notification:new', notification);
    global.io.to(`user_${sellerId}`).emit('bid:received', { adId: ad._id, bid: notification });
  }

  return notification;
};

const sendInspectionNotification = async (buyerId, ad) => {
  const notification = await createNotification({
    userId: buyerId,
    type: 'inspection',
    title: 'Selected for Inspection!',
    message: `Congratulations! You have been selected for inspection of ${ad.make} ${ad.model}. Please confirm your availability.`,
    relatedAdId: ad._id
  });

  if (global.io) {
    global.io.to(`user_${buyerId}`).emit('notification:new', notification);
    global.io.to(`user_${buyerId}`).emit('bid:selected', { adId: ad._id });
  }

  return notification;
};

const sendNotSelectedNotification = async (buyerId, ad) => {
  const notification = await createNotification({
    userId: buyerId,
    type: 'bid_received',
    title: 'Update on Your Bid',
    message: `Your bid for ${ad.make} ${ad.model} was not selected for this round.`,
    relatedAdId: ad._id
  });

  if (global.io) {
    global.io.to(`user_${buyerId}`).emit('notification:new', notification);
  }

  return notification;
};

const sendWinnerNotification = async (buyerId, ad) => {
  const notification = await createNotification({
    userId: buyerId,
    type: 'winner',
    title: 'Congratulations! You Won!',
    message: `Your bid for ${ad.make} ${ad.model} has been accepted. Please complete the payment by ${new Date(ad.paymentDeadline).toLocaleDateString()}.`,
    relatedAdId: ad._id,
    metadata: { finalPrice: ad.finalPrice, paymentDeadline: ad.paymentDeadline, type: 'winner', car: `${ad.make} ${ad.model}` }
  });

  if (global.io) {
    global.io.to(`user_${buyerId}`).emit('notification:new', notification);
    global.io.to(`user_${buyerId}`).emit('bid:won', { adId: ad._id, finalPrice: ad.finalPrice });
  }

  return notification;
};

const sendTransactionCompletedNotification = async (userId, ad) => {
  const notification = await createNotification({
    userId,
    type: 'new_ad',
    title: 'Transaction Completed!',
    message: `The transaction for ${ad.make} ${ad.model} has been completed successfully.`,
    relatedAdId: ad._id
  });

  if (global.io) {
    global.io.to(`user_${userId}`).emit('notification:new', notification);
  }

  return notification;
};

module.exports = {
  createNotification,
  sendNewAdNotification,
  sendBidReceivedNotification,
  sendInspectionNotification,
  sendNotSelectedNotification,
  sendWinnerNotification,
  sendTransactionCompletedNotification
};
