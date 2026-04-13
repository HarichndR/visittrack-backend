const mongoose = require('mongoose');
const Lead = require('./lead.model');
const Exhibitor = require('../exhibitor/exhibitor.model');
const NurtureLog = require('../nurture/nurture.model');
const ApiError = require('../../utils/customError');

const scanLocks = new Set();

/**
 * Create a lead
 * @param {Object} leadBody
 * @returns {Promise<Lead>}
 */
const createLead = async (leadBody) => {
  const lockKey = `${leadBody.visitorId}_${leadBody.exhibitorId}`;
  
  if (scanLocks.has(lockKey)) {
    throw new ApiError(400, 'Lead capture currently processing for this visitor');
  }
  
  scanLocks.add(lockKey);

  try {
    if (await Lead.findOne({ visitorId: leadBody.visitorId, exhibitorId: leadBody.exhibitorId })) {
      throw new ApiError(400, 'Lead already captured for this visitor');
    }

    // Fetch visitor data for snapshot
    const visitor = await mongoose.model('Visitor').findById(leadBody.visitorId);
    if (visitor) {
      // Attempt to enrich with User record data if available
      const user = await mongoose.model('User').findOne({ email: visitor.email });
      
      leadBody.visitorSnapshot = {
        name: visitor.name || user?.name,
        email: visitor.email,
        phone: visitor.phone || user?.phone,
        profession: visitor.profession || user?.profession,
        interests: (visitor.interests && visitor.interests.length > 0) ? visitor.interests : user?.interests,
        ticketType: visitor.ticketType
      };
    }

    let lead;
    try {
      lead = await Lead.create(leadBody);
    } catch (err) {
      if (err.code === 11000) {
        throw new ApiError(400, 'Lead already captured for this visitor');
      }
      throw err;
    }

    // Real-world logic: Automated Nurturing (Digital Asset Delivery)
    try {
      const exhibitor = await Exhibitor.findById(leadBody.exhibitorId);
      if (exhibitor && exhibitor.digitalAssets && exhibitor.digitalAssets.length > 0) {
        await NurtureLog.create({
          leadId: lead._id,
          visitorId: leadBody.visitorId,
          exhibitorId: leadBody.exhibitorId,
          assetsSent: exhibitor.digitalAssets.map(a => ({ name: a.name, url: a.url })),
          status: 'SENT'
        });
      }
    } catch (error) {
      console.error('Nurture automation failed:', error);
    }

    return lead;
  } finally {
    scanLocks.delete(lockKey);
  }
};

/**
 * Query leads
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryLeads = async (filter, options) => {
  const leads = await Lead.find(filter)
    .populate('visitorId', 'name email company profession interests')
    .populate('eventId', 'name')
    .sort(options.sortBy || '-createdAt')
    .limit(options.limit || 100)
    .skip(options.skip || 0);
  return leads;
};

/**
 * Get lead by id
 * @param {ObjectId} id
 * @returns {Promise<Lead>}
 */
const getLeadById = async (id) => {
  return Lead.findById(id).populate('visitorId eventId exhibitorId');
};

/**
 * Delete lead by id
 * @param {ObjectId} leadId
 * @returns {Promise<Lead>}
 */
const deleteLeadById = async (leadId) => {
  const lead = await getLeadById(leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }
  await lead.deleteOne();
  return lead;
};

module.exports = {
  createLead,
  queryLeads,
  getLeadById,
  deleteLeadById,
};
