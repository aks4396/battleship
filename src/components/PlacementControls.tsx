import type { Orientation, ShipDef } from '../game/types';
import { FLEET } from '../game/types';
import './PlacementControls.css';

interface PlacementControlsProps {
  /** Index of the currently selected ship in FLEET, or null if none selected */
  selectedShipIndex: number | null;
  /** Set of ship names that have already been placed */
  placedShipNames: Set<string>;
  /** Current placement orientation */
  orientation: Orientation;
  /** Called when a ship is selected from the fleet list */
  onSelectShip: (index: number) => void;
  /** Called to toggle orientation */
  onRotate: () => void;
  /** Called to clear all placed ships */
  onReset: () => void;
}

export function PlacementControls({
  selectedShipIndex,
  placedShipNames,
  orientation,
  onSelectShip,
  onRotate,
  onReset,
}: PlacementControlsProps) {
  const allPlaced = placedShipNames.size === FLEET.length;

  return (
    <div className="placement-controls">
      <h3 className="placement-title">Place Your Ships</h3>
      <p className="placement-hint">
        {allPlaced
          ? 'All ships placed! Press Start Game.'
          : 'Select a ship, then click a cell on your board.'}
      </p>

      <ul className="placement-fleet">
        {FLEET.map((def: ShipDef, index: number) => {
          const placed = placedShipNames.has(def.name);
          const selected = selectedShipIndex === index;
          return (
            <li
              key={def.name}
              className={`placement-ship ${placed ? 'placed' : ''} ${selected ? 'selected' : ''}`}
              onClick={() => {
                if (!placed) onSelectShip(index);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !placed) {
                  onSelectShip(index);
                }
              }}
            >
              <span className="ship-name">{def.name}</span>
              <span className="ship-size">({def.size})</span>
              {placed && <span className="ship-check"> ✓</span>}
            </li>
          );
        })}
      </ul>

      <div className="placement-buttons">
        <button
          className="btn btn-placement"
          onClick={onRotate}
          disabled={allPlaced}
          title={`Current: ${orientation}`}
        >
          Rotate ({orientation === 'horizontal' ? 'H' : 'V'})
        </button>
        <button
          className="btn btn-placement"
          onClick={onReset}
          disabled={placedShipNames.size === 0}
        >
          Reset Placement
        </button>
      </div>
    </div>
  );
}
