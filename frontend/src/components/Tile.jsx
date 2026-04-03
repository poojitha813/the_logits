import React from 'react';

const TILE_DATA = {
  tsla: { label: 'TSLA', change: '+2.4%' },
  btc: { label: 'BTC', change: '+1.5%' },
  gold: { label: 'GOLD', change: '+0.8%' },
  bond: { label: 'BOND', change: '+0.2%' }
};

const Tile = ({ 
  type, 
  id, 
  onClick, 
  isSelected, 
  isMatched, 
  isFalling,
  position
}) => {
  if (!type) {
    return <div className="tile empty" />;
  }

  let classes = `tile tile-${type}`;
  if (isSelected) classes += ' selected';
  if (isMatched) classes += ' matched';
  if (isFalling) classes += ' falling';

  const data = TILE_DATA[type];

  return (
    <div 
      className={classes}
      onClick={onClick}
      data-id={id}
      data-row={position?.row}
      data-col={position?.col}
    >
      <span className="tile-ticker">{data.label}</span>
      <span className="tile-change" style={{ color: 'var(--accent-green)' }}>
        {data.change}
      </span>
    </div>
  );
};

export default Tile;
