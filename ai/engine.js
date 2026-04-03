const analyzeState = (user) => {
    const { balance, xp, level, streak } = user;
    if (balance < 500) {
        return { advice: "🚨 EMERGENCY: Fuel levels critical! Stop all high-risk activity and focus on 'Manual Mining' (Micro-Savings) to rebuild your shield.", priority: "HIGH" };
    }
    if (streak > 3) {
        return { advice: "🚀 STELLAR OPPORTUNITY: Your 3-day streak has unlocked a 'Quantum Multiplier'. Deploy ₹50 now for 2x XP!", priority: "MEDIUM" };
    }
    return { advice: "🌠 STEADY ORBIT: Tracking your progress. You are " + (1000 - (xp % 1000)) + " XP away from Level " + (level + 1) + ".", priority: "LOW" };
};

const getChatResponse = (message, user) => {
    if (!message || typeof message !== 'string') return { response: "Primary communications link degraded... please try again, Cadet." };
    const msg = message.toLowerCase().trim();

    // User Stats
    const balance = user?.balance ?? 0;
    const xp = user?.xp ?? 0;
    const level = user?.level ?? 0;
    const streak = user?.streak ?? 0;

    // 1. STATS & STATUS (Prioritize specific queries)
    if (msg.includes("history") || msg.includes("last missions") || msg.includes("transmissions")) {
        const rows = (user.history || []).slice(-5).reverse().map(h => [
            new Date(h.date).toLocaleDateString(),
            h.type,
            `₹${h.amount}`,
            "SUCCESS"
        ]);
        return {
            response: `Generating mission logs... Accessing data for ${user.name || 'Cadet'}. Here are your recent transmissions:`,
            vizType: 'table',
            vizData: { columns: ["Date", "Type", "Amount", "Status"], rows }
        };
    }
    if (msg.includes("streak")) {
        return { response: `Your current streak is ${streak} days! 🔥 Keep it up to unlock more 'Quantum Multipliers'.` };
    }
    if (msg.includes("balance") || msg.includes("credits") || msg.includes("money") || msg.includes("how much")) {
        return {
            response: `Your current credit balance is ₹${balance.toLocaleString()}. You're doing great, Cadet!`,
            vizType: 'bar',
            vizData: [
                { label: "Balance", value: `₹${balance}`, percent: Math.min((balance / 5000) * 100, 100), color: "#39ff14" },
                { label: "Target", value: "₹5000", percent: 100, color: "rgba(255,255,255,0.1)" }
            ]
        };
    }
    if (msg.includes("level") || msg.includes("xp") || msg.includes("rank")) {
        return { response: `You are Level ${level} with ${xp} XP. You need ${1000 - (xp % 1000)} more XP to reach the next tier!` };
    }

    // 2. KNOWLEDGE & GUIDANCE
    if (msg.includes("save") || msg.includes("how to start") || msg.includes("begin")) {
        return { response: "To start your journey, use the 'Quick Explore' button (₹10). Consistency is more important than amount for building a Galactic Empire!" };
    }
    if (msg.includes("invest") || msg.includes("properly") || msg.includes("advice")) {
        const state = analyzeState(user);
        return { response: `My tactical analysis: ${state.advice} Basically, start small and build your shield (balance).` };
    }
    if (msg.includes("crypto") || msg.includes("quantum")) {
        return { response: `Quantum Crypto nodes are highly volatile! Only deploy if your 'Shield' (Balance) is above ₹1,000. Current Balance: ₹${balance}` };
    }
    if (msg.includes("gold") || msg.includes("nebula")) {
        return { response: "Nebula Gold is a safe mineral deposit. It protects your credits from cosmic inflation. Highly recommended for long-term survival." };
    }

    // 3. GREETINGS & SYSTEM
    if (msg.includes("hi") || msg.includes("hello") || msg.includes("greetings") || msg.includes("help") || msg.includes("who are you")) {
        return { response: "Greetings! I am your Astro-AI Strategic Advisor. I help you navigate the complex universe of finance. Ask me about saving, risks, your streak, or your current level!" };
    }

    if (balance <= 0) {
        return { response: "Warning: Your credit balance is ZERO. You cannot invest until you initiate 'Command Center' deposit or earn referral XP." };
    }

    return { response: "Affirmative, Cadet. Analysis suggests you continue your mission. Ask me specific details about your streak, balance, or saving strategy!" };
};

module.exports = { analyzeState, getChatResponse };