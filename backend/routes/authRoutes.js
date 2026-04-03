const express = require('express');
const router = express.Router();
const { loginUser, registerRequest, registerVerify, forgotPassword, resetPassword, getLeaderboard } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/register-request', registerRequest);
router.post('/register-verify', registerVerify);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
