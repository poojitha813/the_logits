const express = require('express');
const router = express.Router();
const { invest, getMissions, getGoals, addGoal } = require('../controllers/investController');
const { protect } = require('../middleware/auth');

// Public routes for data
router.get('/missions', getMissions);
router.get('/goals', getGoals);

// Protected routes
router.post('/', protect, invest);
router.post('/goals', protect, addGoal);

module.exports = router;
