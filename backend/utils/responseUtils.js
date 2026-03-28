const paginate = (query, options = {}) => {
  const { defaultPage = 1, defaultLimit = 20, maxLimit = 100 } = options;
  
  return async (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page) || defaultPage);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
    const skip = (page - 1) * limit;

    req.pagination = { page, limit, skip };
    next();
  };
};

const buildPaginationResponse = (data, total, { page, limit }) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  }
});

const selectFields = (fields) => ({ select: fields.split(',').join(' ') });

const transformResponse = (data, transformer) => {
  if (Array.isArray(data)) {
    return data.map(transformer);
  }
  return transformer(data);
};

const adListProjection = {
  default: 'sellerId images category make model year askingPrice location status createdAt',
  detailed: 'sellerId images category make model year variant fuelType transmission kmDriven color askingPrice location description status targetAudience createdAt'
};

const userListProjection = 'name email phone location role buyerType createdAt';

const notificationListProjection = 'type title message relatedAdId read createdAt';

const transactionListProjection = 'adId sellerId buyerId finalPrice status saleDocument deliveryPhoto createdAt';

module.exports = {
  paginate,
  buildPaginationResponse,
  selectFields,
  transformResponse,
  adListProjection,
  userListProjection,
  notificationListProjection,
  transactionListProjection
};
