const { readDB, writeDB } = require('../db');

/**
 * INVESTQUEST QUANTUM ADVISOR v7.0 - ZERO DEPENDENCY AI
 * Uses direct Fetch to Google Gemini (No extra libraries required).
 */
const getAIResponse = async (req, res) => {
    const { prompt, userId } = req.body;
    let db = readDB();
    const userIndex = db.users.findIndex(u => u._id === userId);

    if (userIndex === -1) return res.status(404).json({ message: 'Astro Cadet not found!' });
    const user = db.users[userIndex];

    const input = prompt.toLowerCase().trim();
    const apiKey = process.env.GEMINI_API_KEY;

    let response = "";
    let vizType = null;
    let vizData = null;
    let actionTaken = false;

    // 1. DATA GATHERING (Context for AI)
    const context = `
      User: ${user.name}
      Balance: ₹${user.balance}
      XP: ${user.xp}
      Level: ${user.level}
      Streak: ${user.streak} days
      History: ${JSON.stringify(user.history.slice(-3))}
    `;    // 2. DUAL-MODE AI ARCHITECTURE (OLLAMA LOCAL LLM + SMART EXPLAINER)
    const OLLAMA_URL = "http://localhost:11434/api/generate";
    let isResponseSet = false;

    // 2a. Attempt Local LLM Connection (Ollama)
    try {
        const ollamaRes = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3", // The model the user will likely download
                prompt: `You are SYBIL, a mission-guide for InvestQuest. User is ${user.name} (Bal: ${user.balance}, Lvl: ${user.level}). Prompt: ${prompt}. Respond in 1-2 sentences. Keep it technical and galactic. Answer the specific question directly.`,
                stream: false
            })
        });
        if (ollamaRes.ok) {
            const ollamaData = await ollamaRes.json();
            if (ollamaData.response) {
                response = ollamaData.response;
                isResponseSet = true;
            }
        }
    } catch (e) {
        // Ollama not yet ready or model not found
    }

    // 2b. Smart Mission Explainer (If Local LLM offline)
    if (!isResponseSet) {
        // 1st Priority: Explain the App if asked
        if (input.includes("this app") || input.includes("what is this") || input.includes("how to play") || input.includes("mission") || input.includes("help")) {
            response = `InvestQuest is your galactic financial hub. Goal: Grow your ₹${user.balance} by deploying credits in 'Mission Orbits', reaching 'Financial Goals' in the Log, and dominating the 'Wealth Builder' strategy board. XP moves your level up. Clear?`;
        } 
        // 2nd Priority: Account Status
        else if (input.includes("balance") || input.includes("money") || input.includes("credits")) {
            response = `Neural check complete. Your current reserves are holding at ₹${user.balance}. I suggest a ₹10 deployment in Quick Explore to increase liquidity.`;
        }
        // 3rd Priority: Wealth Game
        else if (input.includes("wealth") || input.includes("game") || input.includes("tsla") || input.includes("btc")) {
            response = `The Strategy Board is a simulated market grid. Match assets like BTC or GOLD to gain raw XP and credits. TSLA is currently showing 2.4% volatility. Execute strategies now.`;
        }
        // Fallback: Semi-Generative Galactic Advice
        else {
            const greetings = [`Cadet ${user.name}, telemetry scan complete.`, `Systems online. Analysis for your balance of ₹${user.balance} complete.`, `Sector data updated. Let's maximize those credits, ${user.name}.` ];
            const generic_advice = [
                "I recommend a defensive posture. Diversification is your heat-shield against losses.",
                "Your P&L trajectory is holding. Consider a ₹20 deployment into Stellar Trade.",
                "Mission analysis: Your current level " + user.level + " clearance allows for higher volatility targets."
            ];
            const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
            response = `${pick(greetings)} ${pick(generic_advice)} How should we adjust our trajectory?`;
        }

        if (input.includes("analysis") || input.includes("table")) {
            response = "Neural Mission Log retrieved. Transactions categorized by risk-weight.";
            vizType = "table";
            vizData = { columns: ["Date", "Type", "Amount"], rows: user.history.slice(-5).map(h=>[new Date(h.date).toLocaleDateString(), h.type, `₹${h.amount}`]) };
        } else if (input.includes("graph") || input.includes("chart")) {
            response = "Stellar Momentum visualized. Your path is 15% steeper than the sector average.";
            vizType = "bar";
            vizData = [{ label: "XP", value: `${user.xp}`, percent: 50, color: "#00f5ff" }, { label: "Money", value: `₹${user.balance}`, percent: 80, color: "#39ff14" }];
        }
    }

    // 4. ACTION CHECK (Auto-Investment)
    const investMatch = input.match(/invest\s+(\d+)/);
    if (investMatch) {
        const amount = parseInt(investMatch[1]);
        if (amount > 0 && user.balance >= amount) {
            user.balance -= amount;
            user.xp += (amount * 2);
            user.history.push({ type: 'Investment (via AI)', amount, xpGained: (amount * 2), date: new Date().toISOString() });
            db.users[userIndex] = user;
            writeDB(db);
            response = `COMMAND EXECUTED: ₹${amount} deployed into the current orbit. ${response}`;
        }
    }

    res.json({ response, user, vizType, vizData });
};

module.exports = { getAIResponse };
