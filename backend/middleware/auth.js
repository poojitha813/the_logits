const jwt = require('jsonwebtoken');
const { readDB } = require('../db');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            const db = readDB();
            const user = db.users.find(u => u._id === decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'Astro Cadet not found' });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, mission compromised' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no access token' });
    }
};

module.exports = { protect };
