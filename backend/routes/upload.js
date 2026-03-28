const express = require('express');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.post('/images', auth, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }
  
  const images = req.files.map((file, index) => ({
    url: `/uploads/${file.filename}`,
    publicId: file.filename,
    order: index
  }));
  
  res.json({ images });
});

router.post('/image', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  
  res.json({ 
    url: `/uploads/${req.file.filename}`,
    publicId: req.file.filename
  });
});

module.exports = router;
