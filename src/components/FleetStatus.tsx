import type { Ship } from '../game/types';

interface FleetStatusProps {
  ships: Ship[];
  label: string;
}

export function FleetStatus({ ships, label }: FleetStatusProps) {
  return (
    <div className="fleet-status">
      <h3>{label}</h3>
      <ul className="fleet-list">
        {ships.map((ship) => (
          <li key={ship.name} className={ship.sunk ? 'ship-sunk' : 'ship-alive'}>
            {ship.name} ({ship.size}) {ship.sunk ? '— SUNK' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
