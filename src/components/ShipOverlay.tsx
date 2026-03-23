/**
 * SVG-based ship overlay that renders shipwreck-style visuals
 * on top of grid cells. Each segment (bow/mid/stern) has unique
 * wreck details: cracked hull, barnacles, corrosion, seaweed.
 *
 * All overlays are purely decorative and use pointer-events: none.
 */

interface ShipOverlayProps {
  position: 'bow' | 'mid' | 'stern' | 'solo';
  orientation: 'h' | 'v';
  isSunk: boolean;
  /** Cell size in px — the overlay fills the entire cell */
  size?: number;
}

/** Horizontal bow — pointed left end of a wreck hull */
function BowH({ isSunk }: { isSunk: boolean }) {
  const fill = isSunk ? 'rgba(60,35,30,0.85)' : 'rgba(55,80,95,0.8)';
  const rust = isSunk ? 'rgba(120,60,40,0.4)' : 'rgba(100,70,50,0.2)';
  const barnacle = isSunk ? 'rgba(140,130,110,0.5)' : 'rgba(130,140,130,0.3)';
  const seaweed = isSunk ? 'rgba(30,90,50,0.35)' : 'rgba(30,80,50,0.15)';
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" className="ship-overlay-svg">
      {/* Hull plate */}
      <path d="M2,14 Q4,4 14,2 L28,2 L28,26 L14,26 Q4,24 2,14 Z" fill={fill} />
      {/* Metal plating lines */}
      <line x1="10" y1="4" x2="10" y2="24" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <line x1="18" y1="2" x2="18" y2="26" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      {/* Rivet dots */}
      <circle cx="6" cy="10" r="0.8" fill="rgba(0,0,0,0.2)" />
      <circle cx="6" cy="18" r="0.8" fill="rgba(0,0,0,0.2)" />
      <circle cx="14" cy="5" r="0.6" fill="rgba(0,0,0,0.15)" />
      <circle cx="14" cy="23" r="0.6" fill="rgba(0,0,0,0.15)" />
      {/* Rust/corrosion patches */}
      <ellipse cx="8" cy="20" rx="3" ry="2" fill={rust} />
      <ellipse cx="20" cy="8" rx="2.5" ry="1.5" fill={rust} opacity="0.7" />
      {/* Hull crack */}
      <path d="M12,8 L15,12 L13,16" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" fill="none" />
      {/* Barnacles */}
      <circle cx="5" cy="22" r="1.2" fill={barnacle} />
      <circle cx="7" cy="24" r="0.9" fill={barnacle} opacity="0.8" />
      {/* Seaweed strand */}
      <path d="M3,24 Q5,20 3,16" stroke={seaweed} strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Top highlight edge */}
      <path d="M4,5 Q8,3 14,2 L28,2" stroke="rgba(150,190,210,0.15)" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

