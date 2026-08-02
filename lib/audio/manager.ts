import { Howl } from "howler";
import { AudioPresetId } from "../themes/types";
import { AUDIO_PRESETS } from "../themes/audio-presets";

class AudioManager {
  private bgMusic: Howl | null = null;
  private currentPresetId: AudioPresetId = "none";
  private sfxCache: Record<string, Howl> = {};
  private muted: boolean = false;
  private bgVolume: number = 0.5;
  private sfxVolume: number = 0.8;
  private hasInteracted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("audio-muted");
      this.muted = savedMute === "true";

      document.addEventListener("visibilitychange", this.handleVisibilityChange);

      const unlock = () => {
        this.hasInteracted = true;
        document.removeEventListener("click", unlock);
        document.removeEventListener("touchstart", unlock);
        if (this.bgMusic && !this.bgMusic.playing() && !this.muted) {
          this.bgMusic.play();
        }
      };
      document.addEventListener("click", unlock);
      document.addEventListener("touchstart", unlock);
    }
  }

  public getCurrentPresetId(): AudioPresetId {
    return this.currentPresetId;
  }

  private handleVisibilityChange = () => {
    if (typeof document === "undefined" || !this.bgMusic) return;
    if (document.visibilityState === "hidden") {
      if (this.bgMusic.playing()) {
        this.bgMusic.pause();
      }
    } else {
      if (!this.muted && this.hasInteracted) {
        this.bgMusic.play();
      }
    }
  };

  public loadBgMusic(
    presetId: AudioPresetId,
    volume: number = 0.5,
    autoplay: boolean = true
  ) {
    if (typeof window === "undefined") return;

    if (this.currentPresetId === presetId && this.bgMusic) {
      this.bgVolume = volume;
      this.bgMusic.volume(this.muted ? 0 : volume);
      return;
    }

    this.destroyBgMusic();
    this.currentPresetId = presetId;
    this.bgVolume = volume;

    const preset = AUDIO_PRESETS[presetId];
    if (!preset || presetId === "none") return;

    this.bgMusic = new Howl({
      src: [preset.filePath],
      html5: true,
      loop: true,
      volume: this.muted ? 0 : volume,
      onloaderror: (id, err) => console.error("Error loading bg music", err),
      onplayerror: (id, err) => console.warn("Autoplay blocked or play failed", err),
    });

    if (autoplay && this.hasInteracted && !this.muted) {
      this.bgMusic.play();
    }
  }

  public playBgMusic() {
    if (this.bgMusic && !this.muted) {
      this.bgMusic.play();
      this.bgMusic.fade(0, this.bgVolume, 500);
    }
  }

  public pauseBgMusic() {
    if (this.bgMusic) {
      this.bgMusic.fade(this.bgVolume, 0, 300);
      const activeBg = this.bgMusic;
      setTimeout(() => {
        if (activeBg && activeBg.playing()) {
          activeBg.pause();
        }
      }, 300);
    }
  }

  public setBgVolume(volume: number) {
    this.bgVolume = volume;
    if (this.bgMusic) {
      this.bgMusic.volume(this.muted ? 0 : volume);
    }
  }

  public isBgPlaying(): boolean {
    return this.bgMusic ? this.bgMusic.playing() : false;
  }

  public playSfx(path: string) {
    if (typeof window === "undefined" || this.muted) return;

    let sfx = this.sfxCache[path];
    if (!sfx) {
      sfx = new Howl({
        src: [path],
        volume: this.sfxVolume,
      });
      this.sfxCache[path] = sfx;
    }
    sfx.play();
  }

  public preloadSfx(paths: string[]) {
    if (typeof window === "undefined") return;
    paths.forEach((path) => {
      if (!this.sfxCache[path]) {
        this.sfxCache[path] = new Howl({
          src: [path],
          volume: this.sfxVolume,
          preload: true,
        });
      }
    });
  }

  public muteAll() {
    this.muted = true;
    if (typeof window !== "undefined") {
      localStorage.setItem("audio-muted", "true");
    }
    if (this.bgMusic) {
      this.bgMusic.volume(0);
    }
  }

  public unmuteAll() {
    this.muted = false;
    if (typeof window !== "undefined") {
      localStorage.setItem("audio-muted", "false");
    }
    if (this.bgMusic) {
      this.bgMusic.volume(this.bgVolume);
      if (this.hasInteracted && !this.bgMusic.playing()) {
        this.bgMusic.play();
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public destroyBgMusic() {
    if (this.bgMusic) {
      this.bgMusic.stop();
      this.bgMusic.unload();
      this.bgMusic = null;
    }
    this.currentPresetId = "none";
  }

  public destroy() {
    this.destroyBgMusic();
    Object.values(this.sfxCache).forEach((sfx) => sfx.unload());
    this.sfxCache = {};
    if (typeof window !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }
}

export const audioManager = new AudioManager();
