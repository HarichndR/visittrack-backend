const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const { generateQR } = require('../../utils/qrGenerator');
const Visitor = require('../visitor/visitor.model');
const Exhibitor = require('../exhibitor/exhibitor.model');
const ApiError = require('../../utils/customError');

const getVisitorQR = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.visitorId);
  if (!visitor) {
    throw new ApiError(404, 'Visitor not found');
  }

  // QR data contains visitor ID for scanning at booths
  const qrData = await generateQR(visitor._id.toString());
  
  res.send(new ApiResponse(200, { qrData }, 'Visitor QR generated successfully'));
});

const getExhibitorQR = asyncHandler(async (req, res) => {
  const exhibitor = await Exhibitor.findById(req.params.exhibitorId);
  if (!exhibitor) {
    throw new ApiError(404, 'Exhibitor not found');
  }

  // QR data contains exhibitor ID for visitors to scan booths
  const qrData = await generateQR(exhibitor._id.toString());

  res.send(new ApiResponse(200, { qrData }, 'Exhibitor QR generated successfully'));
});

module.exports = {
  getVisitorQR,
  getExhibitorQR,
};
