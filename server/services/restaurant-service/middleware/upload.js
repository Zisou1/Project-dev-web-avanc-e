const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirMenus = 'uploads/menus';
const uploadDirItems = 'uploads/items';
if (!fs.existsSync(uploadDirMenus)) {
  fs.mkdirSync(uploadDirMenus, { recursive: true });
}
if (!fs.existsSync(uploadDirItems)) {
  fs.mkdirSync(uploadDirItems, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on the route
    let uploadDir;
    if (req.originalUrl.includes('/item/')) {
      uploadDir = uploadDirItems;
    } else if (req.originalUrl.includes('/menu/')) {
      uploadDir = uploadDirMenus;
    } else {
      uploadDir = uploadDirMenus; // default fallback
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Determine filename prefix based on the route
    let prefix;
    if (req.originalUrl.includes('/item/')) {
      prefix = 'item';
    } else if (req.originalUrl.includes('/menu/')) {
      prefix = 'menu';
    } else {
      prefix = 'upload'; // default fallback
    }
    const filename = `${prefix}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

module.exports = upload;
