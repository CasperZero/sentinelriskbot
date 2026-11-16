export type AlarmSoundType = 'siren' | 'klaxon' | 'beeps' | 'chime' | 'radar' | 'strobe' | 'meow';

export interface AlarmSoundOption {
  id: AlarmSoundType;
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  icon: string;
}

export const ALARM_SOUND_OPTIONS: AlarmSoundOption[] = [
  {
    id: 'siren',
    nameEn: 'Nuclear Siren (Sweep)',
    nameEs: 'Sirena Nuclear (Barrido)',
    descriptionEn: 'High-frequency pitch sweep for critical market alerts',
    descriptionEs: 'Barrido de frecuencia agudo para alertas críticas de mercado',
    icon: '🚨'
  },
  {
    id: 'meow',
    nameEn: 'Cat Meow (Miau)',
    nameEs: 'Maullido de Gato (Miau)',
    descriptionEn: 'Playful synthesized kitten meow pitch glide for friendly alerts',
    descriptionEs: 'Divertido maullido sintetizado de gatito para alertas amigables',
    icon: '🐱'
  },
  {
    id: 'klaxon',
    nameEn: 'Industrial Klaxon (Dual-Tone)',
    nameEs: 'Claxon Industrial (Doble Tono)',
    descriptionEn: 'Alternating square wave dual-frequency blast',
    descriptionEs: 'Ráfaga de doble frecuencia de onda cuadrada alterna',
    icon: '📢'
  },
  {
    id: 'beeps',
    nameEn: 'Rapid Algorithmic Beeps',
    nameEs: 'Pitidos Rápidos Cuánticos',
    descriptionEn: 'Triple sharp digital pulses at 1046 Hz',
    descriptionEs: 'Pulsos digitales agudos triples en 1046 Hz',
    icon: '⚡'
  },
  {
    id: 'chime',
    nameEn: 'Metallic Harmonic Chime',
    nameEs: 'Campana Armónica Metálica',
    descriptionEn: 'Warm sine dual-note resonance (C5 + E5 decay)',
    descriptionEs: 'Resonancia armónica de doble nota suave',
    icon: '🔔'
  },
  {
    id: 'radar',
    nameEn: 'Sonar Radar Ping',
    nameEs: 'Ping de Radar Sonar',
    descriptionEn: 'Deep underwater echo ping with exponential decay',
    descriptionEs: 'Eco de profundidad tipo sonar submarino',
    icon: '📡'
  },
  {
    id: 'strobe',
    nameEn: 'Laser Strobe Modulator',
    nameEs: 'Estroboscópico Láser Modulado',
    descriptionEn: 'Rapid multi-burst frequency modulation',
    descriptionEs: 'Modulación de frecuencia en ráfagas rápidas',
    icon: '💥'
  }
];

// Global Audio Muting Management (Strict Single Source of Truth)
const GLOBAL_MUTE_STORAGE_KEY = 'sentinel_global_audio_muted';
let isGlobalMutedState: boolean = false;

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(GLOBAL_MUTE_STORAGE_KEY);
    if (saved !== null) {
      isGlobalMutedState = saved === 'true';
    }
  } catch (e) {
    console.warn('Could not read global mute from localStorage', e);
  }

  // Intercept any HTMLAudioElement.play() globally to strictly block audio when muted
  if (typeof window.HTMLAudioElement !== 'undefined' && window.HTMLAudioElement.prototype) {
    const originalPlay = window.HTMLAudioElement.prototype.play;
    window.HTMLAudioElement.prototype.play = function (...args: any[]) {
      if (getIsGlobalMuted()) {
        return Promise.resolve();
      }
      return originalPlay.apply(this, args);
    };
  }
}

export function getIsGlobalMuted(): boolean {
  return isGlobalMutedState;
}

export function setGlobalMuted(muted: boolean): void {
  isGlobalMutedState = muted;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GLOBAL_MUTE_STORAGE_KEY, String(muted));
      window.dispatchEvent(new CustomEvent('sentinel_audio_mute_toggle', { detail: { isMuted: muted } }));
    } catch (e) {
      console.warn('Could not save global mute to localStorage', e);
    }
  }
}

