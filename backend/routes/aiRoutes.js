const express = require('express');
const router = express.Router();
const { getAIResponse } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Protected route for AI Chatbot
router.post('/chat', protect, getAIResponse);

module.exports = router;
