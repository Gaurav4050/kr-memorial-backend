const express = require('express');
const {
  submitContact,
  getAllContacts,
  getContact,
  updateContact,
} = require('../controllers/contactController');

const router = express.Router();

// Public routes
router.post('/', submitContact);

// Admin routes
router.get('/', getAllContacts);
router.get('/:id', getContact);
router.put('/:id', updateContact);

module.exports = router;
