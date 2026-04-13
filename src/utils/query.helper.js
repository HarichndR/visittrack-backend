/**
 * Helper to handle pagination, sorting, and performance optimizations (.lean)
 * @param {Object} model - Mongoose Model
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options (page, limit, sort, populate)
 */
const paginate = async (model, filter = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(options.limit, 10) || 50));
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  const query = model.find(filter).sort(sort).skip(skip).limit(limit).lean();

  if (options.populate) {
    query.populate(options.populate);
  }

  const [results, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter).exec(),
  ]);

  return {
    results,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  };
};

module.exports = {
  paginate,
};
