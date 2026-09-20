type SoundType = 'click' | 'cardSlide' | 'cardFlip' | 'chipPlace' | 'wheelSpin' | 'wheelStop' | 'win' | 'loss' | 'cashOut' | 'victory' | 'ambientDrone' | 'doorOpen' | 'logoReveal' | 'introAmbient' | 'introAtmosphere' | 'introDoorOpen' | 'introCasinoAmbience' | 'introMusicalBuild' | 'introRevealImpact' | 'introTransition';

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.5;
  private isSpinning: boolean = false;
  private spinInterval: number | null = null;

  init() {
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn('AudioContext not supported');
      }
    }
  }

  private playTone(frequency: number, type: OscillatorType, duration: number, volMultiplier = 1) {
    if (!this.enabled || !this.ctx) return;
    
    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    
    // Envelope
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(this.volume * volMultiplier, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  play(type: SoundType) {
    this.init();
    if (!this.enabled || !this.ctx) return;

    switch (type) {
      case 'click':
        this.playTone(800, 'sine', 0.1, 0.3);
        break;
      case 'cardSlide':
        this.playTone(200, 'triangle', 0.15, 0.2);
        break;
      case 'cardFlip':
        this.playTone(400, 'square', 0.1, 0.2);
        setTimeout(() => this.playTone(600, 'sine', 0.1, 0.2), 50);
        break;
      case 'chipPlace':
        this.playTone(1200, 'triangle', 0.05, 0.4);
        setTimeout(() => this.playTone(1500, 'sine', 0.1, 0.3), 30);
        break;
      case 'wheelSpin':
        if (!this.isSpinning) {
          this.isSpinning = true;
          let freq = 100;
          this.spinInterval = window.setInterval(() => {
            this.playTone(freq, 'sawtooth', 0.1, 0.1);
            freq = Math.max(50, freq - 2);
          }, 150);
        }
        break;
      case 'wheelStop':
        if (this.spinInterval) clearInterval(this.spinInterval);
        this.isSpinning = false;
        this.playTone(800, 'square', 0.3, 0.5);
        this.playTone(1200, 'sine', 0.5, 0.5);
        break;
      case 'win':
        this.playTone(523.25, 'sine', 0.2, 0.5); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.5), 100); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.5), 200); // G5
        break;
      case 'loss':
        this.playTone(300, 'sawtooth', 0.5, 0.4);
        setTimeout(() => this.playTone(250, 'sawtooth', 0.8, 0.4), 200);
        break;
      case 'cashOut':
        this.playTone(880, 'sine', 0.1, 0.5);
        setTimeout(() => this.playTone(1760, 'sine', 0.3, 0.5), 100);
        break;
      case 'victory':
        this.playTone(523.25, 'square', 0.2, 0.6); // C5
        setTimeout(() => this.playTone(659.25, 'square', 0.2, 0.6), 200); // E5
        setTimeout(() => this.playTone(783.99, 'square', 0.2, 0.6), 400); // G5
        setTimeout(() => this.playTone(1046.50, 'square', 0.6, 0.6), 600); // C6
        break;
      case 'ambientDrone':
        this.playTone(110, 'sine', 3, 0.8);
        setTimeout(() => this.playTone(164.81, 'sine', 3, 0.6), 1000);
        break;
      case 'doorOpen':
        this.playTone(80, 'sawtooth', 2, 0.8);
        this.playTone(120, 'square', 2, 0.4);
        break;
      case 'logoReveal':
        this.playTone(523.25, 'sine', 2, 0.4); // C5
        this.playTone(659.25, 'sine', 2, 0.3); // E5
        this.playTone(783.99, 'sine', 2, 0.3); // G5
        this.playTone(1046.50, 'sine', 2, 0.5); // C6
        break;

      // ── CINEMATIC INTRO SOUNDS ──

      case 'introAmbient':
        // Very low barely-audible room tone
        this.playNote(55, 'sine', 3, 0.06, 1.5, 0.04);
        this.playNote(82.41, 'sine', 3, 0.04, 1.5, 0.03);
        break;

      case 'introAtmosphere':
        // Deep atmospheric layered tones building slowly
        this.playNote(73.42, 'sine', 4, 0.15, 2.0, 0.08);
        setTimeout(() => this.playNote(110, 'sine', 3.5, 0.12, 1.8, 0.06), 300);
        setTimeout(() => this.playNote(146.83, 'triangle', 3, 0.08, 1.5, 0.04), 600);
        // Subtle bass undertone
        setTimeout(() => this.playNote(55, 'sine', 4, 0.06, 2.0, 0.03), 200);
        break;

      case 'introDoorOpen':
        // Low rumbling sweep with metallic harmonic
        this.playNote(40, 'sawtooth', 2.5, 0.12, 0.8, 0.06);
        this.playNote(60, 'square', 2, 0.06, 0.5, 0.03);
        // Metallic overtone
        setTimeout(() => this.playNote(1200, 'sine', 1.5, 0.03, 0.3, 0.02), 400);
        setTimeout(() => this.playNote(2400, 'sine', 1, 0.02, 0.2, 0.01), 600);
        // Subtle impact
        setTimeout(() => {
          this.playNote(50, 'sine', 0.8, 0.15, 0.1, 0.10);
          this.playNote(100, 'triangle', 0.6, 0.08, 0.1, 0.05);
        }, 800);
        break;

      case 'introCasinoAmbience':
        // Subtle card slide sound
        setTimeout(() => {
          this.playNote(300, 'triangle', 0.08, 0.06, 0.02, 0.04);
          this.playNote(450, 'sine', 0.06, 0.04, 0.01, 0.03);
        }, 200);
        // Chip clink
        setTimeout(() => {
          this.playNote(2000, 'sine', 0.05, 0.08, 0.01, 0.05);
          this.playNote(3000, 'sine', 0.04, 0.05, 0.01, 0.03);
        }, 600);
        // Distant roulette click
        setTimeout(() => {
          this.playNote(800, 'square', 0.03, 0.04, 0.005, 0.02);
        }, 1000);
        // Another chip
        setTimeout(() => {
          this.playNote(2200, 'sine', 0.04, 0.06, 0.01, 0.04);
        }, 1200);
        break;

      case 'introMusicalBuild':
        // Low cello-like C2 + G2
        this.playNote(65.41, 'triangle', 3, 0.12, 1.5, 0.08);
        setTimeout(() => this.playNote(98, 'triangle', 2.5, 0.10, 1.2, 0.06), 200);
        // Soft piano-like E3
        setTimeout(() => this.playNote(164.81, 'sine', 2, 0.06, 1.0, 0.04), 500);
        // Building tension — add fifth
        setTimeout(() => this.playNote(196, 'sine', 1.5, 0.05, 0.8, 0.03), 800);
        break;

      case 'introRevealImpact':
        // Single elegant metallic chord with slow attack
        this.playNote(261.63, 'sine', 3, 0.15, 1.0, 0.10); // C4
        this.playNote(329.63, 'sine', 3, 0.12, 1.0, 0.08); // E4
        this.playNote(392, 'sine', 3, 0.12, 1.0, 0.08); // G4
        this.playNote(523.25, 'sine', 3, 0.18, 1.0, 0.12); // C5
        // Metallic shimmer overtone
        setTimeout(() => {
          this.playNote(1046.50, 'sine', 2, 0.04, 0.5, 0.02);
          this.playNote(1567.98, 'sine', 1.5, 0.03, 0.3, 0.015);
        }, 300);
        break;

      case 'introTransition':
        // Quick ascending sweep
        this.playNote(200, 'sine', 0.3, 0.08, 0.05, 0.06);
        setTimeout(() => this.playNote(400, 'sine', 0.25, 0.06, 0.04, 0.04), 80);
        setTimeout(() => this.playNote(600, 'sine', 0.2, 0.05, 0.03, 0.03), 160);
        setTimeout(() => this.playNote(800, 'sine', 0.3, 0.04, 0.05, 0.03), 240);
        break;
    }
  }

  /**
   * Advanced tone with ADSR-like envelope for cinematic sounds.
   * attack: time to reach peak volume
   * decay: time to decay to sustain level  
   * sustainLevel: volume during sustain (relative to peak)
   */
  private playNote(
    frequency: number,
    type: OscillatorType,
    duration: number,
    peakVolume: number,
    attack: number,
    sustainLevel: number
  ) {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    // ADSR envelope
    const vol = this.volume * peakVolume;
    const attackEnd = now + Math.min(attack, duration * 0.3);
    const releaseStart = now + duration * 0.8;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, attackEnd);
    gain.gain.linearRampToValueAtTime(vol * sustainLevel, releaseStart);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  stopSpin() {
    if (this.spinInterval) {
      clearInterval(this.spinInterval);
      this.spinInterval = null;
    }
    this.isSpinning = false;
  }
}

export const soundManager = new SoundManager();
