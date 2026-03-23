import './UnderwaterAmbience.css';

/**
 * Decorative underwater background layer.
 * Renders animated bubbles and fish silhouettes behind the game UI.
 * All elements use pointer-events: none to avoid interfering with gameplay.
 */
export function UnderwaterAmbience() {
  return (
    <div className="underwater-ambience" aria-hidden="true">
      {/* Bubbles */}
      <div className="bubble bubble-1" />
      <div className="bubble bubble-2" />
      <div className="bubble bubble-3" />
      <div className="bubble bubble-4" />
      <div className="bubble bubble-5" />
      <div className="bubble bubble-6" />
      <div className="bubble bubble-7" />
      <div className="bubble bubble-8" />

      {/* Fish silhouettes */}
      <div className="fish fish-1">
        <svg viewBox="0 0 40 20" width="40" height="20">
          <path d="M0,10 Q10,0 20,5 L35,2 Q40,10 35,18 L20,15 Q10,20 0,10 Z" fill="currentColor" opacity="0.15" />
          <circle cx="25" cy="9" r="1.5" fill="rgba(150,200,255,0.3)" />
        </svg>
      </div>
      <div className="fish fish-2">
        <svg viewBox="0 0 30 16" width="30" height="16">
          <path d="M0,8 Q8,0 15,4 L25,1 Q30,8 25,15 L15,12 Q8,16 0,8 Z" fill="currentColor" opacity="0.12" />
          <circle cx="19" cy="7" r="1" fill="rgba(150,200,255,0.25)" />
        </svg>
      </div>
      <div className="fish fish-3">
        <svg viewBox="0 0 35 18" width="35" height="18">
          <path d="M0,9 Q9,0 18,4 L30,2 Q35,9 30,16 L18,14 Q9,18 0,9 Z" fill="currentColor" opacity="0.1" />
          <circle cx="22" cy="8" r="1.2" fill="rgba(150,200,255,0.2)" />
        </svg>
      </div>

      {/* Light rays from surface */}
      <div className="light-ray light-ray-1" />
      <div className="light-ray light-ray-2" />
      <div className="light-ray light-ray-3" />
    </div>
  );
}
