const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoalProgress } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

// Protected routes for missions
router.get('/', protect, getGoals);
router.post('/', protect, createGoal);
router.put('/progress', protect, updateGoalProgress);

module.exports = router;
