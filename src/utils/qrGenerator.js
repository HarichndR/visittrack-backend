const QRCode = require('qrcode');
const logger = require('./logger');

/**
 * Generate QR code as a data URI
 * @param {string} text
 * @returns {Promise<string>}
 */
const generateQR = async (text) => {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    logger.error(`Error generating QR: ${err.message}`);
    throw err;
  }
};

module.exports = {
  generateQR,
};
