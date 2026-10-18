// ================= FONDO: rejilla de neón, niebla, partículas y lluvia de kana =================
const BG = (() => {
  // Retablo en tinta: sigilo simétrico con espinas, columna vertebral, halos y ceniza rosa que cae.
  const cv = $('#bg'), cx = cv.getContext('2d'); let W = 0, H = 0, dpr = 1, t = 0, calm = false, raf = 0, last = 0, layer = null;
  let ash = [];
  function sigil(g, w, h) {
    const cxm = w / 2, top = h * 0.12, len = h * 0.78;
    g.lineCap = 'round';
    // halos
    for (const [ry, a] of [[0.035, .5], [0.05, .25], [0.075, .12]]) { g.strokeStyle = `rgba(255,184,217,${a})`; g.lineWidth = 1; g.beginPath(); g.ellipse(cxm, top, w * ry * 3.2, h * ry * .55, 0, 0, 7); g.stroke(); }
    // columna vertebral (ciempiés)
    const n = 26;
    for (let i = 0; i < n; i++) {
      const y = top + 30 + i * (len / n), s = 1 - i / n * 0.6, wv = Math.min(w * .06, 34) * s;
      g.fillStyle = `rgba(233,223,229,${0.10 + 0.08 * Math.sin(i)})`; g.beginPath(); g.ellipse(cxm, y, wv, len / n * .34, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(233,223,229,.16)'; g.lineWidth = 1;
      for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(cxm + sd * wv, y); g.quadraticCurveTo(cxm + sd * (wv + 30 * s), y - 8, cxm + sd * (wv + 58 * s), y + 14 * s); g.stroke(); }
    }
    // alas de sigilo: curvas espinosas espejadas
    const seed = [0.9, 1.3, 0.7, 1.6, 1.1, 0.8, 1.4];
    for (let k = 0; k < seed.length; k++) {
      const y0 = top + 40 + k * len * 0.09, span = w * (0.22 + 0.06 * seed[k]), drop = 40 + 30 * seed[k];
      for (const sd of [-1, 1]) {
        g.strokeStyle = k % 2 ? 'rgba(255,95,174,.20)' : 'rgba(233,223,229,.16)'; g.lineWidth = k % 3 === 0 ? 1.6 : 1;
        g.beginPath(); g.moveTo(cxm + sd * 14, y0);
        g.bezierCurveTo(cxm + sd * span * .3, y0 - drop, cxm + sd * span * .7, y0 + drop * .2, cxm + sd * span, y0 - drop * .6); g.stroke();
        // espinas
        for (let j = 1; j < 6; j++) { const u = j / 6, px = cxm + sd * span * u, py = y0 - drop * (0.55 * Math.sin(u * Math.PI)) + (u > .7 ? -drop * .3 * (u - .7) * 3 : 0); g.beginPath(); g.moveTo(px, py); g.lineTo(px + sd * 7, py - 11 - 6 * seed[(j + k) % 7]); g.stroke(); }
      }
    }
    // filigrana virreinal: arcos inferiores
    g.strokeStyle = 'rgba(233,223,229,.08)'; g.lineWidth = 1;
    for (let r = 1; r <= 3; r++) { g.beginPath(); g.arc(cxm, h + 40, w * 0.18 * r, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }
  }
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layer = document.createElement('canvas'); layer.width = W * dpr; layer.height = H * dpr; const g = layer.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); sigil(g, W, H);
    ash = Array.from({ length: 42 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .4, v: 6 + Math.random() * 14, s: Math.random() * 6, p: Math.random() < .35 }));
  }
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000 || 0.016); last = now; t += dt;
    cx.fillStyle = '#040203'; cx.fillRect(0, 0, W, H);
    const g = cx.createRadialGradient(W / 2, H * 0.12, 4, W / 2, H * 0.12, Math.max(W, H) * 0.55); g.addColorStop(0, 'rgba(255,95,174,.16)'); g.addColorStop(.45, 'rgba(122,20,70,.07)'); g.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.globalAlpha = calm ? 0.9 : 0.75 + 0.2 * Math.sin(t * 0.6); cx.drawImage(layer, 0, 0, W, H); cx.globalAlpha = 1;
    for (const a of ash) {
      if (!calm) { a.y += a.v * dt; a.x += Math.sin(t * .8 + a.s) * .25; if (a.y > H + 6) { a.y = -6; a.x = Math.random() * W; } }
      if (a.p) { cx.fillStyle = 'rgba(255,95,174,.55)'; cx.beginPath(); cx.ellipse(a.x, a.y, a.r * 2.2, a.r * .8, Math.sin(t + a.s), 0, 7); cx.fill(); }
      else { cx.fillStyle = 'rgba(233,223,229,.35)'; cx.beginPath(); cx.arc(a.x, a.y, a.r, 0, 7); cx.fill(); }
    }
    if (!calm && !document.hidden) raf = setTimeout(() => requestAnimationFrame(frame), 40);
  }
  function setCalm(c) { calm = c; clearTimeout(raf); requestAnimationFrame(frame); }
  addEventListener('resize', () => { size(); if (calm) requestAnimationFrame(frame); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !calm) { clearTimeout(raf); requestAnimationFrame(frame); } });
  size();
  return { setCalm };
})();

