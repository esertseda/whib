import express from 'express';
const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');

router.post('/image', upload.single('image'), (req, res) => {
  res.json({ imageUrl: req.file.path });
});

export default router;
