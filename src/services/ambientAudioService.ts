/**
 * Audio controller for Bao Tang Su Thi 4.0:
 * - File 1: /audio/bgm-app.m4a (Main App ambient BGM)
 * - File 2: /audio/bgm-arena.m4a (Hero Arena battle BGM)
 * - File 3: /audio/sfx-correct.mp3 (Correct answer sound effect)
 * - File 4: /audio/sfx-wrong.mp3 (Wrong answer sound effect)
 */

type BgmTrack = 'app' | 'arena';

class AmbientAudioController {
  private currentTrack: BgmTrack = 'app';
  private appAudio: HTMLAudioElement | null = null;
  private arenaAudio: HTMLAudioElement | null = null;
  private playing = false;

  private initAudios() {
    if (typeof window === 'undefined') return;
    if (this.appAudio && this.arenaAudio) return;

    this.appAudio = new Audio('/audio/bgm-app.m4a');
    this.appAudio.loop = true;
    this.appAudio.volume = 0.35;

    this.arenaAudio = new Audio('/audio/bgm-arena.m4a');
    this.arenaAudio.loop = true;
    this.arenaAudio.volume = 0.38;
  }

  isPlaying(): boolean {
    return this.playing;
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
        this.arenaAudio.currentTime = 0;
        this.arenaAudio.play().catch(() => {});
      }
    } else {
      if (this.arenaAudio) {
        this.arenaAudio.pause();
        this.arenaAudio.currentTime = 0;
      }
      if (this.appAudio) {
        this.appAudio.currentTime = 0;
        this.appAudio.play().catch(() => {});
      }
    }
  }

  start(): boolean {
    this.initAudios();
    this.playing = true;
    const target = this.currentTrack === 'arena' ? this.arenaAudio : this.appAudio;
    if (target) {
      target.play().catch(() => {
        // Autoplay may be restricted until user gesture
      });
    }
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
