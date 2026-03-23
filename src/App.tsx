import { useCallback, useMemo, useState } from 'react';
import type {
  AIState,
  AttackResult,
  Board,
  Coord,
  GamePhase,
  Orientation,
  Winner,
} from './game';
import {
  allShipsSunk,
  canPlaceShip,
  chooseAIMove,
  createAIState,
  createEmptyBoard,
  FLEET,
  placeShip,
  processAttack,
  randomPlacement,
  shipCoords,
  updateAIState,
} from './game';
import { BoardView } from './components/Board';
import { StatusBar } from './components/StatusBar';
import { FleetStatus } from './components/FleetStatus';
import { PlacementControls } from './components/PlacementControls';
import { UnderwaterAmbience } from './components/UnderwaterAmbience';
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
  const [playerBoard, setPlayerBoard] = useState<Board>(() => createEmptyBoard());
  const [aiBoard, setAIBoard] = useState<Board>(() => randomPlacement());
  const [aiState, setAIState] = useState<AIState>(() => createAIState());
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [winner, setWinner] = useState<Winner>(null);
  const [lastPlayerResult, setLastPlayerResult] = useState<AttackResult | null>(null);
  const [lastAIResult, setLastAIResult] = useState<AttackResult | null>(null);

  // Placement state
  const [selectedShipIndex, setSelectedShipIndex] = useState<number | null>(0);
  const [placementOrientation, setPlacementOrientation] = useState<Orientation>('horizontal');
  const [hoverCell, setHoverCell] = useState<Coord | null>(null);

  // Derive placed ship names from the board
  const placedShipNames = useMemo(
    () => new Set(playerBoard.ships.map((s) => s.name)),
    [playerBoard.ships],
  );

  const allShipsPlaced = placedShipNames.size === FLEET.length;

  // Compute placement preview cells for the currently hovered cell
  const placementPreview = useMemo(() => {
    if (phase !== 'setup' || selectedShipIndex === null || !hoverCell) return null;
    const def = FLEET[selectedShipIndex];
    const coords = shipCoords(hoverCell, placementOrientation, def.size);
    if (!coords) return { coords: [], valid: false };
    const valid = canPlaceShip(playerBoard, coords);
    return { coords, valid };
  }, [phase, selectedShipIndex, hoverCell, placementOrientation, playerBoard]);

  const handlePlaceShip = useCallback(
    (row: number, col: number) => {
      if (phase !== 'setup' || selectedShipIndex === null) return;
      const def = FLEET[selectedShipIndex];
      if (placedShipNames.has(def.name)) return;

      const coords = shipCoords({ row, col }, placementOrientation, def.size);
      if (!coords || !canPlaceShip(playerBoard, coords)) return;

      const newBoard = deepCloneBoard(playerBoard);
      placeShip(newBoard, def, coords);
      setPlayerBoard(newBoard);

      // Auto-select next unplaced ship
      const newPlacedNames = new Set(placedShipNames);
      newPlacedNames.add(def.name);
      const nextIndex = FLEET.findIndex(
        (f) => !newPlacedNames.has(f.name),
      );
      setSelectedShipIndex(nextIndex >= 0 ? nextIndex : null);
      setHoverCell(null);
    },
    [phase, selectedShipIndex, placementOrientation, playerBoard, placedShipNames],
  );

  const handleRandomize = useCallback(() => {
    if (phase !== 'setup') return;
    setPlayerBoard(randomPlacement());
    setSelectedShipIndex(null);
    setHoverCell(null);
  }, [phase]);

  const handleResetPlacement = useCallback(() => {
    if (phase !== 'setup') return;
    setPlayerBoard(createEmptyBoard());
    setSelectedShipIndex(0);
    setHoverCell(null);
  }, [phase]);

  const handleRotate = useCallback(() => {
    setPlacementOrientation((prev) =>
      prev === 'horizontal' ? 'vertical' : 'horizontal',
    );
  }, []);

  const handleStartGame = useCallback(() => {
    if (phase !== 'setup' || !allShipsPlaced) return;
    setPhase('playing');
    setLastPlayerResult(null);
    setLastAIResult(null);
  }, [phase, allShipsPlaced]);

  const handleRestart = useCallback(() => {
    setPlayerBoard(createEmptyBoard());
    setAIBoard(randomPlacement());
    setAIState(createAIState());
    setPhase('setup');
    setWinner(null);
    setLastPlayerResult(null);
    setLastAIResult(null);
    setSelectedShipIndex(0);
    setPlacementOrientation('horizontal');
    setHoverCell(null);
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
    <>
    <UnderwaterAmbience />
    <div className="app">
      <h1 className="title">Battleship</h1>

      <StatusBar
        phase={phase}
        winner={winner}
        lastPlayerResult={lastPlayerResult}
        lastAIResult={lastAIResult}
        allShipsPlaced={allShipsPlaced}
        selectedShipIndex={selectedShipIndex}
      />

      <div className="controls">
        {phase === 'setup' && (
          <>
            <button className="btn" onClick={handleRandomize}>
              Randomize My Board
            </button>
            <button
              className="btn btn-primary"
              onClick={handleStartGame}
              disabled={!allShipsPlaced}
            >
              Start Game
            </button>
          </>
        )}
        <button className="btn btn-secondary" onClick={handleRestart}>
          Restart Game
        </button>
      </div>

      <div className="boards-area">
        {phase === 'setup' && (
          <PlacementControls
            selectedShipIndex={selectedShipIndex}
            placedShipNames={placedShipNames}
            orientation={placementOrientation}
            onSelectShip={setSelectedShipIndex}
            onRotate={handleRotate}
            onReset={handleResetPlacement}
          />
        )}

        <div className="boards">
          <BoardView
            board={playerBoard}
            label="Your Fleet"
            hideShips={false}
            interactive={phase === 'setup' && selectedShipIndex !== null}
            onCellClick={phase === 'setup' ? handlePlaceShip : undefined}
            onCellHover={phase === 'setup' ? setHoverCell : undefined}
            placementPreview={placementPreview}
          />
          <BoardView
            board={aiBoard}
            label="Enemy Waters"
            hideShips={true}
            onCellClick={handlePlayerAttack}
            interactive={phase === 'playing'}
          />
        </div>
      </div>

      <div className="fleet-panels">
        <FleetStatus ships={playerBoard.ships} label="Your Ships" />
        <FleetStatus ships={aiBoard.ships} label="Enemy Ships" />
      </div>
    </div>
    </>
  );
}
