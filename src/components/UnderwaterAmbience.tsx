import { motion } from 'motion/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './UnderwaterAmbience.css';

/**
 * Decorative underwater background layer — v3 with Motion for React.
 * Renders animated sea creatures, environmental elements, and ambient effects.
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

      {/* Depth particles */}
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

      {/* ─── Motion-animated sea creatures ─── */}

      {/* Individual fish 1 */}
      <motion.div
        className="creature creature-fish-1"
        animate={{ x: ['calc(-80px)', 'calc(100vw + 80px)'], y: [0, -15, 10, -8, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear', delay: 0 }}
      >
        <svg viewBox="0 0 50 24" width="50" height="24">
          <path d="M2,12 Q12,2 24,6 L42,3 Q50,12 42,21 L24,18 Q12,22 2,12 Z" fill="currentColor" />
          <circle cx="32" cy="10" r="2" fill="rgba(120,180,220,0.5)" />
          <path d="M24,8 L24,16" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </motion.div>

      {/* Individual fish 2 */}
      <motion.div
        className="creature creature-fish-2"
        animate={{ x: ['calc(-60px)', 'calc(100vw + 60px)'], y: [0, 10, -12, 6, 0] }}
        transition={{ duration: 36, repeat: Infinity, ease: 'linear', delay: 8 }}
      >
        <svg viewBox="0 0 36 18" width="36" height="18">
          <path d="M0,9 Q9,1 18,5 L30,2 Q36,9 30,16 L18,13 Q9,17 0,9 Z" fill="currentColor" />
          <circle cx="22" cy="8" r="1.5" fill="rgba(120,180,220,0.4)" />
        </svg>
      </motion.div>

      {/* Individual fish 3 */}
      <motion.div
        className="creature creature-fish-3"
        animate={{ x: ['calc(-70px)', 'calc(100vw + 70px)'], y: [0, -8, 14, -10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear', delay: 16 }}
      >
        <svg viewBox="0 0 42 20" width="42" height="20">
          <path d="M0,10 Q10,0 22,5 L36,2 Q42,10 36,18 L22,15 Q10,20 0,10 Z" fill="currentColor" />
          <circle cx="27" cy="9" r="1.8" fill="rgba(120,180,220,0.45)" />
        </svg>
      </motion.div>

      {/* Larger fish — swims right to left */}
      <motion.div
        className="creature creature-big-fish"
        animate={{ x: ['calc(100vw + 100px)', 'calc(-100px)'], y: [0, 12, -10, 8, 0] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear', delay: 5 }}
      >
        <svg viewBox="0 0 70 32" width="70" height="32" style={{ transform: 'scaleX(-1)' }}>
          <path d="M2,16 Q14,2 30,7 L56,3 Q68,16 56,29 L30,25 Q14,30 2,16 Z" fill="currentColor" />
          <circle cx="44" cy="13" r="3" fill="rgba(100,170,210,0.4)" />
          <circle cx="44" cy="13" r="1.2" fill="rgba(20,40,60,0.5)" />
          <path d="M30,10 L30,22" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
          <path d="M22,7 L30,2 L36,7" fill="currentColor" opacity="0.8" />
        </svg>
      </motion.div>

      {/* School of 9 small fish */}
      <motion.div
        className="creature creature-school"
        animate={{ x: ['calc(-120px)', 'calc(100vw + 120px)'], y: [0, -18, 12, -10, 5, 0] }}
        transition={{ duration: 42, repeat: Infinity, ease: 'linear', delay: 3 }}
      >
        {Array.from({ length: 9 }, (_, i) => {
          const offsets = [
            { x: 0, y: 0 }, { x: 18, y: 10 }, { x: 24, y: -5 },
            { x: 40, y: 15 }, { x: 45, y: 3 }, { x: 50, y: -8 },
            { x: 60, y: 8 }, { x: 70, y: -3 }, { x: 78, y: 12 },
          ];
          return (
            <svg key={i} viewBox="0 0 16 8" width="16" height="8"
              style={{ position: 'absolute', left: offsets[i].x, top: offsets[i].y }}>
              <path d="M0,4 Q4,0 8,2 L14,1 Q16,4 14,7 L8,6 Q4,8 0,4 Z" fill="currentColor" />
            </svg>
          );
        })}
      </motion.div>

      {/* Second school — swims right to left */}
      <motion.div
        className="creature creature-school-2"
        animate={{ x: ['calc(100vw + 100px)', 'calc(-100px)'], y: [0, 10, -14, 8, 0] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear', delay: 20 }}
      >
        {Array.from({ length: 6 }, (_, i) => {
          const offsets = [
            { x: 0, y: 0 }, { x: 15, y: -8 }, { x: 22, y: 6 },
            { x: 35, y: -4 }, { x: 42, y: 10 }, { x: 55, y: 2 },
          ];
          return (
            <svg key={i} viewBox="0 0 14 7" width="14" height="7"
              style={{ position: 'absolute', left: offsets[i].x, top: offsets[i].y, transform: 'scaleX(-1)' }}>
              <path d="M0,3.5 Q3.5,0 7,1.5 L12,0.5 Q14,3.5 12,6.5 L7,5.5 Q3.5,7 0,3.5 Z" fill="currentColor" />
            </svg>
          );
        })}
      </motion.div>

      {/* Shark silhouette — slow dramatic pass */}
      <motion.div
        className="creature creature-shark"
        animate={{ x: ['calc(100vw + 150px)', 'calc(-200px)'], y: [0, 8, -5, 3, 0] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear', delay: 15 }}
      >
        <svg viewBox="0 0 120 45" width="120" height="45" style={{ transform: 'scaleX(-1)' }}>
          <path d="M5,22 Q15,8 35,12 L70,10 Q95,8 115,20 Q110,25 95,28 L60,30 Q30,32 15,28 Q8,26 5,22 Z" fill="currentColor" />
          <path d="M50,12 L55,0 L65,10" fill="currentColor" />
          <path d="M5,22 L0,12 L12,18" fill="currentColor" opacity="0.9" />
          <path d="M5,22 L0,32 L12,26" fill="currentColor" opacity="0.9" />
          <path d="M75,26 L85,35 L90,28" fill="currentColor" opacity="0.7" />
          <circle cx="100" cy="19" r="2" fill="rgba(60,90,110,0.5)" />
          <line x1="90" y1="18" x2="90" y2="24" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
          <line x1="87" y1="17" x2="87" y2="25" stroke="rgba(0,0,0,0.12)" strokeWidth="0.6" />
          <line x1="84" y1="17" x2="84" y2="25" stroke="rgba(0,0,0,0.1)" strokeWidth="0.6" />
        </svg>
      </motion.div>

      {/* Manta ray — slow glide */}
      <motion.div
        className="creature creature-ray"
        animate={{ x: ['calc(-180px)', 'calc(100vw + 180px)'], y: [0, -12, 8, -6, 0] }}
        transition={{ duration: 55, repeat: Infinity, ease: 'linear', delay: 25 }}
      >
        <svg viewBox="0 0 100 50" width="100" height="50">
          <path d="M50,25 Q30,5 5,10 Q2,20 10,28 Q25,35 50,25 Z" fill="currentColor" />
          <path d="M50,25 Q70,5 95,10 Q98,20 90,28 Q75,35 50,25 Z" fill="currentColor" />
          <ellipse cx="50" cy="25" rx="12" ry="6" fill="currentColor" />
          <path d="M50,31 Q48,40 50,50" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="42" cy="22" r="1.5" fill="rgba(80,140,180,0.4)" />
          <circle cx="58" cy="22" r="1.5" fill="rgba(80,140,180,0.4)" />
        </svg>
      </motion.div>

      {/* ─── DotLottie hero jellyfish ─── */}

      {/* Lottie Jellyfish 1 — hero creature, drifts upward */}
      <motion.div
        className="creature lottie-creature lottie-jelly-1"
        animate={{ y: [0, '-35vh'], x: [0, 20, -15, 10, -5] }}
        transition={{ duration: 38, repeat: Infinity, ease: 'linear', delay: 0 }}
      >
        <DotLottieReact
          src="/jellyfish.json"
          loop
          autoplay
          style={{ width: 90, height: 130 }}
        />
      </motion.div>

      {/* Lottie Jellyfish 2 — second hero creature */}
      <motion.div
        className="creature lottie-creature lottie-jelly-2"
        animate={{ y: [0, '-30vh'], x: [0, -12, 18, -8, 5] }}
        transition={{ duration: 44, repeat: Infinity, ease: 'linear', delay: 12 }}
      >
        <DotLottieReact
          src="/jellyfish.json"
          loop
          autoplay
          style={{ width: 65, height: 95 }}
        />
      </motion.div>

      {/* Lottie Jellyfish 3 — smaller midground hero */}
      <motion.div
        className="creature lottie-creature lottie-jelly-3"
        animate={{ y: [0, '-25vh'], x: [0, 15, -10, 8] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear', delay: 30 }}
      >
        <DotLottieReact
          src="/jellyfish.json"
          loop
          autoplay
          style={{ width: 50, height: 72 }}
        />
      </motion.div>

      {/* Sea turtle */}
      <motion.div
        className="creature creature-turtle"
        animate={{ x: ['calc(-100px)', 'calc(100vw + 100px)'], y: [0, -20, 15, -10, 0] }}
        transition={{ duration: 52, repeat: Infinity, ease: 'linear', delay: 20 }}
      >
        <svg viewBox="0 0 60 40" width="60" height="40">
          <ellipse cx="28" cy="20" rx="16" ry="12" fill="currentColor" opacity="0.12" />
          <ellipse cx="28" cy="20" rx="12" ry="9" fill="currentColor" opacity="0.07" />
          <path d="M20,14 L28,10 L36,14" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.06" />
          <path d="M20,26 L28,30 L36,26" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.06" />
          <path d="M12,14 L2,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.08" />
          <path d="M12,26 L4,32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.08" />
          <path d="M44,14 L52,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.08" />
          <path d="M44,26 L50,30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.08" />
          <ellipse cx="46" cy="18" rx="5" ry="3" fill="currentColor" opacity="0.09" />
          <circle cx="50" cy="17" r="1" fill="rgba(120,180,220,0.2)" />
        </svg>
      </motion.div>

      {/* Seahorse — small accent */}
      <motion.div
        className="creature creature-seahorse"
        animate={{ y: [0, -15, 5, -10, 0], x: [0, 8, -5, 12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
      >
        <svg viewBox="0 0 20 35" width="20" height="35">
          <path d="M10,3 Q14,5 14,10 Q14,15 10,18 Q8,20 8,24 Q8,28 12,30 Q14,32 12,34" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="10" cy="4" r="3" fill="currentColor" opacity="0.15" />
          <path d="M7,4 L3,3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.12" />
          <circle cx="9" cy="3.5" r="0.6" fill="rgba(120,180,220,0.3)" />
        </svg>
      </motion.div>

      {/* Eel — sinuous motion along bottom */}
      <motion.div
        className="creature creature-eel"
        animate={{ x: ['calc(-100px)', 'calc(100vw + 100px)'], y: [0, -5, 3, -4, 0] }}
        transition={{ duration: 65, repeat: Infinity, ease: 'linear', delay: 35 }}
      >
        <svg viewBox="0 0 80 16" width="80" height="16">
          <path d="M2,8 Q10,3 20,8 Q30,13 40,8 Q50,3 60,8 Q70,13 78,8" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="78" cy="8" r="3" fill="currentColor" opacity="0.12" />
          <circle cx="79" cy="7" r="0.8" fill="rgba(120,180,220,0.3)" />
        </svg>
      </motion.div>

      {/* ─── Seafloor elements ─── */}
      <div className="seafloor">
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
        <svg className="coral coral-3" viewBox="0 0 50 45" width="50" height="45">
          <path d="M8,45 Q10,30 15,20 Q18,12 22,8 Q25,15 20,25 L25,45 Z" fill="rgba(190,85,100,0.1)" />
          <path d="M22,45 Q25,32 30,22 Q33,15 38,10 Q40,20 36,30 L38,45 Z" fill="rgba(170,95,85,0.08)" />
        </svg>

        {/* Rock formations */}
        <svg className="rocks rocks-1" viewBox="0 0 120 50" width="120" height="50">
          <path d="M0,50 L5,35 Q10,28 18,32 L25,25 Q32,20 38,28 L42,35 Q48,30 55,35 L60,50 Z" fill="rgba(40,55,65,0.3)" />
          <path d="M50,50 L58,38 Q65,30 72,35 L78,28 Q85,22 90,30 L98,38 Q105,32 110,38 L120,50 Z" fill="rgba(35,50,60,0.25)" />
        </svg>
        <svg className="rocks rocks-2" viewBox="0 0 80 35" width="80" height="35">
          <path d="M0,35 L8,22 Q15,15 22,20 L30,12 Q38,8 45,18 L55,22 Q60,18 70,24 L80,35 Z" fill="rgba(38,52,62,0.22)" />
        </svg>

        {/* Lottie Treasure chest */}
        <div className="treasure lottie-creature">
          <DotLottieReact
            src="/treasure.json"
            loop
            autoplay
            style={{ width: 70, height: 60 }}
          />
        </div>

        {/* Shipwreck silhouette */}
        <svg className="shipwreck-bg" viewBox="0 0 200 100" width="200" height="100">
          <path d="M10,95 L15,70 Q20,65 30,68 L40,55 Q45,48 50,50 L55,42 L60,45 L70,35 L75,38 L80,30 L85,32 L90,40 Q95,35 100,38 L105,45 L110,42 Q115,40 120,45 L130,50 Q135,48 140,55 L150,60 Q155,58 160,65 L170,70 L175,80 Q180,85 185,90 L190,95 Z" fill="rgba(30,45,55,0.2)" />
          <line x1="80" y1="30" x2="80" y2="10" stroke="rgba(40,55,65,0.15)" strokeWidth="2" />
          <line x1="80" y1="10" x2="110" y2="20" stroke="rgba(40,55,65,0.1)" strokeWidth="1" />
          <line x1="80" y1="15" x2="105" y2="23" stroke="rgba(40,55,65,0.08)" strokeWidth="1" />
          <line x1="55" y1="42" x2="55" y2="25" stroke="rgba(40,55,65,0.12)" strokeWidth="1.5" />
        </svg>

        {/* Underwater ruins */}
        <svg className="ruins" viewBox="0 0 80 60" width="80" height="60">
          <rect x="5" y="15" width="8" height="45" fill="rgba(50,65,75,0.12)" />
          <rect x="3" y="12" width="12" height="5" rx="1" fill="rgba(55,70,80,0.1)" />
          <rect x="25" y="25" width="7" height="35" fill="rgba(50,65,75,0.1)" />
          <rect x="23" y="22" width="11" height="5" rx="1" fill="rgba(55,70,80,0.08)" />
          <path d="M3,12 L8,5 L15,12" fill="rgba(55,70,80,0.08)" />
          <rect x="50" y="35" width="8" height="25" fill="rgba(50,65,75,0.1)" transform="rotate(-8, 54, 47)" />
        </svg>

        {/* Second ruins cluster */}
        <svg className="ruins ruins-2" viewBox="0 0 60 50" width="60" height="50">
          <rect x="5" y="20" width="6" height="30" fill="rgba(50,65,75,0.1)" />
          <rect x="3" y="17" width="10" height="4" rx="1" fill="rgba(55,70,80,0.08)" />
          <rect x="30" y="28" width="6" height="22" fill="rgba(50,65,75,0.08)" transform="rotate(5, 33, 39)" />
          <path d="M3,17 L7,12 L13,17" fill="rgba(55,70,80,0.06)" />
        </svg>

        {/* Seafloor seaweed */}
        <svg className="seaweed seaweed-1" viewBox="0 0 20 60" width="20" height="60">
          <path d="M10,60 Q6,45 12,35 Q18,25 8,15 Q5,10 10,2" stroke="rgba(30,100,60,0.15)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
        <svg className="seaweed seaweed-2" viewBox="0 0 20 50" width="20" height="50">
          <path d="M10,50 Q14,38 8,28 Q4,20 12,10 Q14,5 10,0" stroke="rgba(25,90,55,0.12)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <svg className="seaweed seaweed-3" viewBox="0 0 20 55" width="20" height="55">
          <path d="M10,55 Q5,42 13,32 Q18,22 7,12 Q4,6 8,0" stroke="rgba(28,95,58,0.13)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
        <svg className="seaweed seaweed-4" viewBox="0 0 18 45" width="18" height="45">
          <path d="M9,45 Q13,35 7,25 Q3,18 10,8 Q12,4 9,0" stroke="rgba(26,88,52,0.11)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
