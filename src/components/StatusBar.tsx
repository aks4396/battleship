import type { AttackResult, GamePhase, Winner } from '../game/types';

interface StatusBarProps {
  phase: GamePhase;
  winner: Winner;
  lastPlayerResult: AttackResult | null;
  lastAIResult: AttackResult | null;
}

function describeResult(result: AttackResult | null, actor: string): string {
  if (!result) return '';
  const { coord, outcome, shipName } = result;
  const col = String.fromCharCode(65 + coord.col);
  const row = coord.row + 1;
  const cell = `${col}${row}`;

  switch (outcome) {
    case 'miss':
      return `${actor} fired at ${cell} — Miss.`;
    case 'hit':
      return `${actor} fired at ${cell} — Hit!`;
    case 'sunk':
      return `${actor} fired at ${cell} — Sunk ${shipName}!`;
  }
}

export function StatusBar({
  phase,
  winner,
  lastPlayerResult,
  lastAIResult,
}: StatusBarProps) {
  if (phase === 'setup') {
    return (
      <div className="status-bar">
        <p>Place your fleet, then press <strong>Start Game</strong>.</p>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="status-bar">
        <p className="game-result">
          {winner === 'player'
            ? '🎉 You win! All enemy ships destroyed!'
            : '💀 You lose. The AI sank your fleet.'}
        </p>
      </div>
    );
  }

  // Playing phase
  const playerMsg = describeResult(lastPlayerResult, 'You');
  const aiMsg = describeResult(lastAIResult, 'AI');

  return (
    <div className="status-bar">
      {playerMsg && <p>{playerMsg}</p>}
      {aiMsg && <p>{aiMsg}</p>}
      {!playerMsg && !aiMsg && <p>Your turn — click on the enemy board to fire.</p>}
    </div>
  );
}
