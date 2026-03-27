const express = require('express');
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createAppointment); // Public route
router.get('/', protect, getAppointments); // Protected (Admin)
router.put('/:id/status', protect, updateAppointmentStatus); // Protected (Admin)

module.exports = router;
