import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cinematicAudio } from '../game/cinematicAudio';
import { HoFEmblem } from '../components/HoFEmblem';

interface IntroSequenceProps {
  onComplete: () => void;
}

type CinePhase =
  | 'DARK'    // 0.00–0.80
  | 'LIGHT'   // 0.80–2.00
  | 'CASINO'  // 2.00–3.30
  | 'GATES'   // 3.30–4.50
  | 'FLOOR'   // 4.50–6.20
  | 'ARENA'   // 6.20–7.40
  | 'BRAND'   // 7.40–8.70
  | 'READY';  // 8.70–10.00

// ─── Enhanced Canvas Particle System ───

function useParticleSystem(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  active: boolean,
  intensity: number, // 0-1, increases over time
) {
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; baseOpacity: number; life: number; maxLife: number;
    type: 'gold' | 'dust'; // gold = warm gold, dust = neutral
  }>>([]);
  const frameRef = useRef(0);
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    // Seed particles
    const seedCount = 60;
    for (let i = 0; i < seedCount; i++) {
      const isGold = Math.random() > 0.4;
      particlesRef.current.push({
        x: Math.random() * w(),
        y: Math.random() * h(),
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.05,
        size: isGold ? Math.random() * 1.5 + 0.5 : Math.random() * 0.8 + 0.3,
        baseOpacity: isGold ? Math.random() * 0.35 + 0.05 : Math.random() * 0.15 + 0.03,
        life: Math.random() * 300,
        maxLife: 250 + Math.random() * 300,
        type: isGold ? 'gold' : 'dust',
      });
    }

    const animate = () => {
      const cw = w();
      const ch = h();
      ctx.clearRect(0, 0, cw, ch);
      const inten = intensityRef.current;

      particlesRef.current.forEach(p => {
        // Apply subtle random drift
        p.vx += (Math.random() - 0.5) * 0.01;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Lifecycle fade
        const ratio = p.life / p.maxLife;
        let alpha: number;
        if (ratio < 0.15) alpha = (ratio / 0.15) * p.baseOpacity;
        else if (ratio > 0.85) alpha = ((1 - ratio) / 0.15) * p.baseOpacity;
        else alpha = p.baseOpacity;

        alpha *= inten;

        // Reset when expired or out of bounds
        if (p.life > p.maxLife || p.y < -20 || p.x < -20 || p.x > cw + 20) {
          p.x = Math.random() * cw;
          p.y = ch + Math.random() * 20;
          p.life = 0;
          p.maxLife = 250 + Math.random() * 300;
          p.vx = (Math.random() - 0.5) * 0.25;
          p.vy = -Math.random() * 0.35 - 0.05;
          return;
        }

        if (alpha < 0.005) return;

        // Draw particle
        const color = p.type === 'gold'
          ? `rgba(212, 175, 55, ${alpha})`
          : `rgba(200, 190, 170, ${alpha * 0.6})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Soft glow for gold particles
        if (p.type === 'gold' && alpha > 0.1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 175, 55, ${alpha * 0.1})`;
          ctx.fill();
        }
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      particlesRef.current = [];
    };
  }, [active, canvasRef]);
}

// ─── Seat position calculator ───

function seatPosition(i: number, total = 8) {
  const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
  const r = 50;
  return {
    left: `${50 + r * Math.cos(angle)}%`,
    top: `${50 + r * Math.sin(angle)}%`,
    transform: 'translate(-50%, -50%)',
  };
}

// ─── Dust burst positions for gate opening ───

const DUST_POSITIONS = Array.from({ length: 12 }, () => ({
  '--dx': `${(Math.random() - 0.5) * 120}px`,
  '--dy': `${(Math.random() - 0.5) * 80 - 40}px`,
  left: `${45 + Math.random() * 10}%`,
  top: `${40 + Math.random() * 20}%`,
  animationDelay: `${Math.random() * 0.5}s`,
  animationDuration: `${1.5 + Math.random()}s`,
} as React.CSSProperties));

