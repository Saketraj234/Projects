const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePinStatus
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getNotes)
  .post(protect, createNote);

router
  .route('/:id')
  .get(protect, getNote)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

router
  .route('/:id/pin')
  .patch(protect, togglePinStatus);

module.exports = router;