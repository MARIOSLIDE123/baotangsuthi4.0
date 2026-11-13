/**
 * Gentle procedural Web Audio soundscape inspired by Central Highlands morning wind
 * and warm bronze harmonic resonance. Requires explicit user toggle interaction.
 */
class AmbientAudioController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private chimeTimer: number | null = null;
  private playing = false;

  isPlaying(): boolean {
    return this.playing;
  }

  start(): boolean {
    if (this.playing) return true;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }

      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.001, this.ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.2);
      master.connect(this.ctx.destination);
      this.masterGain = master;

      // Warm low drone (D2 + A2 harmonic bed)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 146.83; // D3
      const g1 = this.ctx.createGain();
      g1.gain.value = 0.28;
      osc1.connect(g1).connect(master);
      osc1.start();

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 220.0; // A3
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      const g2 = this.ctx.createGain();
      g2.gain.value = 0.14;
      osc2.connect(filter).connect(g2).connect(master);
      osc2.start();

      // Gentle pentatonic bronze-like chime every ~4.5s
      const pentatonic = [293.66, 329.63, 392.0, 440.0, 523.25];
      let step = 0;
      const triggerChime = () => {
        if (!this.ctx || !this.masterGain || !this.playing) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pentatonic[step % pentatonic.length], now);
        step += 1;

        env.gain.setValueAtTime(0.001, now);
        env.gain.exponentialRampToValueAtTime(0.18, now + 0.12);
        env.gain.exponentialRampToValueAtTime(0.0008, now + 3.2);

        osc.connect(env).connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 3.3);
      };

      this.playing = true;
      triggerChime();
      this.chimeTimer = window.setInterval(triggerChime, 4500);
      return true;
    } catch {
      this.playing = false;
      return false;
    }
  }

  stop(): void {
    this.playing = false;
    if (this.chimeTimer !== null) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    if (this.ctx) {
      try {
        void this.ctx.close();
      } catch {
        // Ignore close errors
      }
      this.ctx = null;
      this.masterGain = null;
    }
  }

  toggle(): boolean {
    if (this.playing) {
      this.stop();
      return false;
    }
    return this.start();
  }
}

export const ambientAudio = new AmbientAudioController();
