const { readDB, writeDB } = require('../db');

// @desc    Perform an investment
// @route   POST /api/invest
const invest = async (req, res) => {
    const { userId, amount } = req.body;
    const db = readDB();
    const userIndex = db.users.findIndex(u => u._id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Astro Cadet not found!' });
    }

    const user = db.users[userIndex];

    if (user.balance < amount) {
        return res.status(400).json({ message: 'Insufficient Credits!' });
    }

    // Dynamic Profit/Loss Logic
    const win = Math.random() > 0.3; // 70% chance to profit
    let finalAmount = 0;
    if (win) {
        // Gain: 1.1x to 2.5x
        finalAmount = Math.floor(amount * (Math.random() * 1.4 + 1.1));
    } else {
        // Loss: 0.2x to 0.8x
        finalAmount = Math.floor(amount * (Math.random() * 0.6 + 0.2));
    }

    const diff = finalAmount - amount;
    user.balance += diff;
    user.totalProfit = (user.totalProfit || 0) + diff;

    // Update Profit Streak Logic
    if (diff >= 0) {
        user.streak = (user.streak || 0) + 1;
    } else {
        user.streak = 0;
    }

    // XP based on trade volume and outcome
    const xpGained = Math.max(50, Math.floor(Math.abs(diff) * 2));
    user.xp += xpGained;

    // Level up logic
    const xpToNext = user.xpToNext || 1000;
    if (user.xp >= xpToNext) {
        user.level += 1;
        user.xp -= xpToNext;
        user.xpToNext = Math.floor(xpToNext * 1.2);
    }

    // Record transaction
    user.history.push({
        type: diff >= 0 ? 'Profit' : 'Loss',
        amount: Math.abs(diff),
        xpGained,
        date: new Date().toISOString()
    });

    db.users[userIndex] = user;
    writeDB(db);

    res.json(user);
};

const getMissions = (req, res) => {
    const db = readDB();
    res.json(db.missions || []);
};

const getGoals = (req, res) => {
    const { userId } = req.query;
    const db = readDB();
    if (!userId) return res.json(db.goals || []); // Fallback for legacy
    const userGoals = (db.goals || []).filter(g => g.userId === userId);
    res.json(userGoals);
};

const addGoal = (req, res) => {
    const { name, cost, userId } = req.body;
    if (!name || !cost || !userId) {
        return res.status(400).json({ message: 'Goal name, cost, and userId are required!' });
    }
    const db = readDB();
    const newGoal = { name, cost: Number(cost), userId };
    db.goals = db.goals || [];
    db.goals.push(newGoal);
    writeDB(db);
    
    // Return only this user's goals
    const userGoals = db.goals.filter(g => g.userId === userId);
    res.json(userGoals);
};

module.exports = { invest, getMissions, getGoals, addGoal };
