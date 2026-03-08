import React, { useMemo, useState } from "react";
import "./App.css";

const BOARD_SIZE = 9;

function calculateWinner(squares) {
  // Winning line indices for 3x3 Tic Tac Toe
  const lines = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diags
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) {
      return { player: v, line: [a, b, c] };
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function App() {
  /** Root app component for the Tic Tac Toe game (UI + game logic). */
  const [squares, setSquares] = useState(() => Array(BOARD_SIZE).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = useMemo(() => calculateWinner(squares), [squares]);
  const isDraw = useMemo(() => !winner && squares.every(Boolean), [winner, squares]);
  const currentPlayer = xIsNext ? "X" : "O";

  const statusText = useMemo(() => {
    if (winner) return `Winner: ${winner.player}`;
    if (isDraw) return "It's a draw";
    return `Next player: ${currentPlayer}`;
  }, [winner, isDraw, currentPlayer]);

  // PUBLIC_INTERFACE
  function handleSquareClick(index) {
    /** Handles a player's move on a given square index. */
    if (winner || squares[index]) return;

    setSquares((prev) => {
      const next = prev.slice();
      next[index] = currentPlayer;
      return next;
    });
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    /** Resets the game back to its initial state. */
    setSquares(Array(BOARD_SIZE).fill(null));
    setXIsNext(true);
  }

  return (
    <div className="App">
      <main className="page">
        <section className="card" aria-label="Tic Tac Toe">
          <header className="header">
            <div>
              <h1 className="title">Tic Tac Toe</h1>
              <p className="subtitle">Two players. One board. First to three wins.</p>
            </div>

            <div className="badgeRow" aria-label="Player indicator">
              <span className={`badge ${currentPlayer === "X" ? "badgePrimary" : "badgeMuted"}`}>
                X
              </span>
              <span className={`badge ${currentPlayer === "O" ? "badgeSuccess" : "badgeMuted"}`}>
                O
              </span>
            </div>
          </header>

          <div className="status" role="status" aria-live="polite">
            {statusText}
          </div>

          <div className="boardWrap">
            <div className="board" role="grid" aria-label="Tic Tac Toe board">
              {squares.map((value, idx) => {
                const isWinningSquare = Boolean(winner?.line?.includes(idx));
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`square ${isWinningSquare ? "squareWinning" : ""}`}
                    onClick={() => handleSquareClick(idx)}
                    aria-label={`Square ${idx + 1}${value ? `: ${value}` : ""}`}
                    role="gridcell"
                    disabled={Boolean(winner) || Boolean(value)}
                  >
                    <span className={`mark ${value === "X" ? "markX" : value === "O" ? "markO" : ""}`}>
                      {value ?? ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <footer className="actions">
            <button type="button" className="btn btnPrimary" onClick={handleReset}>
              Reset game
            </button>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
