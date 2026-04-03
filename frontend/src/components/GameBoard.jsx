import React, { useState, useEffect, useCallback } from 'react';
import Tile from './Tile';

const ROWS = 6;
const COLS = 6;
const TYPES = ['tsla', 'btc', 'gold', 'bond'];

// Utility to create a random tile
const createRandomTile = (row, col) => ({
  id: `${Date.now()}-${Math.random()}`,
  type: TYPES[Math.floor(Math.random() * TYPES.length)],
  matched: false,
  falling: false,
});

const GameBoard = ({ onReward, activePowerUp, onPowerUpUsed }) => {
  const [grid, setGrid] = useState([]);
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [floatingRewards, setFloatingRewards] = useState([]);

  // Initialize board with no matches
  const initBoard = useCallback(() => {
    let newGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let type;
        do {
          type = TYPES[Math.floor(Math.random() * TYPES.length)];
        } while (
          (r >= 2 && newGrid[r - 1][c].type === type && newGrid[r - 2][c].type === type) ||
          (c >= 2 && newGrid[r][c - 1].type === type && newGrid[r][c - 2].type === type)
        );
        newGrid[r][c] = { id: `${Date.now()}-${r}-${c}`, type, matched: false, falling: false };
      }
    }
    setGrid(newGrid);
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  const checkMatches = (currentGrid) => {
    let matchedCells = new Set();
    let matches = [];

    // Check rows
    for (let r = 0; r < ROWS; r++) {
      let matchCount = 1;
      for (let c = 0; c < COLS; c++) {
        if (c > 0 && currentGrid[r][c]?.type === currentGrid[r][c - 1]?.type && currentGrid[r][c]?.type !== null) {
          matchCount++;
        } else {
          if (matchCount >= 3) {
            let currentMatch = [];
            for (let i = 1; i <= matchCount; i++) {
              matchedCells.add(`${r},${c - i}`);
              currentMatch.push({ r, c: c - i });
            }
            matches.push(currentMatch);
          }
          matchCount = 1;
        }
      }
      if (matchCount >= 3) {
        let currentMatch = [];
        for (let i = 1; i <= matchCount; i++) {
          matchedCells.add(`${r},${COLS - i}`);
          currentMatch.push({ r, c: COLS - i });
        }
        matches.push(currentMatch);
      }
    }

    // Check columns
    for (let c = 0; c < COLS; c++) {
      let matchCount = 1;
      for (let r = 0; r < ROWS; r++) {
        if (r > 0 && currentGrid[r][c]?.type === currentGrid[r - 1][c]?.type && currentGrid[r][c]?.type !== null) {
          matchCount++;
        } else {
          if (matchCount >= 3) {
            let currentMatch = [];
            for (let i = 1; i <= matchCount; i++) {
              matchedCells.add(`${r - i},${c}`);
              currentMatch.push({ r: r - i, c });
            }
            matches.push(currentMatch);
          }
          matchCount = 1;
        }
      }
      if (matchCount >= 3) {
        let currentMatch = [];
        for (let i = 1; i <= matchCount; i++) {
          matchedCells.add(`${ROWS - i},${c}`);
          currentMatch.push({ r: ROWS - i, c });
        }
        matches.push(currentMatch);
      }
    }

    return { matchedCells, matches };
  };

  const processMatches = (currentGrid, matches, matchedCells) => {
    if (matches.length === 0) return false;

    setAnimating(true);
    let newGrid = currentGrid.map(row => [...row]);

    matches.forEach(match => {
      let rewardText = '';
      if (match.length === 3) {
        onReward({ type: 'money', amount: 5 });
        rewardText = '+$5.00';
      } else if (match.length === 4) {
        onReward({ type: 'xp', amount: 10 });
        rewardText = 'DIVIDEND!';
      } else if (match.length >= 5) {
        // Automatically grant power boost for match 5
        onReward({ type: 'xp', amount: 20 });
        rewardText = 'MARKET BOOM!';
      }

      // Add floating text in the middle of the match
      const mid = match[Math.floor(match.length / 2)];
      if (rewardText) {
        addFloatingReward(rewardText, mid.r, mid.c);
      }
    });

    // Mark as matched for animation
    matchedCells.forEach(cell => {
      const [r, c] = cell.split(',').map(Number);
      newGrid[r][c] = { ...newGrid[r][c], matched: true };
    });
    setGrid(newGrid);

    // After pop animation, drop tiles
    setTimeout(() => {
      applyGravity(newGrid, matchedCells);
    }, 400);

    return true;
  };

  const addFloatingReward = (text, r, c) => {
    const id = Date.now() + Math.random();
    setFloatingRewards(prev => [...prev, { id, text, r, c }]);
    setTimeout(() => {
      setFloatingRewards(prev => prev.filter(req => req.id !== id));
    }, 1000);
  };

  const applyGravity = (currentGrid, matchedCells) => {
    let newGrid = currentGrid.map(row => [...row]);

    // Clear matched
    matchedCells.forEach(cell => {
      const [r, c] = cell.split(',').map(Number);
      newGrid[r][c] = null;
    });

    // Drop down
    for (let c = 0; c < COLS; c++) {
      let writePos = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (newGrid[r][c] !== null) {
          if (r !== writePos) {
            newGrid[writePos][c] = { ...newGrid[r][c], falling: true };
            newGrid[r][c] = null;
          }
          writePos--;
        }
      }
      // Fill empty spots at top
      while (writePos >= 0) {
        newGrid[writePos][c] = { ...createRandomTile(writePos, c), falling: true };
        writePos--;
      }
    }

    setGrid(newGrid);

    // Wait for drop animation, then check for chain reactions
    setTimeout(() => {
      // clear falling flag
      let settledGrid = newGrid.map(row => row.map(tile => ({ ...tile, falling: false })));
      const { matchedCells: nextMatchedCells, matches: nextMatches } = checkMatches(settledGrid);
      
      if (nextMatches.length > 0) {
        processMatches(settledGrid, nextMatches, nextMatchedCells);
      } else {
        setGrid(settledGrid);
        setAnimating(false);
      }
    }, 400);
  };

  const swapTiles = (r1, c1, r2, c2) => {
    let newGrid = grid.map(row => [...row]);
    let temp = newGrid[r1][c1];
    newGrid[r1][c1] = newGrid[r2][c2];
    newGrid[r2][c2] = temp;
    return newGrid;
  };

  const handleTileClick = (r, c) => {
    if (animating) return;

    if (activePowerUp === 'bomb') {
      // Clear entire row
      handleBombPowerUp(r);
      return;
    }

    if (!selected) {
      setSelected({ r, c });
      return;
    }

    const isAdjacent = Math.abs(selected.r - r) + Math.abs(selected.c - c) === 1;

    if (isAdjacent) {
      // Perform swap
      let newGrid = swapTiles(selected.r, selected.c, r, c);
      const { matchedCells, matches } = checkMatches(newGrid);

      if (matches.length > 0) {
        setSelected(null);
        processMatches(newGrid, matches, matchedCells);
      } else {
        // Swap back if no match (animate this later if desired)
        setSelected(null);
        setGrid(grid); // refresh to cancel selection
      }
    } else {
      // Change selection
      setSelected({ r, c });
    }
  };

  const handleBombPowerUp = (row) => {
    setAnimating(true);
    onPowerUpUsed();
    
    let matchedCells = new Set();
    for (let c = 0; c < COLS; c++) {
      matchedCells.add(`${row},${c}`);
    }
    
    let newGrid = grid.map(rArr => [...rArr]);
    for (let c = 0; c < COLS; c++) {
      newGrid[row][c] = { ...newGrid[row][c], matched: true };
    }
    setGrid(newGrid);

    // Boom! 💥
    addFloatingReward('BULL RUN!', row, Math.floor(COLS/2));

    setTimeout(() => {
      applyGravity(newGrid, matchedCells);
    }, 400);
  };

  return (
    <div className="board-container">
      <div className="grid">
        {grid.map((row, rowIndex) => (
          row.map((tile, colIndex) => {
            const isSelected = selected?.r === rowIndex && selected?.c === colIndex;
            return (
              <Tile
                key={tile ? tile.id : `${rowIndex}-${colIndex}`}
                type={tile?.type}
                id={tile?.id}
                isSelected={isSelected}
                isMatched={tile?.matched}
                isFalling={tile?.falling}
                position={{ row: rowIndex, col: colIndex }}
                onClick={() => handleTileClick(rowIndex, colIndex)}
              />
            );
          })
        ))}
        {floatingRewards.map(reward => (
          <div 
            key={reward.id} 
            className="floating-reward"
            style={{ 
              top: `${reward.r * (100/ROWS)}%`, 
              left: `${reward.c * (100/COLS)}%`,
              marginTop: '10px',
              marginLeft: '10px'
            }}
          >
            {reward.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
