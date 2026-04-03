import React, { useState, useEffect, useRef, useCallback } from 'react';
import TradingGame from './TradingGame';

/**
 * INVESTQUEST - ANTI-GRAVITY DARK COSMOS UI
 * Features:
 * - Particle-based Starfield & Cursor Trail
 * - Floating 3D Glassmorphism Cards
 * - REAL Authentication & API Integration
 */

const API_BASE = 'http://localhost:5000/api';

// --- STYLES (Injected) ---
const STYLES = `
  @keyframes float {
    0% { transform: translateY(-8px); }
    50% { transform: translateY(8px); }
    100% { transform: translateY(-8px); }
  }
  @keyframes pulse-glow {
    0% { box-shadow: 0 0 10px rgba(0, 245, 255, 0.3), 0 0 5px rgba(0, 245, 255, 0.2); }
    50% { box-shadow: 0 0 25px rgba(0, 245, 255, 0.6), 0 0 15px rgba(0, 245, 255, 0.4); }
    100% { box-shadow: 0 0 10px rgba(0, 245, 255, 0.3), 0 0 5px rgba(0, 245, 255, 0.2); }
  }
  @keyframes rise-fade {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-100px); opacity: 0; }
  }
  @keyframes orbit {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes grow-x {
    from { width: 0; }
    to { width: 100%; }
  }
  @keyframes slide-up {
    from { transform: translateY(40px) scale(0.9); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes shockwave {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(5); opacity: 0; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .grain {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    z-index: 9999;
  }
  input::placeholder { color: rgba(255,255,255,0.3); }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 245, 255, 0.2); border-radius: 10px; }
`;

// --- COMPONENTS ---

const StarField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random()
    }));
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
        star.y += star.speed; if (star.y > canvas.height) star.y = 0;
        star.opacity += (Math.random() - 0.5) * 0.05;
        if (star.opacity < 0.2) star.opacity = 0.2; if (star.opacity > 1) star.opacity = 1;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
    return () => cancelAnimationFrame(animationFrame);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -2 }} />;
};

const CursorTrail = () => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const handleMouseMove = (e) => {
      for (let i = 0; i < 5; i++) {
        particles.current.push({
          x: e.clientX, y: e.clientY,
          vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
          life: 1.0, color: i % 2 === 0 ? '#00f5ff' : '#bf00ff'
        });
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.life > 0);
      particles.current.forEach(p => {
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    window.addEventListener('mousemove', handleMouseMove);
    animate();
    return () => { window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrame); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, pointerEvents: 'none' }} />;
};

const MagneticButton = ({ children, onClick, color = '#00f5ff', style, type = 'button' }) => {
  const btnRef = useRef(null);
  const [transform, setTransform] = useState('');
  const handleMouseMove = (e) => {
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
    if (dist < 100) {
      const dx = (e.clientX - centerX) * 0.3; const dy = (e.clientY - centerY) * 0.3;
      setTransform(`translate(${dx}px, ${dy}px) scale(1.05)`);
    } else { setTransform('translate(0, 0) scale(1)'); }
  };
  return (
    <button
      ref={btnRef} onMouseMove={handleMouseMove} type={type}
      onMouseLeave={(e) => { setTransform('translate(0,0) scale(1)'); e.target.style.boxShadow = `0 0 10px ${color}22`; }}
      onClick={onClick}
      style={{
        padding: '12px 24px', backgroundColor: 'rgba(255,255,255,0.05)',
        border: `1px solid ${color}88`, color: color, borderRadius: '12px',
        cursor: 'pointer', fontSize: '1rem', fontWeight: '600', fontFamily: 'Orbitron',
        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s',
        transform: transform, boxShadow: `0 0 10px ${color}22`, backdropFilter: 'blur(10px)',
        ...style
      }}
      onMouseEnter={(e) => e.target.style.boxShadow = `0 0 20px ${color}66`}
    >
      {children}
    </button>
  );
};

