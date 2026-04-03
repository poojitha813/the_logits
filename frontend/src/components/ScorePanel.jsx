import React from 'react';

const ScorePanel = ({ wallet, xp, activePowerUp, onPowerUpActivate, onInvestClick }) => {
  return (
    <div className="score-panel">
      <h2 className="panel-header">Portfolio Overview</h2>
      
      <div className="stat-box">
        <span className="stat-label">Total Equity</span>
        <span className="stat-value wallet">₹{(wallet * 1.5).toFixed(2)}</span>
      </div>
      
      <div className="stat-box">
        <span className="stat-label">Investor Rank (XP)</span>
        <span className="stat-value xp">{xp}</span>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 245, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(0, 245, 255, 0.1)' }}>
        <h4 style={{ fontSize: '0.65rem', color: '#00f5ff', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '2px', fontWeight: '800', opacity: 0.9 }}>ASSET REGISTRY</h4>
        <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '8px', color: '#e2e8f0', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
          <div><span style={{ color: '#00f5ff', fontWeight: 'bold' }}>TSLA</span> » STOCKS</div>
          <div><span style={{ color: '#f7931a', fontWeight: 'bold' }}>BTC</span> » CRYPTO</div>
          <div><span style={{ color: '#ffd700', fontWeight: 'bold' }}>GOLD</span> » METAL</div>
          <div><span style={{ color: '#00d2ff', fontWeight: 'bold' }}>BOND</span> » DEBT</div>
        </div>
      </div>



      <div className="cta-container">
        <button className="invest-cta-btn" onClick={onInvestClick}>
          Start Real Investing
        </button>
      </div>
    </div>
  );
};

export default ScorePanel;
