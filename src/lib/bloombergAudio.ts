/**
 * Bloomberg Terminal Authentic Audio Synthesizer
 * Uses Web Audio API to produce low-latency institutional chimes and alert beeps.
 */

class BloombergAudioEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fincept_bloomberg_audio_enabled');
      this.isEnabled = stored !== null ? stored === 'true' : false;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getSoundEnabled(): boolean {
    return this.isEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fincept_bloomberg_audio_enabled', enabled ? 'true' : 'false');
    }
  }

  public toggleSound(): boolean {
    this.setSoundEnabled(!this.isEnabled);
    if (this.isEnabled) {
      this.playBloombergGoTone();
    }
    return this.isEnabled;
  }

  /**
   * Iconic Bloomberg <GO> Keypress Confirmation
   * Crisp dual-tone beep (880Hz -> 1320Hz)
   */
  public playBloombergGoTone(): void {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // E6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Urgent Breaking Flash News Wire Alert
   * Double warning pulse (1046Hz High-C)
   */
  public playFlashNewsAlert(): void {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.12].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1046.5, now + offset); // C6
        gain.gain.setValueAtTime(0.15, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.09);
      });
    } catch {
      // Autoplay fallback
    }
  }

  /**
   * Order Filled Trade Confirmation Chime
   * Rising major triad (C-E-G)
   */
  public playOrderFilledChime(): void {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, idx) => {
        const offset = idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.18);
      });
    } catch {
      // Autoplay fallback
    }
  }
}

export const bloombergAudio = new BloombergAudioEngine();