const FloatingCard = ({ children, style, tilt = true }) => {
  const cardRef = useRef(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const centerX = rect.width / 2; const centerY = rect.height / 2;
    setRot({ x: ((y - centerY) / centerY) * 5, y: ((centerX - x) / centerX) * 5 });
  };
  return (
    <div
      ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={() => setRot({ x: 0, y: 0 })}
      style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(24px) saturate(180%)', borderRadius: '24px', padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        animation: 'float 6s ease-in-out infinite',
        transform: `perspective(1000px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        transition: 'transform 0.1s ease-out', ...style
      }}
    >
      {children}
    </div>
  );
};

const RewardPopup = ({ msg, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: '40px', right: '40px', zIndex: 2000,
      background: 'rgba(57, 255, 20, 0.05)', border: '1px solid #39ff14',
      padding: '20px 32px', borderRadius: '16px', backdropFilter: 'blur(12px)',
      animation: 'slide-up 0.6s cubic-bezier(0.19, 1, 0.22, 1)', color: '#39ff14', fontFamily: 'Orbitron',
      display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 0 30px rgba(57, 255, 20, 0.2)',
      fontSize: '0.9rem'
    }}>
      <div style={{ width: '12px', height: '12px', background: '#39ff14', borderRadius: '2px', transform: 'rotate(45deg)', animation: 'pulse 1s infinite' }} />
      {msg}
    </div>
  );
};

const LeaderboardView = () => {
  const [board, setBoard] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/auth/leaderboard`)
      .then(res => res.json())
      .then(data => setBoard(data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px', textShadow: '0 0 20px rgba(57, 255, 20, 0.3)' }}>TOP <span style={{ color: '#39ff14' }}>CADETS</span></h1>
        <p style={{ color: '#9ca3af', letterSpacing: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>GALACTIC RANKINGS</p>
      </div>
      <FloatingCard style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px' }}>
        {board.map((cadet, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: '24px',
            background: idx < 3 ? 'rgba(57, 255, 20, 0.03)' : 'rgba(255,255,255,0.02)',
            padding: '20px 24px', borderRadius: '16px',
            border: idx < 3 ? '1px solid rgba(57, 255, 20, 0.2)' : '1px solid rgba(255,255,255,0.05)',
            transition: '0.3s'
          }}>
            <h2 style={{ width: '40px', textAlign: 'center', color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : '#4b5563', fontSize: '1.5rem', margin: 0 }}>#{idx + 1}</h2>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #bf00ff, #00f5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {cadet.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.3rem', margin: '0 0 4px', letterSpacing: '0.5px' }}>{cadet.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.7rem', color: '#00f5ff', fontWeight: 'bold', background: 'rgba(0, 245, 255, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>LVL {cadet.level}</span>
                <span style={{ fontSize: '0.7rem', color: cadet.totalProfit >= 0 ? '#39ff14' : '#ff4d4d', fontWeight: 'bold' }}>
                  {cadet.totalProfit >= 0 ? '+' : ''}₹{Math.abs(cadet.totalProfit).toLocaleString()} P&L
                </span>
              </div>
            </div>
            <div style={{ fontFamily: 'Orbitron', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff', textShadow: '0 0 10px rgba(255, 255, 255, 0.1)', textAlign: 'right' }}>
              {cadet.xp.toLocaleString()} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>XP</span>
            </div>
          </div>
        ))}
      </FloatingCard>
    </div>
  );
};

const BarGraph = ({ data }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '10px' }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'Orbitron' }}>
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${item.percent}%`,
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${item.color || '#00f5ff'})`,
              boxShadow: `0 0 10px ${item.color || '#00f5ff'}`,
              animation: 'grow-x 1s ease-out forwards'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const LineChart = ({ data, color = "#00f5ff" }) => {
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - d.percent}`).join(' ');
  return (
    <div style={{ width: '100%', height: '140px', marginTop: '20px', position: 'relative' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ transition: '2s ease-out', filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <polygon points={`0,100 ${points} 100,100`} fill={`url(#grad-${color})`} style={{ transition: '2s ease-out' }} />
        {data.map((d, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * 100} cy={100 - d.percent} r="1.5" fill={color} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: '#9ca3af', marginBottom: '2px' }}>{d.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 'bold' }}>{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MissionTable = ({ columns, rows }) => {
  return (
    <div style={{ width: '100%', overflowX: 'auto', marginTop: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'rgba(191, 0, 255, 0.1)' }}>
            {columns.map((col, i) => (
              <th key={i} style={{ padding: '10px', color: '#bf00ff', fontFamily: 'Orbitron', fontWeight: 'bold', borderBottom: '1px solid rgba(191, 0, 255, 0.2)' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '10px', color: '#fff', opacity: 0.8 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [showShockwave, setShowShockwave] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', gender: '', otp: '', newPassword: '' });
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Systems online. Welcome back, cadet. Ready to grow your credits today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [missions, setMissions] = useState([
    { amt: 10, name: "Quick Explore", size: 75, radius: 140, speed: "12s", delay: "0s", color: "#00f5ff" },
    { amt: 20, name: "Stellar Trade", size: 95, radius: 220, speed: "20s", delay: "-5s", color: "#bf00ff" },
    { amt: 50, name: "Hyper Invest", size: 115, radius: 310, speed: "28s", delay: "-10s", color: "#39ff14" }
  ]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: '', cost: '' });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/invest/missions`).then(r => r.json()).then(setMissions).catch(console.error);
  }, []);

  useEffect(() => {
    if (user && user._id) {
       fetch(`${API_BASE}/invest/goals?userId=${user._id}`).then(r => r.json()).then(setGoals).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isAIThinking) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAIThinking(true);

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ prompt: userMsg, userId: user._id })
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages(prev => [...prev, {
          role: 'ai',
          text: data.response,
          vizType: data.vizType,
          vizData: data.vizData
        }]);
        if (data.user) {
          const newUserStatus = { ...user, ...data.user };
          setUser(newUserStatus);
          localStorage.setItem('user', JSON.stringify(newUserStatus));
        }
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: "Critical system error: Connection to neural network failed." }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Error: Subspace channel interrupted. Please check backend." }]);
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.cost) return;

    try {
      console.log("Adding goal:", newGoal);
      const res = await fetch(`${API_BASE}/invest/goals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ ...newGoal, userId: user._id })
      });
      const data = await res.json();
      console.log("Goal response:", data);
      if (res.ok) {
        setGoals(data);
        setNewGoal({ name: '', cost: '' });
        addNotification("New Financial Mission Logged!");
      } else {
        alert(data.message || "Failed to add goal - Error: " + res.status);
      }
    } catch (err) { 
      console.error("Goal add error:", err);
      alert("System connection failure: Ensure backend server is running on port 5000.");
    }
  };

  const addNotification = useCallback((msg) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg }]);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    let endpoint = '';
    let method = 'POST';

    if (authMode === 'login') endpoint = '/auth/login';
    else if (authMode === 'register') endpoint = '/auth/register-request';
    else if (authMode === 'verify-signup') endpoint = '/auth/register-verify';
    else if (authMode === 'forgot') endpoint = '/auth/forgot-password';
    else if (authMode === 'reset') endpoint = '/auth/reset-password';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        if (authMode === 'login' || authMode === 'verify-signup') {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
          addNotification(`Welcome aboard, Astro Trader!`);
        } else if (authMode === 'register') {
          alert(`[SIGNUP ACTIVATION]\n\nActivation Code Sent! Check your terminal or intercepted OTP below:\n${data.otp || 'Check Terminal'}`);
          addNotification(data.message);
          setAuthMode('verify-signup');
        } else if (authMode === 'forgot') {
          alert(`[PASSWORD RESET]\n\nReset Code Sent! Check your terminal or intercepted OTP below:\n${data.otp || 'Check Terminal'}`);
          addNotification(data.message);
          setAuthMode('reset');
        } else if (authMode === 'reset') {
          addNotification(data.message);
          setAuthMode('login');
        }
      } else {
        alert(data.message || 'Auth Failed');
      }
    } catch (err) { alert('Server connection error. Is backend running?'); }
  };

  const handleInvest = async (amount) => {
    if (!user || user.balance < amount) {
      addNotification('Insufficient Credits!');
      return;
    }
    setShowShockwave(true);
    setTimeout(() => setShowShockwave(false), 600);
    try {
      const res = await fetch(`${API_BASE}/invest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ userId: user._id, amount })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Sync with persistence
        addNotification(`₹${amount} DEPLOYED! +${amount * 2} XP`);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <style>{STYLES}</style><StarField /><CursorTrail /><div className="grain" />
        {notifications.map(n => <RewardPopup key={n.id} msg={n.msg} onClose={() => setNotifications(p => p.filter(x => x.id !== n.id))} />)}
        <FloatingCard style={{ width: '100%', maxWidth: '400px', textAlign: 'center', background: '#0b1121', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#0b1121', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid transparent', backgroundImage: 'linear-gradient(#0b1121, #0b1121), conic-gradient(from 0deg, #bf00ff, #00f5ff, #39ff14, #bf00ff)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', marginBottom: '16px', fontSize: '1.5rem', animation: 'orbit 4s linear infinite' }}>
              <div style={{ animation: 'counter-orbit 4s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚀</div>
            </div>
            <h1 style={{ fontSize: '1.8rem', margin: 0, letterSpacing: '1px' }}>Invest<span style={{ color: '#00f5ff' }}>Quest</span></h1>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '8px 0 0' }}>Access your cosmic portfolio</p>
          </div>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {authMode === 'register' && (
              <>
                <input type="text" placeholder="Full Name" required style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </>
            )}
            {(authMode === 'login' || authMode === 'register' || authMode === 'forgot' || authMode === 'reset' || authMode === 'verify-signup') && (
              <input type="email" placeholder="Email Address" required style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={authMode === 'reset' || authMode === 'verify-signup'} />
            )}

            {(authMode === 'login' || authMode === 'register') && (
              <input type="password" placeholder="Password" required style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            )}

            {(authMode === 'reset' || authMode === 'verify-signup') && (
              <>
                <input type="text" placeholder="Enter 4-Digit OTP" required style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                  value={formData.otp || ''} onChange={e => setFormData({ ...formData, otp: e.target.value })} />
                {authMode === 'reset' && (
                  <input type="password" placeholder="New Password" required style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                    value={formData.newPassword || ''} onChange={e => setFormData({ ...formData, newPassword: e.target.value })} />
                )}
              </>
            )}

            <MagneticButton type="submit" style={{ width: '100%', marginTop: '8px', background: 'transparent', border: '1px solid rgba(0, 245, 255, 0.3)', borderRadius: '12px', color: '#fff' }}>
              {authMode === 'login' ? 'INITIALIZE LOGIN' : authMode === 'register' ? 'GET ACTIVATION CODE' : authMode === 'verify-signup' ? 'ACTIVATE ACCOUNT' : authMode === 'forgot' ? 'SEND OTP' : 'RESET PASSWORD'}
            </MagneticButton>
          </form>

          <div style={{ marginTop: '24px', fontSize: '0.8rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              {(authMode === 'login' || authMode === 'forgot' || authMode === 'reset') ? "Don't have an account?" : "Already have an account?"}
              <span onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setFormData({ name: '', email: '', password: '', gender: '', otp: '', newPassword: '' }) }} style={{ color: '#00f5ff', cursor: 'pointer', marginLeft: '6px', fontWeight: 'bold' }}>
                {(authMode === 'login' || authMode === 'forgot' || authMode === 'reset') ? 'Sign Up' : 'Log In'}
              </span>
            </div>
            {authMode === 'login' && (
              <div onClick={() => { setAuthMode('forgot'); setFormData({ name: '', email: '', password: '', gender: '', otp: '', newPassword: '' }) }} style={{ color: '#bf00ff', cursor: 'pointer', fontSize: '0.8rem' }}>
                Forgot Access Code?
              </div>
            )}
          </div>
        </FloatingCard>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '100px 20px 40px' }}>
      <style>{STYLES}</style><div className="grain" /><StarField /><CursorTrail />
      {notifications.map(n => <RewardPopup key={n.id} msg={n.msg} onClose={() => setNotifications(p => p.filter(x => x.id !== n.id))} />)}
      {showShockwave && <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100px', height: '100px', border: '2px solid #39ff14', borderRadius: '50%', animation: 'shockwave 0.6s ease-out', pointerEvents: 'none', zIndex: 999 }} />}

      {/* COSMIC EVENT TICKER */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '26px', background: 'rgba(57, 255, 20, 0.08)', borderBottom: '1px solid rgba(57, 255, 20, 0.2)', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', zIndex: 1000 }}>
        <div style={{ display: 'inline-block', animation: 'scroll-left 40s linear infinite', color: '#39ff14', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'Orbitron', paddingLeft: '100%' }}>
          GLOBAL MISSION LOG: NEW CADET DEPLOYED IN SECTOR 7-G ... [SCAN] METEOR SHOWER DETECTED: 0% RISK TO CREDITS ... [UPDATE] MARS ROVER YIELD: +20% XP EARNED BY POOJITHA ... [INTEL] STELLAR MOMENTUM PEAKING: AGGRESSIVE GROWTH RECOMMENDED ... [ALERT] STREAK SHROUD ACTIVE: 5 CADETS REACHED LEVEL 15 ...
        </div>
      </div>

      <nav style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', zIndex: 100 }}>
        <div style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '100px', color: '#39ff14', fontFamily: 'Orbitron', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 15px rgba(57, 255, 20, 0.1)' }}>
          <span style={{ opacity: 0.6 }}>BALANCE:</span> ₹{user.balance.toLocaleString()}
        </div>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
        {['dashboard', 'ai-hub', 'trading-game', 'invest', 'goals', 'leaderboard'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: activeTab === tab ? '#00f5ff' : 'transparent', color: activeTab === tab ? '#030712' : '#fff', fontFamily: 'Orbitron', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', transition: '0.3s' }}>{tab === 'ai-hub' ? 'AI HUB' : tab === 'trading-game' ? 'WEALTH GAME' : tab}</button>
        ))}
        <button onClick={() => { localStorage.removeItem('user'); setUser(null); }} style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', fontFamily: 'Orbitron', fontSize: '0.7rem', cursor: 'pointer' }}>LOGOUT</button>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
            
            {/* ANOMALY DETECTION AI - SECURITY LAYER */}
            {(() => {
              const history = user.history || [];
              const investments = history.filter(h => h.type.includes("Investment"));
              const anomalies = [];

              if (investments.length > 5) {
                // High Spending: Current > 3x Avg
                const avgAmt = investments.reduce((a, b) => a + b.amount, 0) / investments.length;
                const lastAmt = investments[investments.length - 1].amount;
                if (lastAmt > avgAmt * 3) {
                  anomalies.push({ type: "HIGH_SPENDING", msg: `Warning: Recent ₹${lastAmt} deployment is 3x higher than your average. Conserve reserves?`, color: "#ffd700" });
                }
              }

              const lastTx = history.length > 0 ? new Date(history[history.length - 1].date) : new Date();
              const daysSince = (new Date() - lastTx) / (1000 * 3600 * 24);
              if (daysSince > 2) {
                anomalies.push({ type: "INACTIVITY", msg: `Notice: System has been idle for ${daysSince.toFixed(0)} days. Goal trajectory is failing.`, color: "#ff4d4d" });
              }

              return anomalies.map((a, i) => (
                <div key={i} style={{ gridColumn: 'span 12', padding: '16px 24px', background: `${a.color}11`, border: `1px solid ${a.color}44`, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', color: a.color, animation: 'slide-up 0.5s ease-out' }}>
                  <div style={{ fontSize: '1.5rem' }}>{a.type === "HIGH_SPENDING" ? "📉" : "📡"}</div>
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <strong>ANOMALY DETECTED: {a.type.replace('_', ' ')}</strong><br/>
                    {a.msg}
                  </div>
                  <MagneticButton onClick={() => addNotification("Anomaly logs acknowledged.")} style={{ padding: '6px 16px', fontSize: '0.7rem', color: a.color, border: `1px solid ${a.color}88` }}>ACKNOWLEDGE</MagneticButton>
                </div>
              ));
            })()}

            <FloatingCard style={{ gridColumn: 'span 8', display: 'flex', gap: '32px', alignItems: 'center' }}>
              {(() => {
                const xp = user.xp || 0;
                const streak = user.streak || 0;
                const balance = user.balance || 0;
                
                let segment = { name: "BEGINNER", color: "#00f5ff", icon: "🌱", desc: "Starting your journey" };
                if (xp >= 1000 || streak >= 7 || balance >= 3000) {
                  segment = { name: "ADVANCED", color: "#39ff14", icon: "👑", desc: "Master Trader status" };
                } else if (xp >= 300 || streak >= 3) {
                  segment = { name: "CONSISTENT", color: "#bf00ff", icon: "🔥", desc: "Building strong momentum" };
                }
                
                return (
                  <>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, ${segment.color}, #000)`, border: `2px solid ${segment.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#fff', boxShadow: `0 0 20px ${segment.color}44` }}>
                        {user.name?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: segment.color, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #030712', fontSize: '1rem', boxShadow: `0 0 10px ${segment.color}` }}>
                        {segment.icon}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Welcome, {user.name}</h2>
                        <span style={{ fontSize: '0.65rem', background: `${segment.color}22`, color: segment.color, padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', border: `1px solid ${segment.color}44`, letterSpacing: '1px' }}>{segment.name} CADET</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 12px' }}>{segment.desc} • Level {user.level} Voyager</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${(user.xp / (user.xpToNext || 1000)) * 100}%`, height: '100%', background: `linear-gradient(90deg, #1e293b, ${segment.color})`, boxShadow: `0 0 10px ${segment.color}88`, transition: '0.5s' }} />
                        </div>
                        <span style={{ fontSize: '0.9rem', color: segment.color, fontWeight: 'bold', fontFamily: 'Orbitron' }}>{user.xp} XP</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </FloatingCard>
            <FloatingCard style={{ gridColumn: 'span 4', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {(() => {
                const history = user.history || [];
                const totalGains = history.filter(h => h.type === 'Profit').reduce((acc, h) => acc + h.amount, 0);
                const totalLosses = history.filter(h => h.type === 'Loss').reduce((acc, h) => acc + h.amount, 0);
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
                      <div style={{ textAlign: 'center' }}>
                         <p style={{ fontFamily: 'Orbitron', fontSize: '0.55rem', color: '#39ff14', margin: '0 0 4px', opacity: 0.8 }}>LIFETIME PROFIT</p>
                         <h3 style={{ margin: 0, color: '#39ff14', fontSize: '1rem' }}>₹{totalGains.toLocaleString()}</h3>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                         <p style={{ fontFamily: 'Orbitron', fontSize: '0.55rem', color: '#ff4d4d', margin: '0 0 4px', opacity: 0.8 }}>LIFETIME LOSS</p>
                         <h3 style={{ margin: 0, color: '#ff4d4d', fontSize: '1rem' }}>₹{totalLosses.toLocaleString()}</h3>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#9ca3af', marginBottom: '4px' }}>CURRENT NET P&L</p>
                      <h1 style={{ fontSize: '2.5rem', margin: '0', color: (user.totalProfit || 0) >= 0 ? '#39ff14' : '#ff4d4d' }}>₹{(user.totalProfit || 0).toLocaleString()}</h1>
                    </div>
                    <div style={{ color: '#ff4d4d', marginTop: '12px', background: 'rgba(255, 77, 77, 0.05)', padding: '6px 12px', borderRadius: '100px', display: 'inline-block', alignSelf: 'center', border: '1px solid rgba(255, 77, 77, 0.1)' }}>
                      🔥 <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{user.streak || 0} STREAK</span>
                    </div>
                  </>
                );
              })()}
            </FloatingCard>

            {/* PERSONALIZED RECOMMENDATION ENGINE - NETFLIX STYLE */}
            <div style={{ gridColumn: 'span 12', marginTop: '10px' }}>
              <h3 style={{ fontSize: '0.8rem', color: '#fff', fontFamily: 'Orbitron', marginBottom: '16px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#ff4d4d' }}>●</span> RECOMMENDED FOR YOU
              </h3>
              <div 
                className="custom-scrollbar"
                style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  overflowX: 'auto', 
                  paddingBottom: '10px',
                  scrollbarWidth: 'none'
                }}
              >
                {(() => {
                  const xp = user.xp || 0;
                  const streak = user.streak || 0;
                  const balance = user.balance || 0;
                  
                  let segment = { name: "BEGINNER", color: "#00f5ff", icon: "🌱" };
                  if (xp >= 1000 || streak >= 7 || balance >= 3000) {
                    segment = { name: "ADVANCED", color: "#39ff14", icon: "👑" };
                  } else if (xp >= 300 || streak >= 3) {
                    segment = { name: "CONSISTENT", color: "#bf00ff", icon: "🔥" };
                  }

                  const recs = [];
                  if (segment.name === "BEGINNER") {
                    recs.push({ title: "SAFE EXPLORE", desc: "Start small to build your foundations — try ₹10⚡", amt: 10, color: segment.color, icon: "🛡️", tag: "SAFE HARBOR" });
                    recs.push({ title: "BASICS MISSION", desc: "Gain your first XP milestone — try ₹20🚀", amt: 20, color: segment.color, icon: "🎓", tag: "FOUNDATION" });
                  } else if (segment.name === "CONSISTENT") {
                    recs.push({ title: "STREAK MULTIPLIER", desc: `Protect your 🔥 ${streak} streak — try ₹50 today.`, amt: 50, color: segment.color, icon: "🔥", tag: "MOMENTUM" });
                    recs.push({ title: "STEADY GROWTH", desc: "Consistently outperform — deploy ₹30 in orbits.", amt: 30, color: segment.color, icon: "📈", tag: "RECURRING" });
                  } else {
                    recs.push({ title: "HIGH-ORBIT TRADE", desc: "Elite liquidity detected — deploy ₹100 for max XP.🌌", amt: 100, color: segment.color, icon: "🛰️", tag: "ELITE" });
                    recs.push({ title: "ALPHA DEPLOYMENT", desc: "Master Trader strategy: ₹200 aggressive mission.🏆", amt: 200, color: segment.color, icon: "💎", tag: "AGGRESSIVE" });
                  }
                  
                  return recs.map((rec, i) => (
                    <div 
                      key={i}
                      onClick={() => { setActiveTab('invest'); handleInvest(rec.amt); }}
                      style={{ 
                        flex: '0 0 280px', 
                        background: `linear-gradient(135deg, rgba(255,255,255,0.05), ${rec.color}11)`,
                        border: `1px solid ${rec.color}33`,
                        borderRadius: '20px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'; e.currentTarget.style.borderColor = rec.color; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.borderColor = `${rec.color}33`; }}
                    >
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.05, pointerEvents: 'none' }}>{rec.icon}</div>
                      <div style={{ fontSize: '0.6rem', color: rec.color, fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', background: `${rec.color}11`, width: 'fit-content', padding: '2px 8px', borderRadius: '4px' }}>{rec.tag}</div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#fff' }}>{rec.title}</h4>
                      <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0, lineHeight: '1.4', color: '#e2e8f0' }}>{rec.desc}</p>
                      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: rec.color }}>₹{rec.amt}</span>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: rec.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.8rem' }}>▶</div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
            <FloatingCard style={{ gridColumn: 'span 12', height: '400px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(191, 0, 255, 0.05)', overflow: 'hidden' }}>
              {(() => {
                const xp = user.xp || 0;
                const streak = user.streak || 0;
                const balance = user.balance || 0;
                let segmentColor = "#bf00ff";
                if (xp >= 1000 || streak >= 7 || balance >= 3000) segmentColor = "#39ff14";
                else if (xp >= 300 || streak >= 3) segmentColor = "#bf00ff";
                else segmentColor = "#00f5ff";

                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', color: segmentColor, margin: 0, fontFamily: 'Orbitron', letterSpacing: '2px' }}>SYBIL | {segmentColor === "#39ff14" ? "ADVANCED TACTICIAN" : segmentColor === "#bf00ff" ? "FISCAL STRATEGIST" : "GUIDANCE CORE"}</h3>
                    {isAIThinking && <div style={{ fontSize: '0.7rem', color: segmentColor, animation: 'blink 1s steps(1) infinite' }}>SCANNING SECTOR...</div>}
                  </div>
                );
              })()}

              <div ref={chatScrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '10px' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    maxWidth: '90%',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user' ? 'rgba(0, 245, 255, 0.1)' : 'rgba(191, 0, 255, 0.1)',
                    border: msg.role === 'user' ? '1px solid rgba(0, 245, 255, 0.2)' : '1px solid rgba(191, 0, 255, 0.2)',
                    padding: '12px 18px',
                    borderRadius: msg.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                    fontSize: '0.9rem',
                    color: msg.role === 'user' ? '#00f5ff' : '#bf00ff',
                    fontFamily: msg.role === 'ai' ? 'Orbitron' : 'sans-serif',
                    boxShadow: msg.role === 'ai' ? '0 4px 15px rgba(191, 0, 255, 0.1)' : 'none'
                  }}>
                    {msg.text}
                    {msg.vizType === 'bar' && <BarGraph data={msg.vizData} />}
                    {msg.vizType === 'table' && <MissionTable columns={msg.vizData.columns} rows={msg.vizData.rows} />}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Transmission command..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1, padding: '12px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                />
                <MagneticButton type="submit" color="#bf00ff" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>SEND</MagneticButton>
              </form>
            </FloatingCard>
            <div style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
              <MagneticButton onClick={() => setShowAnalytics(!showAnalytics)} color={showAnalytics ? "#00f5ff" : "#fff"}>
                {showAnalytics ? "HIDE MISSION ANALYSIS" : "VIEW MISSION ANALYSIS REPORTS"}
              </MagneticButton>
            </div>

            {showAnalytics && (
              <FloatingCard style={{ gridColumn: 'span 12', background: 'rgba(57, 255, 20, 0.05)', marginTop: '20px', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1rem', color: '#39ff14', margin: 0, fontFamily: 'Orbitron' }}>MISSION ANALYTICS & HUB</h3>
                  <div style={{ fontSize: '0.7rem', color: '#39ff14', opacity: 0.7 }}>REAL-TIME FISCAL SCAN ACTIVE</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '16px' }}>REAL-TIME STATUS GRAPH</p>
                    <BarGraph data={[
                      { label: "Mission XP", value: `${user.xp}`, percent: Math.min((user.xp / (user.xpToNext || 1000)) * 100, 100), color: "#00f5ff" },
                      { label: "Balance Health", value: `₹${user.balance}`, percent: Math.min((user.balance / 5000) * 100, 100), color: "#39ff14" },
                      { label: "Streak Heat", value: `${user.streak} Wins`, percent: Math.min((user.streak / 30) * 100, 100), color: "#bf00ff" }
                    ]} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '16px' }}>LOGS ENTRY (LAST 5 TRANSMISSIONS)</p>
                    <MissionTable columns={["Date", "Type", "Amount", "Status"]} rows={
                      (user.history || []).slice(-5).reverse().map(h => [
                        new Date(h.date).toLocaleDateString(),
                        h.type,
                        `₹${h.amount}`,
                        "SUCCESS"
                      ])
                    } />
                  </div>
                </div>
              </FloatingCard>
            )}
          </div>
        )}
        {activeTab === 'ai-hub' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
            <FloatingCard style={{ gridColumn: 'span 6', height: '380px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: '#bf00ff', margin: '0 0 20px', fontSize: '1rem', fontFamily: 'Orbitron', letterSpacing: '1px' }}>ASSET ALLOCATION BREAKDOWN</h3>
              {(() => {
                const deployed = (user.history || []).reduce((acc, h) => acc + (h.amount || 0), 0);
                const totalCap = user.balance + deployed;
                const deployedPct = ((deployed / totalCap) * 100).toFixed(0);
                const liquidPct = ((user.balance / totalCap) * 100).toFixed(0);
                const reservePct = 100 - deployedPct - liquidPct;

                return (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '30px', padding: '0 10px' }}>
                    <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#bf00ff" strokeWidth="12" strokeDasharray="251" strokeDashoffset={251 - (251 * (deployedPct/100))} />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#00f5ff" strokeWidth="12" strokeDasharray="251" strokeDashoffset={251 - (251 * (reservePct/100))} transform={`rotate(${3.6 * deployedPct} 50 50)`} />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeDasharray="251" strokeDashoffset={251 - (251 * (liquidPct/100))} transform={`rotate(${3.6 * (parseInt(deployedPct) + parseInt(reservePct))} 50 50)`} />
                      </svg>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '1px' }}>DEPLOYED</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>{deployedPct}%</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {[
                        { label: 'Deployed Cap.', value: `${deployedPct}%`, color: '#bf00ff' },
                        { label: 'Strategic Res.', value: `${reservePct}%`, color: '#00f5ff' },
                        { label: 'Liquid Credits', value: `${liquidPct}%`, color: 'rgba(255,255,255,0.2)' }
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '8px', height: '8px', background: item.color, borderRadius: '2px' }} />
                          <div style={{ flex: 1, fontSize: '0.75rem', color: '#9ca3af' }}>{item.label}</div>
                          <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div style={{ marginTop: 'auto', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>CAPITAL EFFICIENCY:</div>
                <div style={{ fontSize: '1rem', color: '#39ff14', fontWeight: 'bold', fontFamily: 'Orbitron' }}>HEALTHY ({Math.min(100, (user.xp / 10)).toFixed(0)}%)</div>
              </div>
            </FloatingCard>
            <FloatingCard style={{ gridColumn: 'span 6', height: '380px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: '#00f5ff', margin: '0 0 20px', fontSize: '1rem', fontFamily: 'Orbitron', letterSpacing: '1px' }}>COMPOUND GROWTH PROJECTION (ROI)</h3>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(() => {
                  const history = user.history || [];
                  let currentBalance = 1500; // Starting baseline
                  const balances = [currentBalance];
                  history.forEach(h => {
                    const diff = h.type === 'Profit' ? h.amount : -h.amount;
                    currentBalance += diff;
                    balances.push(currentBalance);
                  });

                  // If not enough history, add projections to make it interesting
                  if (balances.length < 5) {
                    balances.push(currentBalance * 1.05);
                    balances.push(currentBalance * 1.12);
                    balances.push(currentBalance * 1.25);
                  }

                  const min = Math.min(...balances);
                  const max = Math.max(...balances);
                  const range = max - min || 1;

                  const chartData = balances.map((b, i) => {
                    // Show labels only for start, end, and major milestones to keep it clean
                    const isStart = i === 0;
                    const isEnd = i === balances.length - 1;
                    const isMid = i === Math.floor(balances.length / 2);
                    const showLabel = isStart || isEnd || isMid;

                    return {
                      label: showLabel ? (isStart ? "Start" : isEnd ? "Current" : `T${i}`) : "",
                      value: showLabel ? `₹${b.toFixed(0)}` : "",
                      percent: ((b - min) / range) * 80 + 10 // scale to [10, 90]
                    };
                  });

                  return <LineChart data={chartData} color="#00f5ff" />;
                })()}
                <div style={{ padding: '20px', background: 'rgba(0, 245, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(0, 245, 255, 0.2)', marginTop: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#00f5ff', fontWeight: 'bold', marginBottom: '8px' }}>FISCAL ADVISORY:</div>
                  <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: '1.4', opacity: 0.8 }}>
                    At your current liquidity velocity, a sustained 15% deployment rate will optimize your capital efficiency and reach your target goal in 12 fiscal cycles.
                  </p>
                </div>
              </div>
            </FloatingCard>
            <FloatingCard style={{ gridColumn: 'span 12', background: 'linear-gradient(135deg, rgba(191, 0, 255, 0.05), rgba(0, 245, 255, 0.05))' }}>
              <h3 style={{ borderLeft: '4px solid #bf00ff', paddingLeft: '10px', fontSize: '1rem', color: '#fff' }}>COSMIC INTELLIGENCE REPORT</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                {[
                  { title: "HOW YOU ARE DOING", value: "EXCELLENT", color: "#39ff14", desc: "You are doing great and winning right now." },
                  { title: "SPENDING MONEY", value: "READY", color: "#00f5ff", desc: "You have enough balance to invest more." },
                  { title: "ISSUES OR RISKS", value: "NONE", color: "#bf00ff", desc: "There are no problems with your account today." }
                ].map((report, i) => (
                  <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '0.6rem', color: '#9ca3af', marginBottom: '8px' }}>{report.title}</p>
                    <h2 style={{ fontSize: '1.2rem', color: report.color, margin: '0 0 8px' }}>{report.value}</h2>
                    <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{report.desc}</p>
                  </div>
                ))}
              </div>

              {/* Final Mission Verdict Section */}
              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(57, 255, 20, 0.05)', borderRadius: '16px', border: '1px solid rgba(57, 255, 20, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#39ff14', letterSpacing: '2px', marginBottom: '8px' }}>FINAL RESULT</div>
                  <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>MISSION STATUS: <span style={{ color: '#39ff14' }}>PERFECT</span></h2>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '8px 0 0' }}>The AI says your account is in top shape. Good job!</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6rem', color: '#9ca3af', marginBottom: '4px' }}>WHAT TO DO NEXT</div>
                  <div 
                    onClick={() => setActiveTab('invest')}
                    style={{ padding: '8px 16px', background: 'rgba(57, 255, 20, 0.1)', border: '1px solid #39ff14', borderRadius: '8px', color: '#39ff14', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(57, 255, 20, 0.2)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(57, 255, 20, 0.1)'}
                  >
                    INVEST IN NEW MISSIONS 🚀
                  </div>
                </div>
              </div>
            </FloatingCard>
          </div>
        )}
        {activeTab === 'invest' && (
          <div style={{ position: 'relative', height: '650px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '40px', background: 'radial-gradient(circle at center, rgba(191, 0, 255, 0.05) 0%, transparent 70%)' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(0, 245, 255, 0.05), transparent 50%)', pointerEvents: 'none' }} />
            <h1 style={{ fontSize: '3.5rem', position: 'absolute', top: '40px', zIndex: 10, margin: 0, textShadow: '0 0 20px rgba(0, 245, 255, 0.5)', fontFamily: 'Orbitron', fontWeight: '900', letterSpacing: '4px' }}>MISSION <span style={{ color: '#00f5ff' }}>ORBITS</span></h1>
            <p style={{ position: 'absolute', top: '110px', color: '#9ca3af', fontSize: '0.9rem', zIndex: 10, fontFamily: 'Orbitron', letterSpacing: '2px', opacity: 0.7 }}>CLICK A MOVING ORB TO DEPLOY CREDITS</p>

            {/* The Sun / Center Symbol */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'radial-gradient(circle, #bf00ff, #000)',
              boxShadow: '0 0 80px #bf00ff, 0 0 140px rgba(191, 0, 255, 0.3)',
              animation: 'pulse 3s infinite ease-in-out', zIndex: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', animation: 'orbit 10s linear infinite' }} />
            </div>

            {/* Orbiting Spacecrafts */}
            {missions.map((orb, idx) => (
              <div key={idx} style={{
                position: 'absolute',
                width: `${orb.radius * 2}px`,
                height: `${orb.radius * 2}px`,
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '50%',
                animation: `orbit ${orb.speed} linear infinite`,
                animationDelay: orb.delay,
                pointerEvents: 'none'
              }}>
                <div
                  onClick={(e) => { e.stopPropagation(); handleInvest(orb.amt); }}
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${orb.size}px`,
                    height: `${orb.size}px`,
                    borderRadius: '50%',
                    border: `1px solid ${orb.color}`,
                    background: 'rgba(11, 17, 33, 0.9)',
                    boxShadow: `0 0 30px ${orb.color}44, inset 0 0 20px ${orb.color}22`,
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    animation: 'float 4s ease-in-out infinite'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.2)';
                    e.currentTarget.style.boxShadow = `0 0 50px ${orb.color}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                    e.currentTarget.style.boxShadow = `0 0 30px ${orb.color}44, inset 0 0 20px ${orb.color}22`;
                  }}
                >
                  <span style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', color: orb.color, fontWeight: 'bold' }}>₹{orb.amt}</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.8, color: orb.color, letterSpacing: '1px', textAlign: 'center' }}>{orb.name}<br/>(UP TO 2.5x)</span>
                  <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: `1px solid ${orb.color}22`, animation: 'pulse-glow 2s infinite' }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'goals' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '0 20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>FINANCIAL <span style={{ color: '#bf00ff' }}>MISSIONS</span></h1>
              <p style={{ color: '#9ca3af', fontFamily: 'Orbitron', fontSize: '0.7rem', letterSpacing: '2px' }}>TRACK YOUR GALACTIC OBJECTIVES</p>
            </div>

            {/* ADD GOAL FORM */}
            <FloatingCard style={{ width: '100%', maxWidth: '600px', border: '1px solid rgba(0, 245, 255, 0.2)', background: 'rgba(0, 245, 255, 0.02)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1rem', color: '#00f5ff', fontFamily: 'Orbitron' }}>IDENTITY NEW MISSION</h3>
              <form onSubmit={handleAddGoal} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <input 
                  type="text" placeholder="Goal Name (e.g. Dream House)" 
                  required style={{ flex: '2 1 200px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                />
                <input 
                  type="number" placeholder="Target ₹" 
                  required style={{ flex: '1 1 100px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  value={newGoal.cost} onChange={e => setNewGoal({ ...newGoal, cost: e.target.value })}
                />
                <MagneticButton type="submit" style={{ flex: '1 1 100%' }}>LOG MISSION</MagneticButton>
              </form>
            </FloatingCard>

            {/* GOAL OPTIMIZATION AI - DYNAMIC PROJECTIONS */}
            <FloatingCard style={{ width: '100%', maxWidth: '600px', background: 'rgba(57, 255, 20, 0.05)', border: '1px solid rgba(57, 255, 20, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '8px', height: '8px', background: '#39ff14', borderRadius: '2px', animation: 'pulse 1s infinite' }} />
                <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#39ff14', fontFamily: 'Orbitron', letterSpacing: '1px' }}>SYBIL | GOAL OPTIMIZER</h3>
              </div>
              
              {(() => {
                const history = user.history || [];
                // Calculate average profit per transaction (simplified "pace")
                const profits = history.filter(h => h.type === 'Profit').map(h => h.amount);
                const avgProfit = profits.length > 0 ? profits.reduce((a, b) => a + b, 0) / profits.length : 10;
                
                const nextGoal = goals.find(g => (user.balance < g.cost));
                
                if (!nextGoal) return <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>All objectives cleared. SYBIL is now scanning for higher level mission targets.</p>;

                const remaining = nextGoal.cost - user.balance;
                const daysEstimated = Math.ceil(remaining / (avgProfit * 2)); // Assuming 2 profit actions per day
                
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #39ff14' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#fff', lineHeight: '1.4' }}>
                        “At your current momentum (₹{avgProfit.toFixed(0)} avg/win), you can reach your <strong>{nextGoal.name}</strong> target in approximately <strong>{daysEstimated} cycles</strong>. 🚀”
                      </p>
                      <div style={{ fontSize: '0.65rem', color: '#39ff14', letterSpacing: '1px' }}>PROJECTION CONFIDENCE: 84%</div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.6rem', color: '#9ca3af', marginBottom: '4px' }}>AI SUGGESTED TARGET</div>
                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>₹{(nextGoal.cost * 1.5).toLocaleString()} (Strategic Expansion)</div>
                      </div>
                      <MagneticButton 
                        onClick={() => { setNewGoal({ name: `UPGRADE: ${nextGoal.name}`, cost: nextGoal.cost * 1.5 }); }} 
                        style={{ padding: '6px 12px', fontSize: '0.65rem' }}
                      >
                        OPT-IN
                      </MagneticButton>
                    </div>
                  </div>
                );
              })()}
            </FloatingCard>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '600px' }}>
              {goals.map((goal, idx) => {
                const progress = Math.min((user.balance / goal.cost) * 100, 100);
                const isComplete = progress === 100;
                return (
                  <FloatingCard key={`${goal.name}-${idx}`} style={{ border: isComplete ? '1px solid #39ff14' : '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h3 style={{ color: isComplete ? '#39ff14' : '#fff' }}>{goal.name}</h3>
                      <span style={{ fontFamily: 'Orbitron', color: '#00f5ff' }}>₹{goal.cost.toLocaleString()}</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: isComplete ? '#39ff14' : 'linear-gradient(90deg, #bf00ff, #00f5ff)', transition: '1s' }} />
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '0.8rem', color: isComplete ? '#39ff14' : '#9ca3af', textAlign: 'right' }}>
                      {isComplete ? 'MISSION COMPLETE' : `${progress.toFixed(1)}% ACQUIRED`}
                    </p>
                  </FloatingCard>
                );
              })}
            </div>
          </div>
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardView />
        )}
        {activeTab === 'trading-game' && (
          <TradingGame user={user} setUser={setUser} addNotification={addNotification} />
        )}
      </main>
    </div>
  );
}
