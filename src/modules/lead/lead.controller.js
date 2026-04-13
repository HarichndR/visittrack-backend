const leadService = require('./lead.service');
const exhibitorService = require('../exhibitor/exhibitor.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/customError');
const pick = require('../../utils/pick');

const createLead = asyncHandler(async (req, res) => {
  const leadBody = { ...req.body };

  // If user is an exhibitor, auto-resolve their exhibitor profile
  if (req.user && req.user.role === 'EXHIBITOR') {
    const exhibitor = await exhibitorService.getExhibitorByUserId(req.user.id);
    if (!exhibitor) {
      throw new ApiError(404, 'Exhibitor profile not found for this user');
    }
    leadBody.exhibitorId = exhibitor._id;
    leadBody.eventId = exhibitor.eventId;
  }

  // Capture the user who performed the scan
  leadBody.capturedBy = req.user.id;

  const lead = await leadService.createLead(leadBody);
  res.status(201).send(new ApiResponse(201, lead, 'Lead captured successfully'));
});

const getLeads = asyncHandler(async (req, res) => {
  const filter = pick(req.query, ['exhibitorId', 'eventId', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // If user is an exhibitor, enforce their exhibitorId in the filter
  if (req.user && req.user.role === 'EXHIBITOR') {
    const exhibitor = await exhibitorService.getExhibitorByUserId(req.user.id);
    if (!exhibitor) {
      throw new ApiError(404, 'Exhibitor profile not found');
    }
    filter.exhibitorId = exhibitor._id;
  }

  const result = await leadService.queryLeads(filter, options);
  res.send(new ApiResponse(200, result, 'Leads retrieved successfully'));
});

const getLead = asyncHandler(async (req, res) => {
  const lead = await leadService.getLeadById(req.params.leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  // Security Check: Data Isolation
  if (req.user.role === 'EXHIBITOR') {
    const exhibitor = await exhibitorService.getExhibitorByUserId(req.user.id);
    if (!exhibitor || lead.exhibitorId.toString() !== exhibitor._id.toString()) {
      throw new ApiError(403, 'Unauthorized to access this lead');
    }
  }

  res.send(new ApiResponse(200, lead, 'Lead retrieved successfully'));
});

const deleteLead = asyncHandler(async (req, res) => {
  // Verify ownership before deletion
  const lead = await leadService.getLeadById(req.params.leadId);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  if (req.user.role === 'EXHIBITOR') {
    const exhibitor = await exhibitorService.getExhibitorByUserId(req.user.id);
    if (!exhibitor || lead.exhibitorId.toString() !== exhibitor._id.toString()) {
      throw new ApiError(403, 'Unauthorized to delete this lead');
    }
  }

  await leadService.deleteLeadById(req.params.leadId);
  res.status(204).send(new ApiResponse(204, null, 'Lead deleted successfully'));
});

const workerService = require('../../services/worker.service');

const exportLeads = asyncHandler(async (req, res) => {
  const filter = pick(req.query, ['exhibitorId', 'eventId', 'status']);
  
  if (req.user && req.user.role === 'EXHIBITOR') {
    const exhibitor = await exhibitorService.getExhibitorByUserId(req.user.id);
    if (!exhibitor) {
      throw new ApiError(404, 'Exhibitor profile not found');
    }
    filter.exhibitorId = exhibitor._id;
  }

  // Fetch all matching leads without pagination for export
  const leads = await leadService.queryLeads(filter, { limit: 10000 }); // Reasonable cap for peak load
  
  // Offload CSV generation to a worker thread
  const csvData = await workerService.exportLeadsToCsv(leads);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=leads_export.csv');
  res.status(200).send(csvData);
});

module.exports = {
  createLead,
  getLeads,
  getLead,
  deleteLead,
  exportLeads,
};
