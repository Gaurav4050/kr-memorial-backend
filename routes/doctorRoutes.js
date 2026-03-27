const express = require('express');
const { addDoctor, getDoctors, deleteDoctor } = require('../controllers/doctorController');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getDoctors); // Public
router.post('/', protect, upload.single('image'), addDoctor); // Protected Admin
router.delete('/:id', protect, deleteDoctor); // Protected Admin

module.exports = router;
