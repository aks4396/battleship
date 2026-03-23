import './UnderwaterAmbience.css';

/**
 * Decorative underwater background layer.
 * Renders animated bubbles, fish silhouettes, seafloor elements,
 * and environmental storytelling behind the game UI.
 * All elements use pointer-events: none to avoid interfering with gameplay.
 */
export function UnderwaterAmbience() {
  return (
    <div className="underwater-ambience" aria-hidden="true">
      {/* Caustic light overlay */}
      <div className="caustics" />

      {/* Light rays from surface */}
      <div className="light-ray light-ray-1" />
      <div className="light-ray light-ray-2" />
      <div className="light-ray light-ray-3" />
      <div className="light-ray light-ray-4" />

      {/* Depth particles — floating debris/plankton */}
      <div className="particle particle-1" />
      <div className="particle particle-2" />
      <div className="particle particle-3" />
      <div className="particle particle-4" />
      <div className="particle particle-5" />
      <div className="particle particle-6" />

      {/* Bubbles */}
      <div className="bubble bubble-1" />
      <div className="bubble bubble-2" />
      <div className="bubble bubble-3" />
      <div className="bubble bubble-4" />
      <div className="bubble bubble-5" />
      <div className="bubble bubble-6" />
      <div className="bubble bubble-7" />
      <div className="bubble bubble-8" />
      <div className="bubble bubble-9" />
      <div className="bubble bubble-10" />

      {/* Bubble streams from seafloor */}
      <div className="bubble-stream stream-1">
        <div className="stream-bubble sb-1" />
        <div className="stream-bubble sb-2" />
        <div className="stream-bubble sb-3" />
      </div>
      <div className="bubble-stream stream-2">
        <div className="stream-bubble sb-1" />
        <div className="stream-bubble sb-2" />
        <div className="stream-bubble sb-3" />
      </div>

      {/* Fish silhouettes — individual */}
      <div className="fish fish-1">
        <svg viewBox="0 0 50 24" width="50" height="24">
          <path d="M2,12 Q12,2 24,6 L42,3 Q50,12 42,21 L24,18 Q12,22 2,12 Z" fill="currentColor" />
          <circle cx="32" cy="10" r="2" fill="rgba(120,180,220,0.5)" />
          <path d="M24,8 L24,16" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </div>
      <div className="fish fish-2">
        <svg viewBox="0 0 36 18" width="36" height="18">
          <path d="M0,9 Q9,1 18,5 L30,2 Q36,9 30,16 L18,13 Q9,17 0,9 Z" fill="currentColor" />
          <circle cx="22" cy="8" r="1.5" fill="rgba(120,180,220,0.4)" />
        </svg>
      </div>
      <div className="fish fish-3">
        <svg viewBox="0 0 42 20" width="42" height="20">
          <path d="M0,10 Q10,0 22,5 L36,2 Q42,10 36,18 L22,15 Q10,20 0,10 Z" fill="currentColor" />
          <circle cx="27" cy="9" r="1.8" fill="rgba(120,180,220,0.45)" />
          <path d="M22,6 L22,14" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </div>

      {/* School of small fish */}
      <div className="fish-school school-1">
        {Array.from({ length: 7 }, (_, i) => (
          <svg key={i} className={`school-fish sf-${i + 1}`} viewBox="0 0 16 8" width="16" height="8">
            <path d="M0,4 Q4,0 8,2 L14,1 Q16,4 14,7 L8,6 Q4,8 0,4 Z" fill="currentColor" />
          </svg>
        ))}
      </div>

      {/* Jellyfish */}
      <div className="jellyfish jf-1">
        <svg viewBox="0 0 30 50" width="30" height="50">
          <ellipse cx="15" cy="12" rx="12" ry="10" fill="currentColor" opacity="0.15" />
          <ellipse cx="15" cy="12" rx="8" ry="7" fill="currentColor" opacity="0.08" />
          <path d="M6,18 Q8,30 5,42" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.12" />
          <path d="M11,20 Q12,32 9,45" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.1" />
          <path d="M19,20 Q18,32 21,45" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.1" />
          <path d="M24,18 Q22,30 25,42" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.12" />
        </svg>
      </div>
      <div className="jellyfish jf-2">
        <svg viewBox="0 0 24 40" width="24" height="40">
          <ellipse cx="12" cy="10" rx="10" ry="8" fill="currentColor" opacity="0.12" />
          <path d="M4,15 Q6,25 3,35" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.1" />
          <path d="M12,17 Q11,27 13,37" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.08" />
          <path d="M20,15 Q18,25 21,35" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.1" />
        </svg>
      </div>

      {/* Sea turtle */}
      <div className="sea-turtle">
        <svg viewBox="0 0 60 40" width="60" height="40">
          <ellipse cx="28" cy="20" rx="16" ry="12" fill="currentColor" opacity="0.1" />
          <ellipse cx="28" cy="20" rx="12" ry="9" fill="currentColor" opacity="0.06" />
          <path d="M12,14 L2,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.08" />
          <path d="M12,26 L4,32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.08" />
          <path d="M44,14 L52,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.08" />
          <path d="M44,26 L50,30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.08" />
          <ellipse cx="46" cy="18" rx="5" ry="3" fill="currentColor" opacity="0.08" />
          <circle cx="50" cy="17" r="1" fill="rgba(120,180,220,0.2)" />
        </svg>
      </div>

      {/* Seafloor elements */}
      <div className="seafloor">
        {/* Seafloor base gradient */}
        <div className="seafloor-ground" />

        {/* Coral formations */}
        <svg className="coral coral-1" viewBox="0 0 80 60" width="80" height="60">
          <path d="M10,60 Q12,40 8,25 Q5,15 12,10 Q15,20 18,28 Q20,15 25,8 Q28,18 26,30 Q30,20 35,12 Q38,22 34,35 Q38,25 42,18 Q44,28 40,40 L40,60 Z" fill="rgba(180,80,90,0.12)" />
          <path d="M35,60 Q38,45 42,35 Q46,25 50,18 Q53,28 48,38 Q52,30 55,22 Q58,32 54,42 L55,60 Z" fill="rgba(200,100,80,0.1)" />
        </svg>
        <svg className="coral coral-2" viewBox="0 0 60 50" width="60" height="50">
          <path d="M5,50 Q8,35 12,25 Q15,15 20,10 Q22,20 18,30 Q22,22 26,15 Q28,25 25,35 L30,50 Z" fill="rgba(160,90,100,0.1)" />
          <path d="M28,50 Q30,38 35,28 Q38,20 42,15 Q44,25 40,32 Q44,26 48,20 Q50,30 46,40 L48,50 Z" fill="rgba(180,70,80,0.08)" />
        </svg>

        {/* Rock formations */}
        <svg className="rocks rocks-1" viewBox="0 0 120 50" width="120" height="50">
          <path d="M0,50 L5,35 Q10,28 18,32 L25,25 Q32,20 38,28 L42,35 Q48,30 55,35 L60,50 Z" fill="rgba(40,55,65,0.3)" />
          <path d="M50,50 L58,38 Q65,30 72,35 L78,28 Q85,22 90,30 L98,38 Q105,32 110,38 L120,50 Z" fill="rgba(35,50,60,0.25)" />
        </svg>

        {/* Treasure chest */}
        <svg className="treasure" viewBox="0 0 50 40" width="50" height="40">
          <rect x="8" y="18" width="34" height="20" rx="2" fill="rgba(120,80,30,0.18)" />
          <path d="M6,18 Q25,10 44,18" fill="rgba(140,90,35,0.2)" />
          <rect x="22" y="22" width="6" height="5" rx="1" fill="rgba(220,180,50,0.2)" />
          <circle cx="25" cy="24" r="1.5" fill="rgba(255,220,80,0.25)" />
          {/* Gold coins spilling out */}
          <circle cx="14" cy="36" r="3" fill="rgba(220,180,50,0.12)" />
          <circle cx="38" cy="35" r="2.5" fill="rgba(220,180,50,0.1)" />
          <circle cx="10" cy="34" r="2" fill="rgba(220,180,50,0.08)" />
        </svg>

        {/* Shipwreck silhouette */}
        <svg className="shipwreck-bg" viewBox="0 0 200 100" width="200" height="100">
          <path d="M10,95 L15,70 Q20,65 30,68 L40,55 Q45,48 50,50 L55,42 L60,45 L70,35 L75,38 L80,30 L85,32 L90,40 Q95,35 100,38 L105,45 L110,42 Q115,40 120,45 L130,50 Q135,48 140,55 L150,60 Q155,58 160,65 L170,70 L175,80 Q180,85 185,90 L190,95 Z" fill="rgba(30,45,55,0.2)" />
          <line x1="80" y1="30" x2="80" y2="10" stroke="rgba(40,55,65,0.15)" strokeWidth="2" />
          <line x1="80" y1="10" x2="110" y2="20" stroke="rgba(40,55,65,0.1)" strokeWidth="1" />
          <line x1="80" y1="15" x2="105" y2="23" stroke="rgba(40,55,65,0.08)" strokeWidth="1" />
          <line x1="55" y1="42" x2="55" y2="25" stroke="rgba(40,55,65,0.12)" strokeWidth="1.5" />
        </svg>

        {/* Underwater ruins / columns */}
        <svg className="ruins" viewBox="0 0 80 60" width="80" height="60">
          <rect x="5" y="15" width="8" height="45" fill="rgba(50,65,75,0.12)" />
          <rect x="3" y="12" width="12" height="5" rx="1" fill="rgba(55,70,80,0.1)" />
          <rect x="25" y="25" width="7" height="35" fill="rgba(50,65,75,0.1)" />
          <rect x="23" y="22" width="11" height="5" rx="1" fill="rgba(55,70,80,0.08)" />
          <path d="M3,12 L8,5 L15,12" fill="rgba(55,70,80,0.08)" />
          {/* Broken column */}
          <rect x="50" y="35" width="8" height="25" fill="rgba(50,65,75,0.1)" transform="rotate(-8, 54, 47)" />
        </svg>

        {/* Seafloor plants / seaweed */}
        <svg className="seaweed seaweed-1" viewBox="0 0 20 60" width="20" height="60">
          <path d="M10,60 Q6,45 12,35 Q18,25 8,15 Q5,10 10,2" stroke="rgba(30,100,60,0.15)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
        <svg className="seaweed seaweed-2" viewBox="0 0 20 50" width="20" height="50">
          <path d="M10,50 Q14,38 8,28 Q4,20 12,10 Q14,5 10,0" stroke="rgba(25,90,55,0.12)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <svg className="seaweed seaweed-3" viewBox="0 0 20 55" width="20" height="55">
          <path d="M10,55 Q5,42 13,32 Q18,22 7,12 Q4,6 8,0" stroke="rgba(28,95,58,0.13)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
