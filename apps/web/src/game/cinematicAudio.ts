/**
 * CinematicAudioManager — Dedicated audio engine for the House of Fortune intro.
 * 
 * Architecture:
 *   Oscillator → PerSoundGain → ChannelGain → MasterGain → Destination
 * 
 * Channels: MUSIC, AMBIENCE, SFX, UI — each with independent volume.
 * All intro sounds are pre-scheduled using Web Audio API timing for sample-accurate sync.
 */

type AudioChannel = 'music' | 'ambience' | 'sfx' | 'ui';

interface ActiveNode {
  osc: OscillatorNode;
  gain: GainNode;
  channel: AudioChannel;
}

class CinematicAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channelGains: Record<AudioChannel, GainNode | null> = {
    music: null, ambience: null, sfx: null, ui: null,
  };
  private channelVolumes: Record<AudioChannel, number> = {
    music: 0.45,
    ambience: 0.25,
    sfx: 0.35,
    ui: 0.20,
  };
  private masterVolume = 0.5;
  private activeNodes: ActiveNode[] = [];
  private stopped = false;

  init(): boolean {
    if (this.ctx) return true;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctx();

      // Build gain chain: channels → master → destination
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      for (const ch of ['music', 'ambience', 'sfx', 'ui'] as AudioChannel[]) {
        const g = this.ctx.createGain();
        g.gain.value = this.channelVolumes[ch];
        g.connect(this.masterGain);
        this.channelGains[ch] = g;
      }
      return true;
    } catch {
      console.warn('CinematicAudio: AudioContext not supported');
      return false;
    }
  }

  /**
   * Schedule a single oscillator note at an absolute audio-context time.
   */
  private note(
    channel: AudioChannel,
    freq: number,
    type: OscillatorType,
    startAt: number,
    duration: number,
    peakVol: number,
    attackTime: number,
    sustainRatio = 0.5,
  ) {
    if (!this.ctx || this.stopped) return;
    const channelGain = this.channelGains[channel];
    if (!channelGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startAt);

    const vol = peakVol;
    const atkEnd = startAt + Math.min(attackTime, duration * 0.4);
    const relStart = startAt + duration * 0.75;
    const end = startAt + duration;

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(vol, atkEnd);
    gain.gain.linearRampToValueAtTime(vol * sustainRatio, relStart);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(channelGain);

    osc.start(startAt);
    osc.stop(end + 0.05);

    this.activeNodes.push({ osc, gain, channel });
  }

  /**
   * Schedule all intro sounds relative to the intro start time.
   * This is called once and all sounds are pre-scheduled in the Web Audio graph.
   */
  startIntroSequence() {
    if (!this.init()) return;
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.stopped = false;
    const t = this.ctx.currentTime + 0.05;

    // ════════════════════════════════════════════
    // MUSIC — Progressive build over 10 seconds
    // ════════════════════════════════════════════

    // Phase 1 (0–2s): Deep ambient drone
    this.note('music', 40, 'sine', t + 0.3, 8, 0.07, 3.0, 0.03);
    this.note('music', 55, 'sine', t + 0.5, 7.5, 0.05, 2.5, 0.025);
    this.note('music', 82.41, 'sine', t + 0.8, 7, 0.03, 2.0, 0.02); // E2

    // Phase 2 (2–4s): Low strings enter
    this.note('music', 65.41, 'triangle', t + 2.0, 6, 0.10, 2.0, 0.06); // C2
    this.note('music', 98, 'triangle', t + 2.3, 5.5, 0.08, 1.8, 0.05);  // G2
    this.note('music', 73.42, 'triangle', t + 2.8, 5, 0.06, 1.5, 0.04); // D2

    // Phase 3 (4–6s): Subtle tension — add thirds
    this.note('music', 130.81, 'triangle', t + 4.2, 4.5, 0.07, 1.5, 0.04); // C3
    this.note('music', 164.81, 'sine', t + 4.8, 4, 0.05, 1.2, 0.03);       // E3
    this.note('music', 110, 'triangle', t + 5.0, 3.5, 0.04, 1.0, 0.025);   // A2

    // Phase 4 (6–7.5s): Tension increases
    this.note('music', 196, 'sine', t + 6.2, 3, 0.06, 0.8, 0.04);    // G3
    this.note('music', 146.83, 'sine', t + 6.5, 2.8, 0.05, 0.8, 0.03); // D3
    this.note('music', 174.61, 'triangle', t + 6.8, 2.5, 0.04, 0.6, 0.03); // F3

    // Phase 5 (7.5–8.7s): Controlled climax — full chord
    this.note('music', 261.63, 'sine', t + 7.4, 2.5, 0.12, 0.6, 0.08); // C4
    this.note('music', 329.63, 'sine', t + 7.5, 2.3, 0.09, 0.5, 0.06); // E4
    this.note('music', 392, 'sine', t + 7.6, 2.2, 0.09, 0.5, 0.06);    // G4
    this.note('music', 523.25, 'sine', t + 7.7, 2.0, 0.14, 0.5, 0.09); // C5

    // Phase 6 (8.7–10s): Resolution — sustained, gentle decay
    this.note('music', 261.63, 'sine', t + 8.7, 3, 0.08, 0.3, 0.04); // C4 sustain
    this.note('music', 523.25, 'sine', t + 8.8, 2.5, 0.06, 0.3, 0.03); // C5 sustain

    // ════════════════════════════════════════════
    // AMBIENCE — Casino room tone & environmental
    // ════════════════════════════════════════════

    // Continuous very quiet room tone
    this.note('ambience', 35, 'sine', t + 0.1, 10, 0.02, 3, 0.01);
    this.note('ambience', 50, 'sine', t + 0.3, 9, 0.015, 2.5, 0.008);

    // Distant chip clinks (short high bursts)
    this.note('ambience', 2200, 'sine', t + 3.8, 0.06, 0.06, 0.01, 0.04);
    this.note('ambience', 3100, 'sine', t + 3.82, 0.04, 0.04, 0.008, 0.03);

    this.note('ambience', 2400, 'sine', t + 5.2, 0.05, 0.05, 0.01, 0.03);
    this.note('ambience', 2800, 'sine', t + 5.22, 0.04, 0.04, 0.008, 0.03);

    // Distant card shuffle (noise-like short bursts via detuned oscillators)
    this.note('ambience', 300, 'sawtooth', t + 4.5, 0.08, 0.03, 0.01, 0.02);
    this.note('ambience', 450, 'sawtooth', t + 4.52, 0.06, 0.025, 0.008, 0.015);

    // Faint roulette click
    this.note('ambience', 900, 'square', t + 5.6, 0.03, 0.03, 0.005, 0.02);
    this.note('ambience', 1100, 'square', t + 5.9, 0.03, 0.025, 0.005, 0.015);

    // Soft distant murmur (very low filtered)
    this.note('ambience', 180, 'sawtooth', t + 4.0, 5, 0.015, 2, 0.008);
    this.note('ambience', 220, 'sawtooth', t + 4.5, 4, 0.012, 1.5, 0.006);

    // ════════════════════════════════════════════
    // SFX — Synchronized events
    // ════════════════════════════════════════════

    // 0.6s: Tiny golden particle appear — very quiet high ping
    this.note('sfx', 4000, 'sine', t + 0.6, 0.4, 0.03, 0.05, 0.015);
    this.note('sfx', 6000, 'sine', t + 0.65, 0.3, 0.02, 0.03, 0.01);

    // 1.7s: First musical note (metallic shimmer)
    this.note('sfx', 1200, 'sine', t + 1.7, 1.5, 0.04, 0.3, 0.02);
    this.note('sfx', 2400, 'sine', t + 1.75, 1.0, 0.025, 0.2, 0.012);

    // 3.3–3.5s: Door mechanism begins
    this.note('sfx', 40, 'sawtooth', t + 3.3, 2, 0.10, 0.6, 0.06);
    this.note('sfx', 60, 'square', t + 3.35, 1.8, 0.05, 0.4, 0.03);
    // Metallic overtones
    this.note('sfx', 800, 'sine', t + 3.5, 1.5, 0.03, 0.3, 0.015);
    this.note('sfx', 1600, 'sine', t + 3.6, 1.0, 0.02, 0.2, 0.01);

    // 4.0s: Deep resonant impact when doors fully open
    this.note('sfx', 45, 'sine', t + 4.0, 1.2, 0.15, 0.08, 0.10);
    this.note('sfx', 90, 'triangle', t + 4.02, 0.8, 0.08, 0.06, 0.05);
    this.note('sfx', 180, 'sine', t + 4.05, 0.6, 0.04, 0.05, 0.025);

    // 7.4s: Emblem appears — soft metallic resonance
    this.note('sfx', 523.25, 'sine', t + 7.4, 2.5, 0.06, 0.8, 0.04); // C5
    this.note('sfx', 659.25, 'sine', t + 7.45, 2.3, 0.05, 0.7, 0.03); // E5
    this.note('sfx', 783.99, 'sine', t + 7.5, 2.0, 0.05, 0.6, 0.03); // G5

    // 7.9s: Gold outline completes — high shimmer
    this.note('sfx', 2093, 'sine', t + 7.9, 1.5, 0.035, 0.2, 0.018);
    this.note('sfx', 3136, 'sine', t + 7.95, 1.0, 0.025, 0.15, 0.012);
    this.note('sfx', 4186, 'sine', t + 8.0, 0.8, 0.02, 0.1, 0.01);

    // 8.2s: Text appears — single tonal hit
    this.note('sfx', 440, 'sine', t + 8.2, 0.8, 0.06, 0.06, 0.04);
    this.note('sfx', 880, 'sine', t + 8.22, 0.6, 0.03, 0.05, 0.02);

    // 8.5s: "EVERY DECISION COUNTS" — music dips handled by gain scheduling
    // (The music phase 6 already starts quieter at 8.7s)
  }

  /**
   * Play a UI sound immediately (hover/click).
   */
  playUI(type: 'hover' | 'click') {
    if (!this.ctx || this.stopped) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;

    if (type === 'hover') {
      // Very subtle mechanical click
      this.note('ui', 1800, 'sine', now, 0.04, 0.04, 0.008, 0.03);
      this.note('ui', 2600, 'sine', now + 0.005, 0.03, 0.03, 0.006, 0.02);
    } else if (type === 'click') {
      // Short premium confirmation
      this.note('ui', 600, 'sine', now, 0.15, 0.06, 0.02, 0.04);
      this.note('ui', 900, 'sine', now + 0.02, 0.12, 0.04, 0.015, 0.025);
      this.note('ui', 1200, 'sine', now + 0.04, 0.1, 0.03, 0.01, 0.02);
    }
  }

  /**
   * Play transition sound (entering the game).
   */
  playTransition() {
    if (!this.ctx || this.stopped) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;

    // Card shuffle texture
    this.note('sfx', 280, 'sawtooth', now, 0.1, 0.04, 0.02, 0.03);
    this.note('sfx', 400, 'sawtooth', now + 0.05, 0.08, 0.03, 0.015, 0.02);

    // Chip movement
    this.note('sfx', 2000, 'sine', now + 0.15, 0.06, 0.05, 0.01, 0.035);

    // Table ambience rising
    this.note('ambience', 100, 'sine', now + 0.1, 2, 0.04, 1.0, 0.02);
    this.note('ambience', 150, 'triangle', now + 0.3, 1.5, 0.03, 0.8, 0.015);
  }

  /**
   * Fade out all audio over the given duration (ms).
   */
  fadeOut(durationMs = 800) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const dur = durationMs / 1000;
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + dur);
    setTimeout(() => this.stop(), durationMs + 100);
  }

  /**
   * Immediately stop all audio and clean up.
   */
  stop() {
    this.stopped = true;
    this.activeNodes.forEach(n => {
      try { n.osc.stop(); } catch { /* already stopped */ }
      try { n.gain.disconnect(); } catch { /* ok */ }
    });
    this.activeNodes = [];
    if (this.ctx && this.ctx.state !== 'closed') {
      // Don't close — the game's soundManager may share the audio thread
    }
  }

  /**
   * Victory / Round Win Fanfare Chord
   */
  playVictoryChord() {
    if (!this.ctx || this.stopped) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;

    // C-Major triumph chord with gold shimmer
    this.note('music', 261.63, 'triangle', now, 1.2, 0.08, 0.05, 0.04); // C4
    this.note('music', 329.63, 'triangle', now + 0.05, 1.2, 0.08, 0.05, 0.04); // E4
    this.note('music', 392.00, 'triangle', now + 0.1, 1.2, 0.08, 0.05, 0.04); // G4
    this.note('music', 523.25, 'sine', now + 0.15, 1.8, 0.1, 0.05, 0.05); // C5

    // Shimmer
    this.note('sfx', 1046.50, 'sine', now + 0.2, 0.8, 0.04, 0.03, 0.02);
    this.note('sfx', 1318.51, 'sine', now + 0.25, 0.8, 0.04, 0.03, 0.02);
  }

  /**
   * Defeat / Loss Stinger
   */
  playLossSound() {
    if (!this.ctx || this.stopped) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;

    // Low minor falling interval
    this.note('music', 196.00, 'sawtooth', now, 0.8, 0.06, 0.05, 0.03); // G3
    this.note('music', 185.00, 'sawtooth', now + 0.15, 1.0, 0.07, 0.05, 0.02); // F#3
    this.note('music', 130.81, 'sine', now + 0.3, 1.2, 0.08, 0.1, 0.01); // C3
  }

  /**
   * Card Slide Sound
   */
  playCardSlide() {
    if (!this.ctx || this.stopped) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;
    this.note('sfx', 800, 'triangle', now, 0.08, 0.04, 0.01, 0.02);
    this.note('sfx', 1200, 'sine', now + 0.02, 0.06, 0.03, 0.01, 0.01);
  }

  /**
   * Card Flip Sound
   */
  playCardFlip() {
    if (!this.ctx || this.stopped) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;
    this.note('sfx', 450, 'sawtooth', now, 0.06, 0.05, 0.01, 0.02);
    this.note('sfx', 950, 'sine', now + 0.03, 0.05, 0.03, 0.01, 0.01);
  }

  /**
   * Roulette Wheel Spin
   */
  playWheelSpin() {
    if (!this.ctx || this.stopped) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;

    // Mechanical wheel ticking
    for (let i = 0; i < 15; i++) {
      const delay = i * (0.05 + i * 0.015);
      this.note('sfx', 1400 - i * 40, 'triangle', now + delay, 0.03, 0.03, 0.005, 0.01);
    }
  }

  /**
   * Sic Bo Dice Roll
   */
  playDiceRoll() {
    if (!this.ctx || this.stopped) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;

    // Dice cup shake & clatter
    for (let i = 0; i < 8; i++) {
      const delay = i * 0.06;
      const freq = 600 + (i % 3) * 200;
      this.note('sfx', freq, 'sawtooth', now + delay, 0.04, 0.05, 0.005, 0.02);
    }
  }

  setMasterVolume(v: number) {
    this.masterVolume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  setChannelVolume(ch: AudioChannel, v: number) {
    this.channelVolumes[ch] = v;
    if (this.channelGains[ch]) this.channelGains[ch]!.gain.value = v;
  }
}

export const cinematicAudio = new CinematicAudioManager();