/** Horizontal mid — center hull section with damage details */
function MidH({ isSunk }: { isSunk: boolean }) {
  const fill = isSunk ? 'rgba(55,32,28,0.85)' : 'rgba(50,75,90,0.8)';
  const rust = isSunk ? 'rgba(110,55,35,0.4)' : 'rgba(90,65,45,0.2)';
  const barnacle = isSunk ? 'rgba(135,125,105,0.45)' : 'rgba(120,130,120,0.25)';
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" className="ship-overlay-svg">
      {/* Hull plate */}
      <rect x="0" y="2" width="28" height="24" fill={fill} />
      {/* Plating seams */}
      <line x1="0" y1="9" x2="28" y2="9" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      <line x1="0" y1="19" x2="28" y2="19" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      <line x1="14" y1="2" x2="14" y2="26" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
      {/* Rivets */}
      <circle cx="7" cy="5" r="0.6" fill="rgba(0,0,0,0.18)" />
      <circle cx="21" cy="5" r="0.6" fill="rgba(0,0,0,0.18)" />
      <circle cx="7" cy="23" r="0.6" fill="rgba(0,0,0,0.18)" />
      <circle cx="21" cy="23" r="0.6" fill="rgba(0,0,0,0.18)" />
      {/* Rust patches */}
      <ellipse cx="18" cy="14" rx="4" ry="2.5" fill={rust} />
      <ellipse cx="6" cy="22" rx="3" ry="1.8" fill={rust} opacity="0.6" />
      {/* Damage / hole */}
      {isSunk && (
        <ellipse cx="14" cy="14" rx="3" ry="2.5" fill="rgba(15,25,35,0.5)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      )}
      {/* Barnacles */}
      <circle cx="4" cy="24" r="1" fill={barnacle} />
      <circle cx="24" cy="24" r="1.1" fill={barnacle} opacity="0.7" />
      {/* Top highlight */}
      <line x1="0" y1="2" x2="28" y2="2" stroke="rgba(150,190,210,0.12)" strokeWidth="0.5" />
    </svg>
  );
}

/** Horizontal stern — flat back end of the hull */
function SternH({ isSunk }: { isSunk: boolean }) {
  const fill = isSunk ? 'rgba(58,33,28,0.85)' : 'rgba(52,78,92,0.8)';
  const rust = isSunk ? 'rgba(115,58,38,0.4)' : 'rgba(95,68,48,0.2)';
  const barnacle = isSunk ? 'rgba(138,128,108,0.5)' : 'rgba(125,135,125,0.3)';
  const seaweed = isSunk ? 'rgba(28,85,48,0.35)' : 'rgba(28,75,45,0.15)';
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" className="ship-overlay-svg">
      {/* Hull plate */}
      <path d="M0,2 L20,2 Q26,4 28,10 L28,18 Q26,24 20,26 L0,26 Z" fill={fill} />
      {/* Plating seams */}
      <line x1="8" y1="2" x2="8" y2="26" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      <line x1="16" y1="2" x2="16" y2="26" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      {/* Rivets */}
      <circle cx="22" cy="10" r="0.7" fill="rgba(0,0,0,0.2)" />
      <circle cx="22" cy="18" r="0.7" fill="rgba(0,0,0,0.2)" />
      {/* Rust */}
      <ellipse cx="12" cy="20" rx="3.5" ry="2" fill={rust} />
      <ellipse cx="22" cy="6" rx="2" ry="1.5" fill={rust} opacity="0.7" />
      {/* Hull crack */}
      <path d="M18,6 L20,10 L17,14 L19,18" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" fill="none" />
      {/* Barnacles */}
      <circle cx="24" cy="22" r="1.3" fill={barnacle} />
      <circle cx="22" cy="24" r="0.8" fill={barnacle} opacity="0.7" />
      {/* Seaweed */}
      <path d="M25,24 Q22,20 25,16" stroke={seaweed} strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Top highlight */}
      <path d="M0,2 L20,2 Q26,4 28,10" stroke="rgba(150,190,210,0.12)" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

/** Vertical bow — pointed top end */
function BowV({ isSunk }: { isSunk: boolean }) {
  const fill = isSunk ? 'rgba(60,35,30,0.85)' : 'rgba(55,80,95,0.8)';
  const rust = isSunk ? 'rgba(120,60,40,0.4)' : 'rgba(100,70,50,0.2)';
  const barnacle = isSunk ? 'rgba(140,130,110,0.5)' : 'rgba(130,140,130,0.3)';
  const seaweed = isSunk ? 'rgba(30,90,50,0.35)' : 'rgba(30,80,50,0.15)';
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" className="ship-overlay-svg">
      {/* Hull plate */}
      <path d="M14,2 Q4,4 2,14 L2,28 L26,28 L26,14 Q24,4 14,2 Z" fill={fill} />
      {/* Plating seams */}
      <line x1="4" y1="10" x2="24" y2="10" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <line x1="2" y1="18" x2="26" y2="18" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      {/* Rivets */}
      <circle cx="10" cy="6" r="0.8" fill="rgba(0,0,0,0.2)" />
      <circle cx="18" cy="6" r="0.8" fill="rgba(0,0,0,0.2)" />
      <circle cx="5" cy="14" r="0.6" fill="rgba(0,0,0,0.15)" />
      <circle cx="23" cy="14" r="0.6" fill="rgba(0,0,0,0.15)" />
      {/* Rust */}
      <ellipse cx="20" cy="8" rx="2" ry="3" fill={rust} />
      <ellipse cx="8" cy="20" rx="1.5" ry="2.5" fill={rust} opacity="0.7" />
      {/* Crack */}
      <path d="M8,12 L12,15 L8,18" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" fill="none" />
      {/* Barnacles */}
      <circle cx="22" cy="5" r="1.2" fill={barnacle} />
      <circle cx="24" cy="7" r="0.9" fill={barnacle} opacity="0.8" />
      {/* Seaweed */}
      <path d="M24,3 Q20,5 24,8" stroke={seaweed} strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Left highlight edge */}
      <path d="M5,24 Q3,18 2,14 Q4,4 14,2" stroke="rgba(150,190,210,0.15)" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

/** Vertical mid */
function MidV({ isSunk }: { isSunk: boolean }) {
  const fill = isSunk ? 'rgba(55,32,28,0.85)' : 'rgba(50,75,90,0.8)';
  const rust = isSunk ? 'rgba(110,55,35,0.4)' : 'rgba(90,65,45,0.2)';
  const barnacle = isSunk ? 'rgba(135,125,105,0.45)' : 'rgba(120,130,120,0.25)';
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" className="ship-overlay-svg">
      {/* Hull plate */}
      <rect x="2" y="0" width="24" height="28" fill={fill} />
      {/* Plating seams */}
      <line x1="9" y1="0" x2="9" y2="28" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      <line x1="19" y1="0" x2="19" y2="28" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      <line x1="2" y1="14" x2="26" y2="14" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
      {/* Rivets */}
      <circle cx="5" cy="7" r="0.6" fill="rgba(0,0,0,0.18)" />
      <circle cx="5" cy="21" r="0.6" fill="rgba(0,0,0,0.18)" />
      <circle cx="23" cy="7" r="0.6" fill="rgba(0,0,0,0.18)" />
      <circle cx="23" cy="21" r="0.6" fill="rgba(0,0,0,0.18)" />
      {/* Rust */}
      <ellipse cx="14" cy="18" rx="2.5" ry="4" fill={rust} />
      <ellipse cx="22" cy="6" rx="1.8" ry="3" fill={rust} opacity="0.6" />
      {/* Damage hole */}
      {isSunk && (
        <ellipse cx="14" cy="14" rx="2.5" ry="3" fill="rgba(15,25,35,0.5)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      )}
      {/* Barnacles */}
      <circle cx="24" cy="4" r="1" fill={barnacle} />
      <circle cx="24" cy="24" r="1.1" fill={barnacle} opacity="0.7" />
      {/* Left highlight */}
      <line x1="2" y1="0" x2="2" y2="28" stroke="rgba(150,190,210,0.12)" strokeWidth="0.5" />
    </svg>
  );
}

/** Vertical stern — flat bottom end */
function SternV({ isSunk }: { isSunk: boolean }) {
  const fill = isSunk ? 'rgba(58,33,28,0.85)' : 'rgba(52,78,92,0.8)';
  const rust = isSunk ? 'rgba(115,58,38,0.4)' : 'rgba(95,68,48,0.2)';
  const barnacle = isSunk ? 'rgba(138,128,108,0.5)' : 'rgba(125,135,125,0.3)';
  const seaweed = isSunk ? 'rgba(28,85,48,0.35)' : 'rgba(28,75,45,0.15)';
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" className="ship-overlay-svg">
      {/* Hull plate */}
      <path d="M2,0 L26,0 L26,20 Q24,26 18,28 L10,28 Q4,26 2,20 Z" fill={fill} />
      {/* Plating seams */}
      <line x1="2" y1="8" x2="26" y2="8" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      <line x1="2" y1="16" x2="26" y2="16" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      {/* Rivets */}
      <circle cx="10" cy="22" r="0.7" fill="rgba(0,0,0,0.2)" />
      <circle cx="18" cy="22" r="0.7" fill="rgba(0,0,0,0.2)" />
      {/* Rust */}
      <ellipse cx="20" cy="12" rx="2" ry="3.5" fill={rust} />
      <ellipse cx="6" cy="22" rx="1.5" ry="2" fill={rust} opacity="0.7" />
      {/* Crack */}
      <path d="M6,18 L10,20 L6,24" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" fill="none" />
      {/* Barnacles */}
      <circle cx="22" cy="24" r="1.3" fill={barnacle} />
      <circle cx="24" cy="22" r="0.8" fill={barnacle} opacity="0.7" />
      {/* Seaweed */}
      <path d="M24,25 Q20,22 24,18" stroke={seaweed} strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Left highlight */}
      <path d="M2,0 L2,20 Q4,26 10,28" stroke="rgba(150,190,210,0.12)" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

export function ShipOverlay({ position, orientation, isSunk }: ShipOverlayProps) {
  const isH = orientation === 'h';

  let content: React.ReactNode;
  if (position === 'solo') {
    content = isH ? <BowH isSunk={isSunk} /> : <BowV isSunk={isSunk} />;
  } else if (position === 'bow') {
    content = isH ? <BowH isSunk={isSunk} /> : <BowV isSunk={isSunk} />;
  } else if (position === 'stern') {
    content = isH ? <SternH isSunk={isSunk} /> : <SternV isSunk={isSunk} />;
  } else {
    content = isH ? <MidH isSunk={isSunk} /> : <MidV isSunk={isSunk} />;
  }

  return (
    <div className={`ship-overlay ${isSunk ? 'ship-overlay-sunk' : ''}`}>
      {content}
    </div>
  );
}