// ─── Main Component ───

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<CinePhase>('DARK');
  const [darkParticleVisible, setDarkParticleVisible] = useState(false);
  const [gatesOpen, setGatesOpen] = useState(false);
  const [litSeats, setLitSeats] = useState<number[]>([]);
  const [exiting, setExiting] = useState(false);
  const [particleIntensity, setParticleIntensity] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timersRef = useRef<number[]>([]);
  const interactedRef = useRef(false);

  // Canvas particle system
  useParticleSystem(canvasRef, phase !== 'DARK', particleIntensity);

  // Cleanup
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  // ─── TIMELINE ───
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('READY');
      setParticleIntensity(0.3);
      return;
    }

    const t = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    // Start audio engine — all intro sounds are pre-scheduled
    cinematicAudio.init();
    cinematicAudio.startIntroSequence();

    // ── 0.00–0.80: DARKNESS ──
    // (Already in DARK phase)

    // 0.60: Tiny golden particle appears
    t(() => setDarkParticleVisible(true), 600);

    // ── 0.80: THE GOLDEN LIGHT ──
    t(() => {
      setPhase('LIGHT');
      setParticleIntensity(0.2);
    }, 800);

    // ── 2.00: CASINO REVEAL ──
    t(() => {
      setPhase('CASINO');
      setParticleIntensity(0.4);
    }, 2000);

    // ── 3.30: THE GATES ──
    t(() => setPhase('GATES'), 3300);

    // 3.60: Gates begin opening
    t(() => setGatesOpen(true), 3600);

    // ── 4.50: CASINO FLOOR ──
    t(() => {
      setPhase('FLOOR');
      setParticleIntensity(0.6);
    }, 4500);

    // ── 6.20: TOURNAMENT ARENA ──
    t(() => {
      setPhase('ARENA');
      setParticleIntensity(0.5);
    }, 6200);

    // 6.35–7.15: Sequential seat illumination (100ms apart)
    for (let i = 0; i < 8; i++) {
      t(() => setLitSeats(prev => [...prev, i]), 6350 + i * 100);
    }

    // ── 7.40: BRAND REVEAL ──
    t(() => {
      setPhase('BRAND');
      setParticleIntensity(0.3);
    }, 7400);

    // ── 8.70: READY ──
    t(() => {
      setPhase('READY');
      setParticleIntensity(0.25);
    }, 8700);

  }, []);

  // ─── HANDLERS ───

  const handleEnter = useCallback(() => {
    if (interactedRef.current) return;
    interactedRef.current = true;

    cinematicAudio.playUI('click');
    cinematicAudio.playTransition();
    setExiting(true);

    // Fade audio and transition
    cinematicAudio.fadeOut(900);

    setTimeout(() => {
      localStorage.setItem('introSkipped', 'true');
      onComplete();
    }, 1000);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    if (interactedRef.current) return;
    interactedRef.current = true;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    cinematicAudio.playUI('click');
    cinematicAudio.fadeOut(500);
    setExiting(true);

    setTimeout(() => {
      localStorage.setItem('introSkipped', 'true');
      onComplete();
    }, 600);
  }, [onComplete]);

  const handleBtnHover = useCallback(() => {
    cinematicAudio.playUI('hover');
  }, []);

  // Phase helpers
  const isAfter = (target: CinePhase) => {
    const order: CinePhase[] = ['DARK', 'LIGHT', 'CASINO', 'GATES', 'FLOOR', 'ARENA', 'BRAND', 'READY'];
    return order.indexOf(phase) >= order.indexOf(target);
  };

  const shotMap: Record<CinePhase, string> = {
    DARK: 'dark', LIGHT: 'light', CASINO: 'casino', GATES: 'gates',
    FLOOR: 'floor', ARENA: 'arena', BRAND: 'brand', READY: 'ready',
  };

  return (
    <div className={`intro-cinematic ${exiting ? 'cine-exiting' : ''}`}>

      {/* Skip */}
      <button className="cine-skip" onClick={handleSkip} aria-label="Skip intro">
        SKIP INTRO →
      </button>

      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        className={`cine-particles ${isAfter('LIGHT') ? 'visible' : ''}`}
      />

      {/* Fog layers */}
      <div className={`cine-fog ${isAfter('LIGHT') ? 'visible' : ''}`}>
        <div className="cine-fog-layer" />
        <div className="cine-fog-layer" />
        <div className="cine-fog-layer" />
      </div>

      {/* Light rays */}
      <div className={`cine-lightrays ${isAfter('CASINO') ? 'visible' : ''}`}>
        <div className="cine-lightray" />
        <div className="cine-lightray" />
        <div className="cine-lightray" />
        <div className="cine-lightray" />
        <div className="cine-lightray" />
      </div>

      {/* Light sweep */}
      <div className={`cine-lightsweep ${isAfter('CASINO') ? 'visible' : ''}`} />

      {/* Floating environment cards */}
      <div className={`env-floating-card ${isAfter('CASINO') ? 'visible' : ''}`} />
      <div className={`env-floating-card ${isAfter('FLOOR') ? 'visible' : ''}`} />
      <div className={`env-floating-card ${isAfter('FLOOR') ? 'visible' : ''}`} />

      {/* Camera wrapper */}
      <div className="cine-camera" data-shot={shotMap[phase]}>

        {/* ═══ DARKNESS ═══ */}
        <div className={`shot-dark ${isAfter('LIGHT') ? 'fade' : ''}`}>
          <div className={`dark-particle ${darkParticleVisible ? 'appear' : ''}`} />
        </div>

        {/* ═══ THE GOLDEN LIGHT ═══ */}
        <div className={`shot-light ${phase === 'LIGHT' ? 'active' : isAfter('CASINO') ? 'exit' : ''}`}>
          <div className="light-glow" />
          <div className="light-arch-hints">
            <div className="light-hint-col" />
            <div className="light-hint-col" />
            <div className="light-hint-col" />
            <div className="light-hint-col" />
            <div className="light-hint-col" />
          </div>
        </div>

        {/* ═══ CASINO REVEAL ═══ */}
        <div className={`shot-casino ${phase === 'CASINO' ? 'active' : isAfter('GATES') ? 'exit' : ''}`}>
          <div className="casino-scene">
            <div className="casino-atmo" />
            <div className="casino-floor-reflect" />

            <div className="casino-palace">
              <div className="casino-top-emblem">
                <HoFEmblem size={50} glowIntensity={0.2} />
              </div>

              <div className="casino-columns">
                <div className="casino-col" />
                <div className="casino-col" />
                <div className="casino-col" />
                <div className="casino-col" />
                <div className="casino-col" />
                <div className="casino-col" />
                <div className="casino-col" />
              </div>

              <div className="casino-arches">
                <div className="casino-arch" />
                <div className="casino-arch" />
                <div className="casino-arch entrance" />
                <div className="casino-arch" />
                <div className="casino-arch" />
              </div>

              <div className="casino-pattern" />
              <div className="casino-window-glow" />
              <div className="casino-base" />
            </div>
          </div>
        </div>

        {/* ═══ THE GATES ═══ */}
        <div className={`shot-gates ${phase === 'GATES' ? 'active' : isAfter('FLOOR') ? 'exit' : ''}`}>
          <div className={`gates-wrapper ${gatesOpen ? 'gates-opening' : ''}`}>
            <div className="gate-frame">
              <div className="gate-panel left">
                <div className="gate-handle" />
                <div className="gate-door-emblem">
                  <HoFEmblem size={40} glowIntensity={0.15} />
                </div>
                <div className="gate-marble-line" />
                <div className="gate-marble-line" />
                <div className="gate-marble-line" />
              </div>
              <div className="gate-panel right">
                <div className="gate-handle" />
                <div className="gate-door-emblem">
                  <HoFEmblem size={40} glowIntensity={0.15} />
                </div>
                <div className="gate-marble-line" />
                <div className="gate-marble-line" />
                <div className="gate-marble-line" />
              </div>
            </div>

            <div className="gate-lightspill">
              <div className="gate-lightspill-core" />
            </div>

            {/* Dust burst */}
            {DUST_POSITIONS.map((style, i) => (
              <div key={i} className="gate-dust" style={style} />
            ))}
          </div>
        </div>

        {/* ═══ CASINO FLOOR ═══ */}
        <div className={`shot-floor ${phase === 'FLOOR' ? 'active' : isAfter('ARENA') ? 'exit' : ''}`}>
          <div className="floor-environment">

            {/* Far depth — blurred bg elements */}
            <div className={`floor-parallax depth-far ${phase === 'FLOOR' ? 'visible' : ''}`}>
              <div className="floor-dealer-silhouette" style={{ right: '35%', top: '22%' }} />
              <div className="floor-dealer-silhouette" style={{ left: '22%', top: '25%' }} />
              <div className="floor-scoreboard-v2">
                <span className="floor-scoreboard-text">Tournament Board</span>
              </div>
            </div>

            {/* Mid depth */}
            <div className={`floor-parallax depth-mid ${phase === 'FLOOR' ? 'visible' : ''}`}>
              {/* Roulette */}
              <div className="floor-roulette-v2" />

              {/* Fortune table */}
              <div className="floor-table floor-bj-table">
                <span className="floor-table-label">Fortune Draw</span>
              </div>

              {/* Chips */}
              <div className="floor-chipstack">
                <div className="floor-chip-v2 gold" />
                <div className="floor-chip-v2 emerald" />
                <div className="floor-chip-v2 black" />
                <div className="floor-chip-v2 red" />
                <div className="floor-chip-v2 gold" />
              </div>
            </div>

            {/* Near depth — sharp foreground */}
            <div className={`floor-parallax depth-near ${phase === 'FLOOR' ? 'visible' : ''}`}>
              {/* Sliding cards */}
              <div className="floor-sliding-cards">
                <div className="floor-slide-card" />
                <div className="floor-slide-card" />
                <div className="floor-slide-card" />
              </div>

              {/* Fortune table 2 */}
              <div className="floor-table floor-poker-table">
                <span className="floor-table-label">Fortune Draw</span>
              </div>

              {/* Fortune table 3 */}
              <div className="floor-table floor-dice-table">
                <span className="floor-table-label">Fortune Draw</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TOURNAMENT ARENA ═══ */}
        <div className={`shot-arena ${phase === 'ARENA' ? 'active' : isAfter('BRAND') ? 'exit' : ''}`}>
          <div className="arena-table-v2">
            <div className="arena-table-emblem">
              <HoFEmblem size={70} glowIntensity={0.45} />
            </div>
            <div className="arena-seats">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`arena-seat ${litSeats.includes(i) ? 'lit' : ''}`}
                  style={seatPosition(i)}
                >
                  <div className="arena-seat-dot" />
                  <span className="arena-seat-label">
                    Player {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="arena-info">
            <div className="arena-info-row">
              <div className="arena-info-item">
                <span className="val">8</span>Players
              </div>
              <div className="arena-info-item">
                <span className="val">3</span>Stages
              </div>
              <div className="arena-info-item">
                <span className="val">1</span>Champion
              </div>
            </div>
          </div>
        </div>

        {/* ═══ BRAND REVEAL ═══ */}
        <div className={`shot-brand ${phase === 'BRAND' ? 'active' : isAfter('READY') ? 'exit' : ''}`}>
          <div className="brand-darken" />

          <div className="brand-emblem-v2">
            <div className="brand-ring-glow">
              <HoFEmblem size={130} animate glowIntensity={0.8} />
            </div>
          </div>

          <div className="brand-title-v2">
            HOUSE <span className="gold">OF</span> FORTUNE
          </div>

          <div className="brand-sub-v2">Casino Tournament Arena</div>
          <div className="brand-divider" />
          <div className="brand-tagline-v2">Every decision counts.</div>
        </div>

      </div>
      {/* end camera */}

      {/* ═══ READY STATE ═══ */}
      <div className={`shot-ready ${phase === 'READY' ? 'active' : ''}`}>
        <div className="ready-emblem-wrap">
          <HoFEmblem size={90} animate glowIntensity={0.65} />
        </div>

        <div className="ready-heading">
          HOUSE <span style={{ color: '#D4AF37' }}>OF</span> FORTUNE
        </div>
        <div className="ready-subtitle">Casino Tournament Arena</div>

        <div className="ready-announcement">The tables are open.</div>

        <div className="ready-stats">
          <div className="ready-stat"><span className="num">8</span>Players</div>
          <div className="ready-stat"><span className="num">3</span>Stages</div>
          <div className="ready-stat"><span className="num">1</span>Champion</div>
        </div>

        <div className="ready-btn-wrap">
          <button
            className="cine-enter-btn"
            onClick={handleEnter}
            onMouseEnter={handleBtnHover}
          >
            <span className="cine-enter-text">Enter the Tournament</span>
          </button>
        </div>
      </div>

    </div>
  );
};
