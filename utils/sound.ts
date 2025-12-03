
// CloudOS Sound Engine
// Uses Web Audio API to generate real-time synthesized sound effects
// Designed for a "Low-key Luxury" aesthetic (Glass, Air, Wood textures)

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

const resumeCtx = () => {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
};

// 1. CLICK: A short, crisp, woody/glassy tap
export const playClick = (pitch: 'low' | 'high' = 'high') => {
  try {
    const ctx = resumeCtx();
    const t = ctx.currentTime;

    // Oscillator for tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Sine wave for clean tap
    osc.type = 'sine';
    
    // Frequency sweep for "impact" feel
    const startFreq = pitch === 'high' ? 800 : 400;
    const endFreq = pitch === 'high' ? 300 : 150;
    
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.08);

    // Envelope (Short attack, fast decay)
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.01); // Soft attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.start(t);
    osc.stop(t + 0.1);

  } catch (e) {
    // Ignore audio errors (e.g. if user hasn't interacted yet)
  }
};

// 2. OPEN APP: A glassy shimmer/swell
export const playAppOpen = () => {
  try {
    const ctx = resumeCtx();
    const t = ctx.currentTime;

    // Create a chord for luxury feel (Major 7th ish)
    const frequencies = [330, 440, 554, 659]; // E4, A4, C#5, E5
    
    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle'; // Triangle has soft harmonics
        osc.frequency.setValueAtTime(freq, t);
        
        // Staggered entrance
        const delay = i * 0.02;
        const duration = 0.6;
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.03, t + delay + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + duration);
        
        osc.start(t);
        osc.stop(t + delay + duration + 0.1);
    });

  } catch (e) {}
};

// 3. CLOSE/BACK: A quick, reverse-like suction sound
export const playPlop = () => {
    try {
        const ctx = resumeCtx();
        const t = ctx.currentTime;
    
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
    
        osc.connect(gain);
        gain.connect(ctx.destination);
    
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(400, t + 0.1);
    
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
    
        osc.start(t);
        osc.stop(t + 0.15);
      } catch (e) {}
}

// 4. NOTIFICATION: A soft bell
export const playNotification = () => {
    try {
        const ctx = resumeCtx();
        const t = ctx.currentTime;
    
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t); // A5
        
        // Bell envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        
        osc.start(t);
        osc.stop(t + 1.5);

        // Add a second harmonic for richness
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1760, t); // A6
        gain2.gain.setValueAtTime(0, t);
        gain2.gain.linearRampToValueAtTime(0.01, t + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 1);
        osc2.start(t);
        osc2.stop(t + 1);

      } catch (e) {}
}

// 5. HOVER: Very subtle high tick (Optional, used for menu items)
export const playHover = () => {
    try {
        const ctx = resumeCtx();
        const t = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        
        gain.gain.setValueAtTime(0.005, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.03);
        
        osc.start(t);
        osc.stop(t + 0.05);
    } catch(e) {}
}
