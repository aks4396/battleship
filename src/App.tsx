import { useCallback, useState } from 'react';
import type {
  AIState,
  AttackResult,
  Board,
  GamePhase,
  Winner,
} from './game';
import {
  allShipsSunk,
  chooseAIMove,
  createAIState,
  processAttack,
  randomPlacement,
  updateAIState,
} from './game';
import { BoardView } from './components/Board';
import { StatusBar } from './components/StatusBar';
import { FleetStatus } from './components/FleetStatus';
import './App.css';

function deepCloneBoard(board: Board): Board {
  return {
    grid: board.grid.map((row) => [...row]),
    ships: board.ships.map((ship) => ({
      ...ship,
      coords: ship.coords.map((c) => ({ ...c })),
      hits: new Set(ship.hits),
    })),
  };
}

function cloneAIState(state: AIState): AIState {
  return {
    attackedCells: new Set(state.attackedCells),
    mode: state.mode,
    targetQueue: [...state.targetQueue],
    activeHits: [...state.activeHits],
  };
}

export default function App() {
  const [playerBoard, setPlayerBoard] = useState<Board>(() => randomPlacement());
  const [aiBoard, setAIBoard] = useState<Board>(() => randomPlacement());
  const [aiState, setAIState] = useState<AIState>(() => createAIState());
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [winner, setWinner] = useState<Winner>(null);
  const [lastPlayerResult, setLastPlayerResult] = useState<AttackResult | null>(null);
  const [lastAIResult, setLastAIResult] = useState<AttackResult | null>(null);

  const handleRandomize = useCallback(() => {
    if (phase !== 'setup') return;
    setPlayerBoard(randomPlacement());
  }, [phase]);

  const handleStartGame = useCallback(() => {
    if (phase !== 'setup') return;
    setPhase('playing');
    setLastPlayerResult(null);
    setLastAIResult(null);
  }, [phase]);

  const handleRestart = useCallback(() => {
    setPlayerBoard(randomPlacement());
    setAIBoard(randomPlacement());
    setAIState(createAIState());
    setPhase('setup');
    setWinner(null);
    setLastPlayerResult(null);
    setLastAIResult(null);
  }, []);

  const handlePlayerAttack = useCallback(
    (row: number, col: number) => {
      if (phase !== 'playing') return;

      // Player attacks AI board
      const newAIBoard = deepCloneBoard(aiBoard);
      const playerResult = processAttack(newAIBoard, { row, col });
      if (!playerResult) return; // already attacked

      setAIBoard(newAIBoard);
      setLastPlayerResult(playerResult);

      // Check if player wins
      if (allShipsSunk(newAIBoard)) {
        setPhase('gameover');
        setWinner('player');
        setLastAIResult(null);
        return;
      }

      // AI's turn
      const newPlayerBoard = deepCloneBoard(playerBoard);
      const newAI = cloneAIState(aiState);
      const aiMove = chooseAIMove(newAI);
      const aiResult = processAttack(newPlayerBoard, aiMove);

      if (aiResult) {
        updateAIState(newAI, aiResult);
        setPlayerBoard(newPlayerBoard);
        setAIState(newAI);
        setLastAIResult(aiResult);

        // Check if AI wins
        if (allShipsSunk(newPlayerBoard)) {
          setPhase('gameover');
          setWinner('ai');
          return;
        }
      }
    },
    [phase, aiBoard, playerBoard, aiState],
  );

  return (
    <div className="app">
      <h1 className="title">Battleship</h1>

      <StatusBar
        phase={phase}
        winner={winner}
        lastPlayerResult={lastPlayerResult}
        lastAIResult={lastAIResult}
      />

      <div className="controls">
        {phase === 'setup' && (
          <>
            <button className="btn" onClick={handleRandomize}>
              Randomize My Board
            </button>
            <button className="btn btn-primary" onClick={handleStartGame}>
              Start Game
            </button>
          </>
        )}
        <button className="btn btn-secondary" onClick={handleRestart}>
          Restart Game
        </button>
      </div>

      <div className="boards">
        <BoardView
          board={playerBoard}
          label="Your Fleet"
          hideShips={false}
          interactive={false}
        />
        <BoardView
          board={aiBoard}
          label="Enemy Waters"
          hideShips={true}
          onCellClick={handlePlayerAttack}
          interactive={phase === 'playing'}
        />
      </div>

      <div className="fleet-panels">
        <FleetStatus ships={playerBoard.ships} label="Your Ships" />
        <FleetStatus ships={aiBoard.ships} label="Enemy Ships" />
      </div>
    </div>
  );
}
