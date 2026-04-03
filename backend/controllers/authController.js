const { readDB, writeDB } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// @desc    Register Request
// @route   POST /api/auth/register-request
const registerRequest = async (req, res) => {
    const { name, email, password, gender } = req.body;
    const db = readDB();
    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Astro Cadet already exists!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    db.pendingUsers = db.pendingUsers || [];
    const existingPending = db.pendingUsers.findIndex(u => u.email === email);
    
    const pendingUser = { name, email, password: hashedPassword, avatar: avatarUrl, otp };
    
    if (existingPending >= 0) {
        db.pendingUsers[existingPending] = pendingUser;
    } else {
        db.pendingUsers.push(pendingUser);
    }
    writeDB(db);

    try {
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email", port: 587, secure: false, 
            auth: { user: testAccount.user, pass: testAccount.pass },
        });

        let info = await transporter.sendMail({
            from: '"InvestQuest HQ" <admin@investquest.com>',
            to: email, 
            subject: "InvestQuest Activation Code", 
            text: `Your signup OTP is: ${otp}`, 
            html: `<h3>InvestQuest Command Center</h3><p>Your activation OTP is: <b>${otp}</b></p><p>Use this code to activate your new account.</p>`, 
        });

        console.log("\n=========================================");
        console.log("🚀 ACTIVATION EMAIL INTERCEPTED BY ETHEREAL");
        console.log(`👉 CLICK HERE TO VIEW EMAIL FOR ${email}:`);
        console.log(nodemailer.getTestMessageUrl(info));
        console.log("=========================================\n");

        res.json({ message: 'Activation Code Sent! Check your backend terminal for the link.', otp });
    } catch (error) {
        console.error("Failed to send activation email:", error);
        res.status(500).json({ message: 'Failed to send activation email.' });
    }
};

// @desc    Register Verify
// @route   POST /api/auth/register-verify
const registerVerify = async (req, res) => {
    const { email, otp } = req.body;
    const db = readDB();
    db.pendingUsers = db.pendingUsers || [];

    const pendingIndex = db.pendingUsers.findIndex(u => u.email === email);
    if (pendingIndex === -1) {
        return res.status(404).json({ message: 'No pending registration found for this email.' });
    }

    if (db.pendingUsers[pendingIndex].otp !== otp) {
        return res.status(400).json({ message: 'Invalid or expired OTP!' });
    }

    const pUser = db.pendingUsers[pendingIndex];

    const newUser = {
        _id: Date.now().toString(),
        name: pUser.name, email: pUser.email, password: pUser.password,
        balance: 1500.00, xp: 0, level: 1, totalProfit: 0, streak: 0,
        avatar: pUser.avatar,
        history: []
    };

    db.users.push(newUser);
    db.pendingUsers.splice(pendingIndex, 1);
    writeDB(db);

    res.status(201).json({
        ...newUser,
        token: generateToken(newUser._id)
    });
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            ...user,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid mission credentials!' });
    }
};

// @desc    Forgot Password (Real Email OTP)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Astro Cadet not found!' });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    db.users[userIndex].otp = otp;
    writeDB(db);

    try {
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        let info = await transporter.sendMail({
            from: '"InvestQuest HQ" <admin@investquest.com>',
            to: email, 
            subject: "InvestQuest Access Code Reset", 
            text: `Your secure OTP is: ${otp}`, 
            html: `<h3>InvestQuest Command Center</h3><p>Your secure OTP is: <b>${otp}</b></p><p>Use this code to reset your access in the portal.</p>`, 
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("\n=========================================");
        console.log("🚀 REAL EMAIL INTERCEPTED BY ETHEREAL");
        console.log(`👉 CLICK HERE TO VIEW THE EMAIL INBOX FOR ${email}:`);
        console.log(previewUrl);
        console.log("=========================================\n");

        res.json({ message: 'Secure OTP email has been sent successfully!', otp });
    } catch (error) {
        console.error("Failed to send email:", error);
        res.status(500).json({ message: 'Failed to send secure email.' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Astro Cadet not found!' });
    }

    if (db.users[userIndex].otp !== otp) {
        return res.status(400).json({ message: 'Invalid or expired OTP!' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    db.users[userIndex].password = hashedPassword;
    delete db.users[userIndex].otp; // clear OTP after use
    writeDB(db);

    res.json({ message: 'Access Code updated! You can now Log In.' });
};

// @desc    Get leaderboard
// @route   GET /api/auth/leaderboard
const getLeaderboard = async (req, res) => {
    const db = readDB();
    const sortedUsers = db.users
        .map(u => ({ name: u.name, xp: u.xp, level: u.level, avatar: u.avatar, totalProfit: u.totalProfit || 0 }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);
    res.json(sortedUsers);
};

module.exports = { registerRequest, registerVerify, loginUser, forgotPassword, resetPassword, getLeaderboard };
