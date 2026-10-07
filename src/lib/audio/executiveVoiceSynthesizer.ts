/**
 * Fincept Capital — Executive Voice Synthesizer Engine
 * 
 * Memberikan suara asli pada masing-masing petinggi saat sidang War Room berlangsung
 * menggunakan browser Web Speech API (SpeechSynthesis):
 * 
 * - Evelyn Santoso (CIO): Artikulatif, analitis, nada tajam
 * - Adrian Wijaya (CEO): Bariton berwibawa, tegas, lambat
 * - Bambang Suroso (CRO): Berat, protektif, disiplin risiko
 * - Kevin Zhang (Jesse Crypto Lead): Dinamis, cepat, modern
 * - Gilang Ramadhan (Head Trader): Tegas, ritme bursa
 * - Dr. Samuel (Head Research): Tenang, akademis
 */

export interface VoicePersona {
  pitch: number; // 0.5 - 1.5
  rate: number;  // 0.8 - 1.3
  preferFemale?: boolean;
}

const EXECUTIVE_VOICE_PERSONAS: Record<string, VoicePersona> = {
  cio: { pitch: 1.18, rate: 1.05, preferFemale: true },          // Bu Evelyn Santoso
  ceo: { pitch: 0.82, rate: 0.96, preferFemale: false },         // Pak Adrian Wijaya
  head_research: { pitch: 0.92, rate: 1.0, preferFemale: false }, // Dr. Samuel
  head_quant: { pitch: 1.02, rate: 1.06, preferFemale: false },   // Quant Lead
  pm_idx: { pitch: 0.90, rate: 1.02, preferFemale: false },       // Raditya Pratama
  chief_econ: { pitch: 1.12, rate: 1.02, preferFemale: true },    // Bu Dewi Lestari
  news_editor: { pitch: 1.22, rate: 1.08, preferFemale: true },   // Marsha Utami
  cco: { pitch: 1.06, rate: 0.95, preferFemale: true },           // Bu Siti Rahma
  cro: { pitch: 0.75, rate: 0.92, preferFemale: false },         // Pak Bambang Suroso
  head_trader: { pitch: 0.88, rate: 1.10, preferFemale: false },  // Gilang Ramadhan
  trader_crypto: { pitch: 1.05, rate: 1.12, preferFemale: false },// Kevin Zhang
};

/**
 * Membersihkan emoji dan karakter dekoratif sebelum dibacakan oleh TTS
 */
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Hapus emoji
    .replace(/[·•]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

class ExecutiveVoiceSynthesizer {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Mengucapkan kalimat dialog petinggi sesuai persona vokal masing-masing
   */
  public speak(
    agentId: string,
    text: string,
    options?: { volume?: number; onEnd?: () => void }
  ): void {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.stop();

    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    const persona = EXECUTIVE_VOICE_PERSONAS[agentId] || { pitch: 1.0, rate: 1.0 };

    utterance.pitch = persona.pitch;
    utterance.rate = persona.rate;
    utterance.volume = options?.volume ?? 0.85;

    // Cari suara bahasa Indonesia jika tersedia, fallback ke default bahasa
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const idVoice = this.voices.find(
      (v) => v.lang.startsWith('id') || v.lang.includes('ID')
    );
    const enVoice = this.voices.find(
      (v) => v.lang.startsWith('en')
    );

    if (idVoice) {
      utterance.voice = idVoice;
    } else if (enVoice) {
      utterance.voice = enVoice;
    }

    if (options?.onEnd) {
      utterance.onend = () => options.onEnd?.();
    }

    this.currentUtterance = utterance;
    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error ignored gracefully
    }
  }
}

export const executiveVoice = new ExecutiveVoiceSynthesizer();