export function toggleGlobalMute(): boolean {
  const next = !isGlobalMutedState;
  setGlobalMuted(next);
  return next;
}

export function playAlarmSound(soundType: AlarmSoundType = 'siren', volume: number = 0.15, force: boolean = false): void {
  // Strict guard clause BEFORE any audio playback is generated
  if (!force && getIsGlobalMuted()) {
    return;
  }

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;

    switch (soundType) {
      case 'siren': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);
        
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'klaxon': {
        // Pulse 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        gain1.gain.setValueAtTime(volume, now);
        gain1.gain.setValueAtTime(0.001, now + 0.12);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.12);

        // Pulse 2
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(880, now + 0.15); // A5
        gain2.gain.setValueAtTime(volume, now + 0.15);
        gain2.gain.setValueAtTime(0.001, now + 0.32);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.32);
        break;
      }

      case 'beeps': {
        const times = [0, 0.09, 0.18];
        times.forEach((t) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1046.50, now + t); // C6
          gain.gain.setValueAtTime(volume * 1.2, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + t);
          osc.stop(now + t + 0.06);
        });
        break;
      }

      case 'chime': {
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(volume * 0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);
        });
        break;
      }

      case 'radar': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
        
        gain.gain.setValueAtTime(volume * 1.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case 'strobe': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        
        // Fast pitch modulation
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.08);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.16);
        osc.frequency.linearRampToValueAtTime(600, now + 0.24);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.32);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'meow': {
        const duration = 0.65; // realistic meow length

        // --- 1. Vocal Chord Source (Rich Sawtooth Wave) ---
        const source = ctx.createOscillator();
        source.type = 'sawtooth';

        // Pitch envelope: M (580Hz) -> EA (920Hz peak) -> OW (420Hz)
        source.frequency.setValueAtTime(580, now);
        source.frequency.exponentialRampToValueAtTime(920, now + 0.22);
        source.frequency.exponentialRampToValueAtTime(420, now + duration);

        // --- 2. Organic LFO Vibrato (6.5 Hz) ---
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(6.5, now);
        lfoGain.gain.setValueAtTime(0, now);
        lfoGain.gain.setValueAtTime(18, now + 0.15); // gentle vibrato during "e-a"
        lfoGain.gain.linearRampToValueAtTime(0, now + 0.5);
        lfo.connect(lfoGain);
        lfoGain.connect(source.frequency);
        lfo.start(now);
        lfo.stop(now + duration);

        // --- 3. Dual Formant Bandpass Filters (Oral & Nasal Cavity Simulation) ---
        // Formant 1 (F1 - First Vowel Resonance: M -> AH -> OW)
        const f1 = ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.Q.setValueAtTime(6.0, now);
        f1.frequency.setValueAtTime(450, now);
        f1.frequency.exponentialRampToValueAtTime(1350, now + 0.22); // mouth opens for "AH"
        f1.frequency.exponentialRampToValueAtTime(380, now + duration); // mouth closes for "OW"

        // Formant 2 (F2 - Second Vowel Resonance: Brightness / Cat Bite)
        const f2 = ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.Q.setValueAtTime(7.5, now);
        f2.frequency.setValueAtTime(1600, now);
        f2.frequency.exponentialRampToValueAtTime(2700, now + 0.22);
        f2.frequency.exponentialRampToValueAtTime(1100, now + duration);

        // Sub-harmonic sweetener for warmth
        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(290, now);
        subOsc.frequency.exponentialRampToValueAtTime(460, now + 0.22);
        subOsc.frequency.exponentialRampToValueAtTime(210, now + duration);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.01, now);
        subGain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.1);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // --- 4. Main Amplitude Envelope ---
        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0.001, now);
        mainGain.gain.linearRampToValueAtTime(volume * 2.2, now + 0.12);
        mainGain.gain.setValueAtTime(volume * 2.0, now + 0.3);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Connect Source -> Parallel Formants -> Main Gain
        source.connect(f1);
        source.connect(f2);
        f1.connect(mainGain);
        f2.connect(mainGain);

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);

        mainGain.connect(ctx.destination);

        // --- 5. Initial Breath/Nasal Air Puff ---
        try {
          const bufferSize = ctx.sampleRate * 0.08; // 80ms noise
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;

          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(1100, now);
          noiseFilter.Q.setValueAtTime(3, now);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(volume * 0.35, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          whiteNoise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(ctx.destination);

          whiteNoise.start(now);
          whiteNoise.stop(now + 0.08);
        } catch (e) {
          // ignore noise buffer creation error if unsupported
        }

        source.start(now);
        subOsc.start(now);

        source.stop(now + duration);
        subOsc.stop(now + duration);
        break;
      }
    }
  } catch (e) {
    console.warn('Audio play restricted or failed', e);
  }
}

