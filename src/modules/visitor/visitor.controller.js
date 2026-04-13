const fs = require('fs');
const csv = require('csv-parser');
const visitorService = require('./visitor.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/customError');

const createVisitor = asyncHandler(async (req, res) => {
  const visitor = await visitorService.createVisitor(req.body);
  res.send(new ApiResponse(201, visitor, 'Visitor registered successfully'));
});

const getVisitors = asyncHandler(async (req, res) => {
  const { eventId, search, page, limit, status } = req.query;
  const result = await visitorService.queryVisitors({ eventId, search, status }, { page, limit });
  res.send(new ApiResponse(200, result, 'Visitors retrieved successfully'));
});

const getVisitor = asyncHandler(async (req, res) => {
  const visitor = await visitorService.getVisitorById(req.params.visitorId);
  if (!visitor) throw new ApiError(404, 'Visitor not found');
  res.send(new ApiResponse(200, visitor, 'Visitor retrieved successfully'));
});

const updateVisitor = asyncHandler(async (req, res) => {
  const visitor = await visitorService.updateVisitorById(req.params.visitorId, req.body);
  res.send(new ApiResponse(200, visitor, 'Visitor updated successfully'));
});

const checkIn = asyncHandler(async (req, res) => {
  const visitor = await visitorService.checkInVisitor(req.params.visitorId);
  res.send(new ApiResponse(200, visitor, 'Visitor checked in successfully'));
});

const checkOut = asyncHandler(async (req, res) => {
  const visitor = await visitorService.checkOutVisitor(req.params.visitorId);
  res.send(new ApiResponse(200, visitor, 'Visitor checked out successfully'));
});

const bulkUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a CSV file');
  }

  if (!req.body.eventId) {
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw new ApiError(400, 'eventId is required for bulk upload');
  }

  const filePath = req.file.path;
  const rawVisitors = [];
  const processedVisitors = [];
  const errors = [];

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => rawVisitors.push(data))
        .on('error', reject)
        .on('end', resolve);
    });

    if (!rawVisitors.length) {
      throw new ApiError(400, 'Uploaded CSV contains no visitor records');
    }

    // Per-row validation
    rawVisitors.forEach((row, index) => {
      const { name, email, phone } = row;
      if (!name || !email) {
        errors.push({ line: index + 2, message: 'Missing core identity (name or email)' });
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push({ line: index + 2, message: `Invalid email format: ${email}` });
        return;
      }

      processedVisitors.push({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: (phone || '').trim(),
        ticketType: row.ticketType || 'Standard',
        metadata: { ...row } // Preserve extra data
      });
    });

    if (!processedVisitors.length) {
      throw new ApiError(400, 'All records in CSV failed identity validation', { errors });
    }

    const savedVisitors = await visitorService.bulkUpload(processedVisitors, req.body.eventId);
    
    res.send(new ApiResponse(201, {
      summary: {
        total: rawVisitors.length,
        success: savedVisitors.length,
        failed: errors.length
      },
      errors: errors.slice(0, 10) // Return first 10 errors for brevity
    }, 'Batch intake processed with isolation integrity'));

  } finally {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.error('Failed to cleanup upload file:', cleanupError);
    }
  }
});

const scoreVisitor = asyncHandler(async (req, res) => {
  const visitor = await visitorService.scoreVisitor(req.params.visitorId);
  res.send(new ApiResponse(200, visitor, 'Visitor scored successfully'));
});

const approveVisitor = asyncHandler(async (req, res) => {
  const visitor = await visitorService.approveVisitor(req.params.visitorId);
  res.send(new ApiResponse(200, visitor, 'Visitor booking approved successfully'));
});

const getMyBookings = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const filter = { email: req.user.email };
  const result = await visitorService.queryVisitors(filter, { page, limit });
  res.send(new ApiResponse(200, result, 'Your bookings retrieved successfully'));
});

module.exports = {
  createVisitor,
  getVisitors,
  getVisitor,
  updateVisitor,
  checkIn,
  checkOut,
  bulkUpload,
  scoreVisitor,
  approveVisitor,
  getMyBookings
};