// ================= ARRANQUE =================
function boot() {
  const b = $('#boot'), lg = $('#bootlog');
  const dl = daysLeft();
  const lines = ['> iniciando ritual...', '> cargando ' + K.length + ' kanji · ' + V.length + ' palabras · ' + G.length + ' preguntas', '> sincronizando ' + Math.max(0, dl) + ' días para el juicio', '> integridad: ' + readiness().pct.toFixed(1) + '%'];
  let i = 0; const done = () => { if (b.classList.contains('out')) return; b.classList.add('out'); setTimeout(() => b.remove(), 300); };
  const step = () => { if (i < lines.length) { const d = document.createElement('div'); d.textContent = lines[i++]; lg.appendChild(d); setTimeout(step, reduceMotion() ? 0 : 320); } else setTimeout(done, 350); };
  b.onclick = done; b.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') done(); };
  step(); setTimeout(done, 2000);
}
function firstRun() {
  stage().innerHTML = `<div class="col"><h1 class="h-title">Bienvenida al ritual</h1>
  <div class="arch">${ARCH}<div class="col" style="padding:0 16px 16px">
    <p style="margin:0">Aquí 100% es el único estado aceptable. Cada kanji, palabra y punto de gramática de la Semana 2 se presenta primero, luego se examina hasta dominarlo: <b>3 aciertos rápidos seguidos en ambos sentidos</b>.</p>
    <div class="field"><label class="lbl" for="fx">¿Cuándo es tu examen N4?</label><input type="date" id="fx" value="${todayKey(new Date(Date.now() + 30 * DAY))}"></div>
    <div class="field"><label class="lbl" for="fd">Reloj</label><select id="fd"><option value="normal">Normal · 15 s</option><option value="dura">Dura · 10 s</option><option value="brutal">Brutal · 6 s</option></select></div>
    <button class="btn pri block" id="fgo">Empezar con el diagnóstico</button>
    <button class="btn ghost block" id="fskip">Saltar diagnóstico e ir a Iniciación</button>
  </div></div>${logHTML([{ ts: hhmmss(), code: 'SYS 0x00', text: 'Sistema en blanco. El espejo empieza a observar.', cls: 'c-sys' }])}</div>`;
  const fin = () => { S.cfg.exam = $('#fx').value; S.cfg.diff = $('#fd').value; S.cfg.setup = 1; save(true); header(); };
  $('#fgo').onclick = () => { fin(); startDiag(); };
  $('#fskip').onclick = () => { fin(); startIntro(); };
}
window.onCloudLoaded = () => { applyCfg(); paintMute(); if (!document.body.classList.contains('inq')) render(); };
(function main() {
  const local = loadLocal(); if (local) mergeState(local);
  S.lastSeenPrev = S.lastSeen || Date.now();
  initVoice(); applyCfg(); paintMute(); header(); buildQueue();
  $$('nav.bottom button').forEach(b => b.onclick = () => { if (SES && !SES.done && document.body.classList.contains('inq')) { SES.done = true; cancelAnimationFrame(SES.raf); } setTab(b.dataset.tab); });
  $('#muteBtn').onclick = () => { S.cfg.snd = S.cfg.snd ? 0 : 1; SND.init(); SND.setVol(); paintMute(); save(); };
  $('#vol').oninput = e => { S.cfg.vol = +e.target.value; SND.init(); SND.setVol(); save(); };
  setInterval(header, 60000);
  boot();
  if (!S.cfg.setup) { $$('nav.bottom button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === 'hoy' ? 'page' : 'false')); firstRun(); }
  else setTab('hoy');
  initCloud();
})();
