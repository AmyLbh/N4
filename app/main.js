// ================= FONDO: rejilla de neón, niebla, partículas y lluvia de kana =================
const BG = (() => {
  const cv = $('#bg'), cx = cv.getContext('2d'); let W = 0, H = 0, dpr = 1, t = 0, calm = false, raf = 0, last = 0;
  const KANA = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん漢字日本語忘待持午牛買売';
  let drops = [], parts = [];
  function size() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); drops = Array.from({ length: Math.ceil(W / 46) }, (_, i) => ({ x: i * 46 + 10, y: Math.random() * H, v: 18 + Math.random() * 30, c: KANA[rnd(KANA.length)] })); parts = Array.from({ length: 34 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + .3, v: 4 + Math.random() * 10 })); }
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000 || 0.016); last = now; t += dt;
    cx.fillStyle = '#050509'; cx.fillRect(0, 0, W, H);
    // halo violeta superior (rosetón lejano)
    const g = cx.createRadialGradient(W / 2, H * 0.18, 10, W / 2, H * 0.18, Math.max(W, H) * 0.6); g.addColorStop(0, 'rgba(138,61,255,.16)'); g.addColorStop(.5, 'rgba(196,20,47,.05)'); g.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    // lluvia de kana
    cx.font = '15px "Shippori Mincho", serif'; cx.textAlign = 'center';
    for (const d of drops) { if (!calm) { d.y += d.v * dt; if (d.y > H + 20) { d.y = -20; d.c = KANA[rnd(KANA.length)]; } } cx.fillStyle = 'rgba(164,255,60,.07)'; cx.fillText(d.c, d.x, d.y); cx.fillStyle = 'rgba(180,139,255,.05)'; cx.fillText(KANA[(d.x | 0) % KANA.length], d.x, d.y - 22); }
    // rejilla en perspectiva
    const hz = H * 0.62; cx.strokeStyle = 'rgba(138,61,255,.22)'; cx.lineWidth = 1;
    for (let i = -12; i <= 12; i++) { cx.beginPath(); cx.moveTo(W / 2 + i * 8, hz); cx.lineTo(W / 2 + i * W * 0.22, H); cx.stroke(); }
    const off = calm ? 0 : (t * 0.35) % 1;
    for (let j = 0; j < 14; j++) { const p = (j + off) / 14, y = hz + (H - hz) * p * p; cx.strokeStyle = `rgba(196,20,47,${0.05 + p * 0.22})`; cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke(); }
    // niebla baja
    const f = cx.createLinearGradient(0, hz - 40, 0, H); f.addColorStop(0, 'rgba(5,5,9,0)'); f.addColorStop(.55, 'rgba(20,14,34,.55)'); f.addColorStop(1, 'rgba(5,5,9,.92)'); cx.fillStyle = f; cx.fillRect(0, hz - 40, W, H - hz + 40);
    // partículas (polvo de vitral)
    for (const p of parts) { if (!calm) { p.y -= p.v * dt; p.x += Math.sin(t + p.y * .01) * .2; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } } cx.fillStyle = 'rgba(201,204,216,.35)'; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill(); }
    if (!calm && !document.hidden) raf = setTimeout(() => requestAnimationFrame(frame), 33);
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
