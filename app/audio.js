// ================= SONIDO: darkwave sintetizado (WebAudio, original) =================
const SND = (() => {
  let ctx = null, master = null, music = null, sfx = null, verb = null, playing = false, timer = null;
  let bpm = 92, step = 0, nextT = 0, tension = 0, heart = false;
  // progresión original en La menor frigio-ish: Am – F – Dm – E
  const PROG = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]];
  const BASS = [45, 41, 38, 40];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.connect(ctx.destination);
    music = ctx.createGain(); music.gain.value = 0.55; sfx = ctx.createGain(); sfx.gain.value = 0.9;
    // reverb "catedral" con convolución de ruido sintetizado
    verb = ctx.createConvolver(); const len = ctx.sampleRate * 3.2, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb.buffer = buf; const vg = ctx.createGain(); vg.gain.value = 0.35; verb.connect(vg); vg.connect(master);
    music.connect(master); sfx.connect(master); music.connect(verb); sfx.connect(verb);
    setVol(); return true;
  }
  function setVol() { if (!master) return; master.gain.setTargetAtTime(S.cfg.snd ? (S.cfg.vol / 100) * 0.7 : 0, ctx.currentTime, 0.05); }
  function env(g, t, a, peak, d, end = 0.0001) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(end, t + a + d); }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    env(g, t, 0.003, 0.9, 0.28); o.connect(g); g.connect(music); o.start(t); o.stop(t + 0.35);
  }
  function hat(t, v = 0.08) {
    const b = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = ctx.createGain(); env(g, t, 0.002, v, 0.04); s.connect(f); f.connect(g); g.connect(music); s.start(t);
  }
  function bass(t, m, dur) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = mtof(m); f.type = 'lowpass'; f.frequency.setValueAtTime(900 + tension * 1200, t); f.frequency.exponentialRampToValueAtTime(160, t + dur); f.Q.value = 6;
    env(g, t, 0.01, 0.32, dur); o.connect(f); f.connect(g); g.connect(music); o.start(t); o.stop(t + dur + 0.05);
  }
  function pad(t, notes, dur) {
    for (const m of notes) for (const det of [-9, 0, 8]) {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det; f.type = 'lowpass'; f.frequency.value = 1300;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.022, t + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(music); o.start(t); o.stop(t + dur + 0.1);
    }
    // coro de órgano (aditivo)
    for (const m of notes) for (const h of [1, 2, 4]) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = mtof(m + 12) * h;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.012 / h, t + dur * 0.5); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(music); o.start(t); o.stop(t + dur + 0.1);
    }
  }
  function heartbeat(t) {
    for (const [dt, v] of [[0, 0.9], [0.18, 0.6]]) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(70, t + dt); o.frequency.exponentialRampToValueAtTime(38, t + dt + 0.12);
      env(g, t + dt, 0.004, v, 0.16); o.connect(g); g.connect(music); o.start(t + dt); o.stop(t + dt + 0.25);
    }
  }
  function schedule() {
    const spb = 60 / bpm / 4; // semicorchea
    while (nextT < ctx.currentTime + 0.12) {
      const bar = Math.floor(step / 16) % 4, s16 = step % 16;
      if (s16 % 4 === 0) kick(nextT);
      if (s16 % 4 === 2) hat(nextT, 0.05 + tension * 0.05);
      if (tension > 0.5 && s16 % 2 === 1) hat(nextT, 0.03);
      if (s16 % 2 === 0) bass(nextT, BASS[bar] + (s16 % 8 === 6 ? 12 : 0), spb * 1.8);
      if (s16 === 0) pad(nextT, PROG[bar], spb * 16);
      if (heart && s16 % 8 === 0) heartbeat(nextT);
      nextT += spb; step++;
    }
  }
  function start() {
    if (!init() || playing) return; if (ctx.state === 'suspended') ctx.resume();
    playing = true; nextT = ctx.currentTime + 0.05; step = 0; timer = setInterval(schedule, 40);
    music.gain.cancelScheduledValues(ctx.currentTime); music.gain.setTargetAtTime(0.55, ctx.currentTime, 0.4);
  }
  function stop() {
    if (!ctx || !playing) return; playing = false; clearInterval(timer);
    music.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15); setTimeout(() => { if (!playing) music.gain.value = 0.55; }, 900);
    setTension(0);
  }
  function setTension(x) { tension = clamp(x, 0, 1); bpm = 92 + tension * 44; heart = tension >= 0.66; }
  function bell() { // campana de catedral (parciales inarmónicos)
    if (!init()) return; const t = ctx.currentTime;
    for (const [r, a, d] of [[1, 0.28, 2.4], [2.76, 0.12, 1.4], [5.4, 0.07, 0.9], [8.93, 0.04, 0.5], [0.5, 0.1, 2.8]]) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = 659.25 * r; env(g, t, 0.004, a, d); o.connect(g); g.connect(sfx); o.start(t); o.stop(t + d + 0.1);
    }
  }
  function glass() { // vidrio + glitch
    if (!init()) return; const t = ctx.currentTime;
    const b = ctx.createBuffer(1, ctx.sampleRate * 0.35, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.02 ? 1 : 0.35) * Math.pow(1 - i / d.length, 2);
    const s = ctx.createBufferSource(); s.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 4200; f.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = 0.7; s.connect(f); f.connect(g); g.connect(sfx); s.start(t);
    for (let i = 0; i < 6; i++) { const o = ctx.createOscillator(), gg = ctx.createGain(); o.type = 'square'; o.frequency.value = 2500 + Math.random() * 4000; const tt = t + Math.random() * 0.12; env(gg, tt, 0.002, 0.05, 0.08); o.connect(gg); gg.connect(sfx); o.start(tt); o.stop(tt + 0.12); }
    const o = ctx.createOscillator(), gg = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.3); env(gg, t, 0.005, 0.25, 0.3); o.connect(gg); gg.connect(sfx); o.start(t); o.stop(t + 0.4);
  }
  function tick() { if (!init()) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = 1800; env(g, t, 0.001, 0.05, 0.03); o.connect(g); g.connect(sfx); o.start(t); o.stop(t + 0.05); }
  function rise() { if (!init()) return; const t = ctx.currentTime; [0, 4, 7, 12].forEach((n, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = mtof(69 + n); env(g, t + i * 0.09, 0.005, 0.15, 0.6); o.connect(g); g.connect(sfx); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.8); }); }
  return { init, start, stop, setTension, bell, glass, tick, rise, setVol, get on() { return playing; } };
})();
