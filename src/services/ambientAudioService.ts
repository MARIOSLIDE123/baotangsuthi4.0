/**
 * Audio controller for Bao Tang Su Thi 4.0:
 * - File 1: /audio/bgm-app.m4a (Main App ambient BGM)
 * - File 2: /audio/bgm-arena.m4a (Hero Arena battle BGM)
 * - File 3: /audio/sfx-correct.mp3 (Correct answer sound effect)
 * - File 4: /audio/sfx-wrong.mp3 (Wrong answer sound effect)
 */

type BgmTrack = 'app' | 'arena';

type AudioListener = (volume: number, isPlaying: boolean) => void;

class AmbientAudioController {
  private currentTrack: BgmTrack = 'app';
  private appAudio: HTMLAudioElement | null = null;
  private arenaAudio: HTMLAudioElement | null = null;
  private playing = false;
  private volume = 0.03; // Default 3% volume as requested
  private lastNonZeroVolume = 0.03;
  private listeners = new Set<AudioListener>();

  private initAudios() {
    if (typeof window === 'undefined') return;
    if (this.appAudio && this.arenaAudio) return;

    this.appAudio = new Audio('/audio/bgm-app.m4a');
    this.appAudio.loop = true;
    this.appAudio.volume = this.volume;

    this.arenaAudio = new Audio('/audio/bgm-arena.m4a');
    this.arenaAudio.loop = true;
    this.arenaAudio.volume = this.volume;
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.volume, this.playing);
      } catch {
        // Safe listener execution
      }
    });
  }

  subscribe(fn: AudioListener): () => void {
    this.listeners.add(fn);
    fn(this.volume, this.playing);
    return () => {
      this.listeners.delete(fn);
    };
  }

  isPlaying(): boolean {
    return this.playing;
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, Number(vol.toFixed(2))));
    this.volume = clamped;
    if (clamped > 0) {
      this.lastNonZeroVolume = clamped;
    }

    this.initAudios();
    if (this.appAudio) this.appAudio.volume = this.volume;
    if (this.arenaAudio) this.arenaAudio.volume = this.volume;

    if (clamped === 0 && this.playing) {
      this.stop();
    } else if (clamped > 0 && !this.playing) {
      this.start();
    } else {
      this.notify();
    }
  }

  getCurrentTrack(): BgmTrack {
    return this.currentTrack;
  }

  /**
   * Automatically switches BGM based on the current museum route.
   */
  setRoute(route: string): void {
    const targetTrack: BgmTrack = route === 'hero-arena' ? 'arena' : 'app';
    if (this.currentTrack === targetTrack) return;
    this.currentTrack = targetTrack;

    if (this.playing) {
      this.switchToTrack(targetTrack);
    }
  }

  private switchToTrack(track: BgmTrack): void {
    this.initAudios();
    if (track === 'arena') {
      if (this.appAudio) {
        this.appAudio.pause();
        this.appAudio.currentTime = 0;
      }
      if (this.arenaAudio) {
        this.arenaAudio.volume = this.volume;
        this.arenaAudio.currentTime = 0;
        this.arenaAudio.play().catch(() => {});
      }
    } else {
      if (this.arenaAudio) {
        this.arenaAudio.pause();
        this.arenaAudio.currentTime = 0;
      }
      if (this.appAudio) {
        this.appAudio.volume = this.volume;
        this.appAudio.currentTime = 0;
        this.appAudio.play().catch(() => {});
      }
    }
  }

  start(): boolean {
    this.initAudios();
    if (this.volume === 0) {
      this.volume = this.lastNonZeroVolume || 0.03;
    }
    if (this.appAudio) this.appAudio.volume = this.volume;
    if (this.arenaAudio) this.arenaAudio.volume = this.volume;

    this.playing = true;
    const target = this.currentTrack === 'arena' ? this.arenaAudio : this.appAudio;
    if (target) {
      target.play().catch(() => {
        // Autoplay may be restricted until user gesture
      });
    }
    this.notify();
    return true;
  }

  stop(): void {
    this.playing = false;
    if (this.appAudio) {
      this.appAudio.pause();
    }
    if (this.arenaAudio) {
      this.arenaAudio.pause();
    }
    this.notify();
  }

  toggle(): boolean {
    if (this.playing) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }
}

export const ambientAudio = new AmbientAudioController();

/**
 * Play File 3: Correct answer sound effect
 */
export function playCorrectSound(): void {
  try {
    const sfx = new Audio('/audio/sfx-correct.mp3');
    sfx.volume = 0.8;
    sfx.play().catch(() => {});
  } catch {
    // Audio playback optional
  }
}

/**
 * Play File 4: Wrong answer sound effect
 */
export function playWrongSound(): void {
  try {
    const sfx = new Audio('/audio/sfx-wrong.mp3');
    sfx.volume = 0.8;
    sfx.play().catch(() => {});
  } catch {
    // Audio playback optional
  }
}