/**
 * Synthesizes a crisp, bullish ascending harmonic arpeggio (C5 -> E5 -> G5 -> C6)
 * specifically designed for quantitative Buy Signal detections and capitulation bounces.
 */
export function playBuySignalChime(volume: number = 0.2, force: boolean = false): void {
  // Strict global mute check
  if (!force && getIsGlobalMuted()) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [
      { f: 523.25, t: 0.00, dur: 0.45 }, // C5
      { f: 659.25, t: 0.08, dur: 0.45 }, // E5
      { f: 783.99, t: 0.16, dur: 0.45 }, // G5
      { f: 1046.50, t: 0.24, dur: 0.65 } // C6
    ];

    notes.forEach(({ f, t, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.0001, now + t);
      gain.gain.linearRampToValueAtTime(volume * 0.9, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + dur);
    });
  } catch (e) {
    console.warn('Buy Signal Audio play restricted or failed', e);
  }
}

/**
 * Synthesizes a crisp, distribution descending harmonic arpeggio (C6 -> G5 -> E5 -> C5)
 * specifically designed for quantitative Sell Signal detections, take-profit alerts, and short squeeze tops.
 */
export function playSellSignalChime(volume: number = 0.2, force: boolean = false): void {
  // Strict global mute check
  if (!force && getIsGlobalMuted()) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [
      { f: 1046.50, t: 0.00, dur: 0.45 }, // C6
      { f: 783.99, t: 0.08, dur: 0.45 },  // G5
      { f: 659.25, t: 0.16, dur: 0.45 },  // E5
      { f: 523.25, t: 0.24, dur: 0.65 }   // C5
    ];

    notes.forEach(({ f, t, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.0001, now + t);
      gain.gain.linearRampToValueAtTime(volume * 0.7, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + dur);
    });
  } catch (e) {
    console.warn('Sell Signal Audio play restricted or failed', e);
  }
}

/**
 * Synthesizes a clean dual-resonance chime for VWAP & EMA Trend events:
 * Ascending bright chime for Bullish crossovers, descending resonant tone for Bearish breakdowns.
 */
export function playVwapSignalChime(isBullish: boolean, volume: number = 0.2, force: boolean = false): void {
  // Strict global mute check
  if (!force && getIsGlobalMuted()) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = isBullish
      ? [
          { f: 587.33, t: 0.00, dur: 0.35 }, // D5
          { f: 739.99, t: 0.07, dur: 0.35 }, // F#5
          { f: 880.00, t: 0.14, dur: 0.45 }, // A5
          { f: 1174.66, t: 0.21, dur: 0.60 } // D6
        ]
      : [
          { f: 880.00, t: 0.00, dur: 0.35 }, // A5
          { f: 739.99, t: 0.07, dur: 0.35 }, // F#5
          { f: 587.33, t: 0.14, dur: 0.45 }, // D5
          { f: 440.00, t: 0.21, dur: 0.60 }  // A4
        ];

    notes.forEach(({ f, t, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isBullish ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.0001, now + t);
      gain.gain.linearRampToValueAtTime(volume * 0.85, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + dur);
    });
  } catch (e) {
    console.warn('VWAP Signal Audio play restricted or failed', e);
  }
}
