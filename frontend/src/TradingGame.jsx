import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import ScorePanel from './components/ScorePanel';
import './game.css';

function TradingGame({ user, setUser, addNotification }) {
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  
  const wallet = user.balance;
  const xp = user.xp;

  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      if (hours >= 9 && hours < 15) {
        setIsMarketOpen(true);
      } else {
        setIsMarketOpen(false);
      }
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleReward = (reward) => {
    let multiplier = 1;
    if (activePowerUp === 'boost') {
      multiplier = 2;
      setActivePowerUp(null); // use the leverage
    }

    if (reward.type === 'money') {
      const amount = reward.amount * multiplier;
      const newBalance = user.balance + amount;
      setUser(prev => ({ ...prev, balance: newBalance }));
      localStorage.setItem('user', JSON.stringify({ ...user, balance: newBalance }));
      addNotification?.(`Earned ₹${amount}!`);
    } else if (reward.type === 'xp') {
      const amount = reward.amount * multiplier;
      const newXp = user.xp + amount;
      setUser(prev => ({ ...prev, xp: newXp }));
      localStorage.setItem('user', JSON.stringify({ ...user, xp: newXp }));
      addNotification?.(`+${amount} XP earned!`);
    }
  };

  const handlePowerUpActivate = (powerUpType) => {
    setActivePowerUp(powerUpType);
  };

  return (
    <div className="trading-game-container">
      <div className="app-container">
      <div className="header-container" style={{ borderBottom: 'none', marginBottom: '10px' }}>
        <div>
          <h2 className="title" style={{ fontSize: '1.5rem', color: '#00f5ff' }}>Wealth Builder Strategy Board</h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0', letterSpacing: '1.5px' }}>
            TSLA (Stocks) • BTC (Crypto) • GOLD (Metal) • BOND (Fixed Income)
          </p>
        </div>
      </div>


      <div className="game-area">
        <ScorePanel
          wallet={wallet}
          xp={xp}
          activePowerUp={activePowerUp}
          onPowerUpActivate={handlePowerUpActivate}
          onInvestClick={() => setShowModal(true)}
        />
        <GameBoard
          onReward={handleReward}
          activePowerUp={activePowerUp}
          onPowerUpUsed={() => setActivePowerUp(null)}
        />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Open Brokerage Account</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>You've built ₹{(wallet * 1.5).toFixed(2)} in simulated equity! Ready to try the real markets?</p>
              <div className="input-group">
                <input type="email" placeholder="Enter your email address" />
                <button onClick={() => {
                  alert("Thanks! Check your email to complete registration.");
                  setShowModal(false);
                }}>Continue</button>
              </div>
              <div className="broker-links">
                <p>Or continue securely with our platform:</p>
                <button
                  className="broker-btn active-broker"
                  onClick={() => {
                    alert("Preparing your InvestQuest portfolio...");
                    setShowModal(false);
                  }}>
                  InvestQuest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default TradingGame;
