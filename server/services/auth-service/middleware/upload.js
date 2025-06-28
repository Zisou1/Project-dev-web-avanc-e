const multer = require('multer');

// Simple memory storage for passing files through to restaurant service
// No validation needed here since restaurant service will handle it
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

module.exports = upload;
