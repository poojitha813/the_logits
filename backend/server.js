const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure database.json exists
const DB_PATH = path.join(__dirname, 'data', 'database.json');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], goals: [], pendingUsers: [] }, null, 2));
}

// Routes v3.0 - Quantum Advisor Integrated
const authRoutes = require('./routes/authRoutes');
const investRoutes = require('./routes/investRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/invest', investRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 InvestQuest Server flying on port ${PORT}`);
    console.log(`📂 Persistent Storage: ${DB_PATH}`);
});
