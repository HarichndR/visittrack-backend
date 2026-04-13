const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../../utils/cloudinary');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const auth = require('../../middleware/auth.middleware');
const ApiError = require('../../utils/customError');
const fs = require('fs-extra');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', auth(), upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a file');
  }

  try {
    const result = await uploadImage(req.file.path, 'visitrack/media');
    
    // Clean up local file
    await fs.remove(req.file.path);

    res.send(new ApiResponse(200, {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes
    }, 'File uploaded successfully to cloud storage'));
  } catch (error) {
    // Ensure cleanup even on failure
    if (req.file.path) await fs.remove(req.file.path);
    throw error;
  }
}));

module.exports = router;
