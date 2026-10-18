// ================= ESPEJO (frases) =================
const CAT_CLS = { errores: 'c-err', repetido: 'c-err', baja: 'c-warn', racha: 'c-err', lento: 'c-warn', casi: 'c-warn', perfecto: 'c-ok', record: 'c-ok', examen: 'c-sys', final: 'c-err', ausente: 'c-warn', clasicos: 'c-err', roto: 'c-err', madrugada: 'c-sys' };
function mirror(cat, vars = {}) {
  const C = MIRROR[cat]; let lines = C.lines.filter(l => l !== S.lastPhrase);
  let text = pick(lines);
  S.lastPhrase = text;
  text = text.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  const line = { ts: hhmmss(), code: C.code, text, cls: CAT_CLS[cat] };
  S.log = (S.log || []).concat([line]).slice(-8);
  return line;
}
function keyLabel(key) {
  const [t, id, f] = key.split(':');
  if (t === 'v') { const v = VBY.get(+id); return v ? v.w : key; }
  if (t === 'k') return id;
  if (t === 'g') { const g = GBY.get(id); return g ? PTS[g.pt].pat.split(' ·')[0] : key; }
  if (t === 'c') { const v = VBY.get(+id); return v ? v.w + ' → ' + FORMS[f] : key; }
  if (t === 'pa') return 'partículas';
  if (t === 'cn') return 'contador ' + id;
  if (t === 'rd') { const r = READINGS.find(x => x.id === id); return '読解 ' + (r ? r.title : id); }
  return key;
}
function mirrorAuto() {
  const h = new Date().getHours();
  if (h >= 1 && h < 5) return mirror('madrugada');
  if (activeMs() > 90 * 60000) return mirror('madrugada');
  const away = S.lastSeen ? Math.floor((Date.now() - S.lastSeenPrev) / DAY) : 0;
  if (away >= 2) return mirror('ausente', { d: away });
  const lf = S.finals[S.finals.length - 1]; if (lf && !lf.pass && Date.now() - lf.t < 2 * DAY) return mirror('final', { pct: lf.pct });
  const ks = Object.keys(S.hist).sort(); if (ks.length >= 2) { const a = S.hist[ks[ks.length - 2]].r, b = S.hist[ks[ks.length - 1]].r; if (b < a - 0.05) return mirror('baja', { pct: b.toFixed(1) }); }
  const worst = Object.entries(S.crypt).sort((a, b) => b[1].n - a[1].n)[0];
  const classic = Object.keys(S.crypt).filter(k => k[0] === 'g' && ['ageru', 'tekureru', 'oblig', 'prohib', 'nohace', 'youninaru', 'younisuru', 'houga', 'meirei'].includes((GBY.get(k.split(':')[1]) || {}).pt));
  if (worst && worst[1].n >= 3 && Math.random() < 0.6) return mirror('repetido', { item: keyLabel(worst[0]), n: worst[1].n });
  if (classic.length && Math.random() < 0.5) return mirror('clasicos');
  return mirror('examen', { d: Math.max(0, daysLeft()) });
}
let actStart = Date.now(), actLast = Date.now();
function touchActivity() { const n = Date.now(); if (n - actLast > 15 * 60000) actStart = n; actLast = n; }
function activeMs() { return actLast - actStart; }
function logHTML(lines) {
  const L = (lines || S.log || []).slice(-5);
  if (!L.length) return '<div class="log"><span class="cur"></span></div>';
  return `<div class="log" aria-live="polite">${L.map((l, i) => `<div${i === L.length - 1 ? ' class="cur"' : ''}><span class="ts">[${esc(l.ts)}]</span> <span class="${l.cls}">[${esc(l.code)}]</span> ${esc(l.text)}</div>`).join('')}</div>`;
}

// ================= PLAN DE ESTUDIO =================
let QUEUE = null;
function buildQueue() {
  const q = [];
  const s2v = V.filter(v => v.wk === 2).map(v => 'v:' + v.id);
  const used = new Set(s2v);
  const kn = lv => K.filter(k => k.lv === lv);
  const seq = [];
  for (const lv of ['N5', 'N4']) for (const k of kn(lv)) {
    seq.push('k:' + k.k);
    for (const id of k.ex) { const key = 'v:' + id; const v = VBY.get(id); if (!used.has(key) && v && (v.lv === lv || lv === 'N4')) { used.add(key); seq.push(key); } }
  }
  const rest = V.filter(v => !used.has('v:' + v.id)).sort((a, b) => (a.lv === 'N5' ? 0 : 1) - (b.lv === 'N5' ? 0 : 1)).map(v => 'v:' + v.id);
  // intercalar: puntos de gramática distribuidos, S2 primero
  const main = s2v.concat(seq, rest);
  const pts = GPTS.map(p => 'p:' + p);
  const span = Math.min(main.length, 700), stepN = Math.floor(span / pts.length);
  let pi = 0;
  main.forEach((k, i) => { if (i % stepN === 0 && pi < pts.length) q.push(pts[pi++]); q.push(k); });
  while (pi < pts.length) q.push(pts[pi++]);
  QUEUE = q; return q;
}
function pendingIntro() { return (QUEUE || buildQueue()).filter(k => !isIntro(k)); }
function todayPlan() {
  const tk = todayKey(); const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  const doneToday = S.intro.filter(k => S.it[k] && (S.it[k].i || 0) >= +t0).length;
  S.plan = S.plan || {};
  if (!S.plan[tk] || S.plan[tk].v !== 2) {
    const rem = pendingIntro().length + doneToday, dl = Math.max(1, daysLeft() - 3);
    let quota = Math.ceil(rem / dl);
    // reajuste por desempeño: últimos 3 días con actividad (sin contar hoy)
    const ks = Object.keys(S.hist).filter(k => k < tk).sort().slice(-3); let q = 0, ok = 0; ks.forEach(k => { q += S.hist[k].q; ok += S.hist[k].ok; });
    const acc = q ? ok / q : 1, cr = Object.keys(S.crypt).length;
    if (acc < 0.85 || cr > 60) quota = Math.ceil(quota * 0.7);
    else if (acc > 0.95 && cr < 15 && q > 50) quota = Math.ceil(quota * 1.15);
    S.plan[tk] = { v: 2, quota: clamp(quota, rem ? Math.min(12, rem) : 0, 160), acc };
  }
  const P = S.plan[tk]; P.done = doneToday; return P;
}
function itemsIntroduced(prefix) { return S.intro.filter(k => k.startsWith(prefix)); }
function dueKeys() { return Object.keys(S.it).filter(k => /^[vkg]:/.test(k) && due(k)); }

// ================= ESPECIFICACIONES DE PREGUNTA (serializables, para el fantasma) =================
function specFor(key, opts = {}) {
  const [t, id] = key.split(':');
  if (t === 'k') { const k = KBY.get(id); const subs = ['read', 'meaning', 'toR', 'toM']; if (PAIR_OF.has(id)) subs.push('pair'); return { g: 'k', id, sub: opts.dir === 'b' ? pick(['toR', 'toM']) : opts.dir === 'f' ? pick(['read', 'meaning']) : pick(subs) }; }
  if (t === 'v') { const v = VBY.get(+id); const subs = ['jp', 'es']; if (hasKanji(v.w)) subs.push('read', 'hyoki'); if (opts.typing) subs.push('type'); return { g: 'v', id: +id, sub: opts.dir === 'b' ? (opts.typing && Math.random() < .5 ? 'type' : hasKanji(v.w) && Math.random() < .4 ? 'hyoki' : 'es') : opts.dir === 'f' ? pick(subs.filter(s => s === 'jp' || s === 'read')) : pick(subs) }; }
  if (t === 'g') return { g: 'g', id };
  return null;
}
function buildQ(sp) {
  if (!sp) return null;
  if (sp.g === 'k') return qKanji(KBY.get(sp.id), sp.sub);
  if (sp.g === 'v') return sp.sub === 'audio' ? qAudio(VBY.get(sp.id)) : qVocab(VBY.get(sp.id), sp.sub);
  if (sp.g === 'g') return qGrammar(GBY.get(sp.id));
  if (sp.g === 'c') return qConj(VBY.get(sp.id), sp.f);
  if (sp.g === 'pa') return qParticle(sp.id);
  if (sp.g === 'cn') return qCounter();
  if (sp.g === 'rd') return qReadingQ(READINGS.find(r => r.id === sp.id), sp.q);
}
// selección ponderada: cripta + vencidos + caja baja
function choose(keys, n, opts = {}) {
  if (!keys.length) return [];
  const cr = keys.filter(k => S.crypt[k]), du = keys.filter(k => due(k) && !S.crypt[k]);
  const rest = keys.filter(k => !S.crypt[k] && !due(k)).sort((a, b) => (S.it[a] ? S.it[a].b : 0) - (S.it[b] ? S.it[b].b : 0));
  const out = [];
  const take = (arr, m) => { for (const k of shuffle(arr)) { if (out.length >= n || m <= 0) break; if (!out.includes(k)) { out.push(k); m--; } } };
  take(cr, Math.ceil(n * 0.3)); take(du, Math.ceil(n * 0.45));
  take(rest.slice(0, Math.max(n * 3, 30)), n);
  while (out.length < n) out.push(pick(keys));
  return shuffle(out).map(k => specFor(k, opts));
}
function introducedPool(filter = {}) {
  let keys = S.intro.filter(k => /^[vkg]:/.test(k));
  // gramática: preguntas de puntos presentados
  const pts = new Set(S.intro.filter(k => k.startsWith('p:')).map(k => k.slice(2)));
  const gk = G.filter(g => pts.has(g.pt)).map(g => 'g:' + g.id);
  keys = keys.filter(k => k[0] !== 'g').concat(gk);
  if (filter.only) keys = keys.filter(k => filter.only.includes(k[0]));
  if (filter.pt) keys = keys.filter(k => k[0] !== 'g' || filter.pt.includes(GBY.get(k.slice(2)).pt));
  if (filter.trap) keys = keys.filter(k => k[0] !== 'g' || GBY.get(k.slice(2)).f.includes('T'));
  if (filter.theme) keys = keys.filter(k => k[0] !== 'v' || VBY.get(+k.slice(2)).th === filter.theme);
  if (filter.week) keys = keys.filter(k => k[0] !== 'v' || VBY.get(+k.slice(2)).wk === filter.week);
  if (filter.lv) keys = keys.filter(k => (k[0] === 'v' ? VBY.get(+k.slice(2)).lv : k[0] === 'k' ? KBY.get(k.slice(2)).lv : filter.lv) === filter.lv);
  if (filter.crypt) keys = keys.filter(k => S.crypt[k]).concat(Object.keys(S.crypt).filter(k => /^(c|pa|cn):/.test(k)));
  return keys;
}

// ================= NAVEGACIÓN =================
let TAB = 'hoy';
const stage = () => $('#stage');
function setTab(t) { TAB = t; $$('nav.bottom button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === t ? 'page' : 'false')); render(); }
function render() {
  document.body.classList.remove('inq'); stage().classList.remove('noscroll');
  SND.stop();
  ({ hoy: renderHoy, practicar: renderPracticar, examen: renderExamen, stats: renderStats }[TAB] || renderHoy)();
  stage().scrollTop = 0;
}
function header() {
  const dl = daysLeft(); $('#cdD').textContent = dl >= 0 ? dl + 'd' : '0d';
  const ms = examDate() - Date.now(); const h = Math.max(0, Math.floor((ms % DAY) / 3600000)); $('#cdT').textContent = dl >= 0 ? h + 'h' : '';
}
const SIGIL = `<svg class="arch-orn" viewBox="-40 -24 80 48" aria-hidden="true"><ellipse cx="0" cy="-12" rx="17" ry="5" fill="none" stroke="#ffb8d9" stroke-width="1"/><ellipse cx="0" cy="-12" rx="22" ry="7" fill="none" stroke="#ff5fae" stroke-width=".5" opacity=".6"/><path d="M0 -4 L3 8 L0 22 L-3 8Z" fill="#ff5fae"/><path d="M-3 4 C-14 2 -22 -6 -36 -2 C-24 -1 -16 6 -4 10 M3 4 C14 2 22 -6 36 -2 C24 -1 16 6 4 10" fill="none" stroke="#e9dfe5" stroke-width=".9"/><path d="M-6 12 C-14 14 -18 20 -26 22 M6 12 C14 14 18 20 26 22" fill="none" stroke="#ff5fae" stroke-width=".7"/></svg>`;
const ARCH = `<div class="arch-hd"><svg class="arch-top" viewBox="0 0 400 54" preserveAspectRatio="none" aria-hidden="true"><path class="o" d="M0 54 L0 46 C70 44 120 40 160 22 C178 14 190 8 200 0 C210 8 222 14 240 22 C280 40 330 44 400 46 L400 54 Z"/><path class="i" d="M12 54 C80 50 130 44 168 28 C184 21 194 14 200 9 C206 14 216 21 232 28 C270 44 320 50 388 54"/><path class="s" d="M28 54 C90 52 140 47 174 34 C188 28 196 22 200 18 C204 22 212 28 226 34 C260 47 310 52 372 54"/></svg>${SIGIL}</div>`;
const THORNS = `<svg class="divider" viewBox="0 0 400 28" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g fill="none" stroke-linecap="round"><path d="M10 14 C80 14 120 6 170 12 M390 14 C320 14 280 6 230 12" stroke="#e9dfe5" stroke-width=".8"/><path d="M40 14 C90 18 130 24 176 16 M360 14 C310 18 270 24 224 16" stroke="#ff5fae" stroke-width=".8"/><path d="M60 13 l8 -7 M90 12 l7 -8 M120 10 l6 -8 M150 10 l5 -7 M340 13 l-8 -7 M310 12 l-7 -8 M280 10 l-6 -8 M250 10 l-5 -7" stroke="#e9dfe5" stroke-width=".7"/><path d="M75 17 l6 7 M105 20 l5 6 M135 21 l4 5 M325 17 l-6 7 M295 20 l-5 6 M265 21 l-4 5" stroke="#ff5fae" stroke-width=".7"/></g><g fill="#ff5fae"><path d="M200 2 L208 14 L200 26 L192 14Z"/></g><path d="M200 7 L204 14 L200 21 L196 14Z" fill="#040203"/><g fill="#e9dfe5"><circle cx="184" cy="14" r="1.6"/><circle cx="216" cy="14" r="1.6"/><circle cx="176" cy="14" r="1"/><circle cx="224" cy="14" r="1"/></g></svg>`;
function rankBadge(i) {
  const c = ['#7a6370', '#b9a7b1', '#e9dfe5', '#ffb8d9', '#ff5fae', '#ffffff'][i];
  let w = '';
  for (let j = 0; j <= i; j++) { const y = 26 + j * 4.2, l = 18 - j * 2; w += `<path d="M20 ${y} C${20 - l * .5} ${y - 6} ${20 - l} ${y - 4} ${20 - l - 4} ${y - 9}" stroke="${c}"/><path d="M44 ${y} C${44 + l * .5} ${y - 6} ${44 + l} ${y - 4} ${44 + l + 4} ${y - 9}" stroke="${c}"/>`; }
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="9" rx="11" ry="3.5" fill="none" stroke="${c}" stroke-width="1.2"${i >= 4 ? ' style="filter:drop-shadow(0 0 4px #ff5fae)"' : ''}/><g fill="none" stroke-width="1" stroke-linecap="round">${w}</g><path d="M32 16 L40 32 L32 56 L24 32Z" fill="#0b0609" stroke="${c}" stroke-width="1.2"/><path d="M32 24 L35 32 L32 44 L29 32Z" fill="${i >= 3 ? '#ff5fae' : c}"/></svg>`;
}

// ================= HOY =================
function renderHoy() {
  header();
  const R = readiness(), ri = rankOf(R.pct), P = todayPlan(), dk = dueKeys().length, cr = Object.keys(S.crypt).length;
  const dm = S.days[todayKey()] || {};
  const M = [
    { id: 'warm', t: 'Calentamiento', s: '3 minutos de repaso a contrarreloj', done: dm.warm, go: () => startWarm() },
    { id: 'intro', t: `Iniciación: ${Math.max(0, P.quota - P.done)} nuevos`, s: `Hoy tocan ${P.quota} · ${P.done} presentados`, done: P.done >= P.quota, go: () => startIntro() },
    { id: 'due', t: `Vencidos: ${dk}`, s: 'Repasa todo lo que el SRS pide hoy', done: dk === 0 && S.intro.length > 0, go: () => startReview() },
    { id: 'crypt', t: cr ? `Cripta: libera 3 (${cr} dentro)` : 'Espejo roto: 20 sin fallar', s: cr ? 'Tres aciertos rápidos seguidos por ítem' : 'Un error y se reinicia', done: cr ? (dm.freed || 0) >= 3 : dm.roto, go: () => cr ? startCrypt() : startRoto() },
    { id: 'rec', t: 'Récord 60 s ≥ 90', s: 'Una ronda con puntuación de 90 o más', done: dm.rec90, go: () => startRecord(60) }
  ];
  if (!S.log.length) mirrorAuto();
  stage().innerHTML = `<div class="col">
    <div class="panel"><span class="coord">N4/S${CUR_WEEK} · 35.68N 139.69E</span>
      <div class="lbl">Integridad del sistema</div>
      <div class="integ"><div class="big num">${R.pct.toFixed(1)}%</div><div class="mute mono" style="font-size:12px;padding-bottom:6px">Listo para N4<br>100% = todo dominado</div></div>
      <div class="bar" style="margin-top:8px"><i style="width:${R.pct}%"></i></div>
      <div class="row" style="margin-top:12px;justify-content:space-between">
        <div class="rank" id="rankBox">${rankBadge(ri)}<div><div class="nm" id="rankNm">${RANKS[ri].n}</div><div class="lbl">rango · ${S.xp} XP</div></div></div>
        <div class="mono" style="text-align:right;font-size:12px"><span class="acid num" style="font-size:20px">${S.streak}</span> días de racha<br><span class="mute">${R.km}/${K.length} kanji · ${R.vm}/${V.length} pal. · ${R.gm}/${G.length} gram.</span></div>
      </div>
    </div>
    ${THORNS}
    <div class="arch">${ARCH}<div style="padding:0 14px 14px">
      <h2 class="h-sec" style="text-align:center;margin-bottom:6px">Ritual de hoy</h2>
      ${M.map((m, i) => `<div class="mission ${m.done ? 'done' : ''}"><div class="ck"></div><div class="t"><b>${esc(m.t)}</b><small>${esc(m.s)}</small></div><button class="btn ${i === 1 && !m.done ? 'pri' : ''}" data-m="${i}">${m.done ? 'Otra vez' : 'Ir'}</button></div>`).join('')}
    </div></div>
    ${logHTML()}
    <div class="grid2">
      <button class="btn" id="goLib">Biblioteca</button>
      <button class="btn" id="goCfg">Ajustes</button>
    </div>
    ${!S.diag ? `<button class="btn acidb block" id="goDiag">Diagnóstico inicial (24 preguntas)</button>` : ''}
  </div>`;
  $$('[data-m]').forEach(b => b.onclick = () => M[+b.dataset.m].go());
  $('#goLib').onclick = renderLibrary; $('#goCfg').onclick = renderSettings;
  $('#goDiag') && ($('#goDiag').onclick = startDiag);
  if (ri > (S.rankSeen || 0)) { S.rankSeen = ri; save(); const n = $('#rankNm'); n.classList.add('glitch'); SND.rise(); toast('Nuevo rango: ' + RANKS[ri].n); }
}

// ================= PRACTICAR =================
function renderPracticar() {
  header();
  const ni = n => `<span class="tag mk">${n}</span>`;
  const cnt = p => introducedPool({ only: p }).length;
  const modes = [
    ['intro', 'Iniciación', 'Tarjetas nuevas con truco y audio. Nada se examina sin verlo antes.', ni(pendingIntro().length + ' por ver')],
    ['kanji', 'Kanji', 'Lectura, significado, ida y vuelta, pares confusos.', ni(cnt('k') + ' vistos')],
    ['kwords', 'Palabras del kanji', 'Cada kanji con todas las palabras que lo usan. Sin furigana.', ni(KW.size + ' kanji')],
    ['vocab', 'Vocabulario', 'Por tema, semana o nivel. JP→ES, ES→JP, kana escrita.', ni(cnt('v') + ' vistas')],
    ['cards', 'Tarjetas', 'Desliza: derecha lo sé, izquierda no.', ''],
    ['gram', 'Gramática S2', `${G.length} preguntas de examen, ★ y trampas.`, ni(cnt('g') + ' disponibles')],
    ['conj', 'Conjugador', 'て, た, ない, potencial, pasiva, imperativo… por grupo.', ''],
    ['part', 'Partículas', 'に/が/を/で… las que deciden la frase.', ''],
    ['cont', 'Contadores', '本, 匹, 杯, 人, 日… con sus lecturas raras.', ''],
    ['read', 'Lectura 読解', 'Textos cortos con la gramática de la semana.', ''],
    ['audio', 'Escucha 聴解', 'Voz ja-JP: oye y elige.', ''],
    ['crypt', 'La Cripta', 'Tus errores. Salen con 3 aciertos rápidos seguidos.', ni(Object.keys(S.crypt).length)],
    ['warm', 'Calentamiento', '3 minutos de repaso mixto.', '']
  ];
  stage().innerHTML = `<div class="col"><h1 class="h-title">Practicar</h1><div class="grid2">${modes.map(m => `<button class="mode" data-p="${m[0]}"><span class="mn">${m[1]}</span><span class="md">${m[2]}</span>${m[3]}</button>`).join('')}</div></div>`;
  $$('[data-p]').forEach(b => b.onclick = () => openMode(b.dataset.p));
}
function needIntro(msg) {
  stage().innerHTML = `<div class="col"><div class="panel"><div class="lbl">Bloqueado</div><p>${esc(msg)}</p><button class="btn pri block" id="ni">Ir a Iniciación</button><button class="btn ghost block" id="nb" style="margin-top:8px">Volver</button></div></div>`;
  $('#ni').onclick = startIntro; $('#nb').onclick = render;
}
function chips(name, items, sel) { return `<div class="row" role="group" aria-label="${esc(name)}">${items.map(([v, l]) => `<button class="chip" data-g="${esc(name)}" data-v="${esc(v)}" aria-pressed="${sel.includes(v)}">${esc(l)}</button>`).join('')}</div>`; }
function bindChips(state, multi = {}) {
  $$('.chip[data-g]').forEach(c => c.onclick = () => {
    const g = c.dataset.g, v = c.dataset.v;
    if (multi[g]) { const a = state[g]; const i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); }
    else state[g] = [v];
    $$(`.chip[data-g="${g}"]`).forEach(x => x.setAttribute('aria-pressed', state[g].includes(x.dataset.v)));
  });
}
function openMode(p) {
  const back = `<button class="btn ghost" id="mb">← Volver</button>`;
  if (p === 'intro') return startIntro();
  if (p === 'crypt') return renderCrypt();
  if (p === 'warm') return startWarm();
  if (p === 'cards') return openCards();
  if (p === 'kwords') return openKWords();
  if (p === 'cont') return startSimple('cont', 'Contadores', () => ({ g: 'cn' }), 15, introOnce('cont', countersTable));
  if (p === 'part') return startSimple('part', 'Partículas', () => ({ g: 'pa', id: rnd(PARTICLES.length) }), 15, introOnce('part', particlesTable));
  if (p === 'read') return openReading();
  if (p === 'audio') {
    const pool = introducedPool({ only: 'v' }); if (pool.length < 4) return needIntro('Primero presenta al menos 4 palabras.');
    return startSimple('audio', 'Escucha', () => ({ g: 'v', id: +pick(pool).slice(2), sub: 'audio' }), 12);
  }
  const st = { sub: ['mix'], dir: ['mix'], lv: ['all'], th: ['all'], wk: ['all'], pt: [], trap: ['no'], n: ['15'], forms: ['te', 'ta', 'nai'], grp: ['v1', 'v2', 'v3'], typing: ['no'] };
  let body = '';
  if (p === 'kanji') body = `<div class="lbl">Tipo</div>${chips('sub', [['mix', 'Mixto'], ['read', 'Kanji → lectura'], ['toR', 'Lectura → kanji'], ['meaning', 'Kanji → significado'], ['toM', 'Significado → kanji'], ['pair', 'Pares confusos']], st.sub)}<div class="lbl">Nivel</div>${chips('lv', [['all', 'N5+N4'], ['N5', 'N5'], ['N4', 'N4']], st.lv)}`;
  if (p === 'vocab') body = `<div class="lbl">Dirección</div>${chips('dir', [['mix', 'Mixto'], ['f', 'JP → ES'], ['b', 'ES → JP'], ['read', 'Lectura (漢字読み)'], ['hyoki', 'Kana → kanji (表記)']], st.dir)}<div class="lbl">ES→JP escribiendo kana</div>${chips('typing', [['no', 'No'], ['yes', 'Sí']], st.typing)}<div class="lbl">Semana / nivel</div>${chips('wk', [['all', 'Todo'], ['2', 'Semana 2']], st.wk)}${chips('lv', [['all', 'N5+N4'], ['N5', 'N5'], ['N4', 'N4']], st.lv)}<div class="lbl">Tema</div>${chips('th', [['all', 'Todos'], ...Object.entries(THEMES)], st.th)}`;
  if (p === 'gram') { st.pt = GPTS.slice(); body = `<div class="lbl">Puntos (Semana 2)</div>${chips('pt', GPTS.map(k => [k, PTS[k].name]), st.pt)}<div class="lbl">Solo trampas</div>${chips('trap', [['no', 'No'], ['yes', 'Sí, solo trampas']], st.trap)}`; }
  if (p === 'conj') body = `<div class="lbl">Formas</div>${chips('forms', Object.entries(FORMS), st.forms)}<div class="lbl">Grupos</div>${chips('grp', [['v1', 'G1 五段'], ['v2', 'G2 一段'], ['v3', 'G3 する/来る']], st.grp)}`;
  stage().innerHTML = `<div class="col">${back}<h1 class="h-title">${esc({ kanji: 'Kanji', vocab: 'Vocabulario', gram: 'Gramática S2', conj: 'Conjugador' }[p])}</h1><div class="panel col">${body}<div class="lbl">Preguntas</div>${chips('n', [['10', '10'], ['15', '15'], ['25', '25'], ['40', '40']], st.n)}<button class="btn pri block" id="go">Empezar</button></div></div>`;
  bindChips(st, { pt: 1, forms: 1, grp: 1 });
  $('#mb').onclick = render;
  $('#go').onclick = () => {
    const n = +st.n[0];
    if (p === 'kanji') {
      const pool = introducedPool({ only: 'k', lv: st.lv[0] === 'all' ? null : st.lv[0] });
      if (pool.length < 4) return needIntro('Necesitas al menos 4 kanji presentados.');
      let specs = choose(pool, n); if (st.sub[0] !== 'mix') specs = specs.map(s => ({ ...s, sub: st.sub[0] === 'pair' && !PAIR_OF.has(s.id) ? 'toM' : st.sub[0] }));
      return runSession({ mode: 'kanji', title: 'Kanji', specs });
    }
    if (p === 'vocab') {
      const pool = introducedPool({ only: 'v', lv: st.lv[0] === 'all' ? null : st.lv[0], theme: st.th[0] === 'all' ? null : st.th[0], week: st.wk[0] === 'all' ? null : +st.wk[0] });
      if (pool.length < 4) return needIntro('Necesitas al menos 4 palabras presentadas con ese filtro.');
      const typing = st.typing[0] === 'yes';
      let specs = choose(pool, n, { typing, dir: st.dir[0] === 'f' ? 'f' : st.dir[0] === 'b' ? 'b' : null });
      if (st.dir[0] === 'read' || st.dir[0] === 'hyoki') specs = specs.map(s => ({ ...s, sub: hasKanji(VBY.get(s.id).w) ? st.dir[0] : 'jp' }));
      return runSession({ mode: 'vocab', title: 'Vocabulario', specs });
    }
    if (p === 'gram') {
      const pts = S.intro.filter(k => k.startsWith('p:')).map(k => k.slice(2));
      const sel = st.pt.filter(x => pts.includes(x));
      if (!sel.length) return needIntro('Presenta primero los puntos de gramática (aparecen en Iniciación).');
      const pool = introducedPool({ only: 'g', pt: sel, trap: st.trap[0] === 'yes' });
      if (!pool.length) return needIntro('No hay preguntas con ese filtro todavía.');
      return runSession({ mode: 'gram', title: 'Gramática S2', specs: choose(pool, Math.min(n, pool.length * 2)) });
    }
    if (p === 'conj') {
      const vs = VERBS.filter(v => isIntro('v:' + v.id) && st.grp.includes(v.t));
      if (vs.length < 3) return needIntro('Presenta primero algunos verbos de esos grupos.');
      if (!st.forms.length) return toast('Elige al menos una forma.');
      return runSession({ mode: 'conj', title: 'Conjugador', specs: Array.from({ length: n }, () => ({ g: 'c', id: pick(vs).id, f: pick(st.forms) })) });
    }
  };
}
function introOnce(id, fn) { return S['seen_' + id] ? null : () => { S['seen_' + id] = 1; save(); return fn(); }; }
function countersTable() { return `<div class="tblwrap"><table class="tbl"><tr><th>×</th>${COUNTERS.slice(0, 6).map(c => `<th>${c.c}</th>`).join('')}</tr>${[0, 1, 2, 3, 5, 7, 9].map(i => `<tr><td>${i + 1}</td>${COUNTERS.slice(0, 6).map(c => `<td class="jp" style="font-family:var(--f-jp)">${c.r[i]}</td>`).join('')}</tr>`).join('')}</table></div><p class="mute">Ojo con 1, 3, 6, 8, 10: ahí cambian los sonidos (いっぽん, さんぼん, ろっぽん, はっぽん, じゅっぽん). 人: ひとり, ふたり, よにん. 日: ついたち, ふつか, みっか…</p>`; }
function particlesTable() { return `<div class="col" style="font-size:15px"><p><b class="jp">は</b> tema · <b class="jp">が</b> sujeto / con 好き・わかる・できる・ほしい · <b class="jp">を</b> objeto, recorrer, salir de · <b class="jp">に</b> hora, destino, existencia, de quién recibes / pasiva · <b class="jp">で</b> lugar de acción, medio · <b class="jp">へ</b> dirección · <b class="jp">と</b> con, cita · <b class="jp">から/まで/までに</b> desde / hasta / antes de.</p><p class="acid mono" style="font-size:13px">が → くれる · に → もらう</p></div>`; }

// ================= PALABRAS DEL KANJI =================
function openKWords() {
  const ks = K.filter(k => KW.has(k.k));
  stage().innerHTML = `<div class="col"><button class="btn ghost" id="mb">← Volver</button><h1 class="h-title">Palabras del kanji</h1>
    <p class="mute" style="margin:0">Un kanji, varias palabras y varias lecturas. Toca un kanji para ver todas sus palabras del N5/N4 y practicarlas sin furigana. Rosa = ya presentado.</p>
    <button class="btn pri block" id="kall">Practicar palabras de mis kanji presentados</button>
    ${['N5', 'N4'].map(lv => `<div class="lbl">${lv}</div><div class="kwl">${ks.filter(k => k.lv === lv).map(k => `<button class="${isIntro('k:' + k.k) ? 'seen' : ''}" data-k="${k.k}">${k.k}<small>${KW.get(k.k).length}</small></button>`).join('')}</div>`).join('')}</div>`;
  $('#mb').onclick = render;
  $$('[data-k]').forEach(b => b.onclick = () => openKWord(b.dataset.k));
  $('#kall').onclick = () => {
    const ids = [...new Set(K.filter(k => isIntro('k:' + k.k)).flatMap(k => KW.get(k.k) || []))].filter(id => isIntro('v:' + id));
    if (ids.length < 4) return needIntro('Primero presenta algunos kanji y sus palabras (o abre un kanji y pulsa "Estudiar").');
    runSession({ mode: 'vocab', title: 'Palabras de mis kanji', specs: shuffle(ids).slice(0, 20).map(id => ({ g: 'v', id, sub: hasKanji(VBY.get(id).w) ? pick(['read', 'read', 'hyoki', 'jp']) : 'jp' })) });
  };
}
function openKWord(c) {
  const k = KBY.get(c), ws = (KW.get(c) || []).map(id => VBY.get(id));
  stage().innerHTML = `<div class="col"><button class="btn ghost" id="mb">← Kanji</button>
    <div class="panel"><div class="row" style="align-items:center;gap:16px"><div class="q-big" style="font-size:84px">${esc(c)}</div><div><div class="q-es" style="font-size:22px">${esc(k.es)}</div><div class="mute" style="font-family:var(--f-jp)">${esc(kReading(k))}</div></div></div><div class="tr mute" style="font-size:14px;margin-top:6px">${esc(k.mn)}</div></div>
    <div class="lbl">${ws.length} palabras con ${esc(c)} · toca "ver" para mostrar la lectura</div>
    <div class="wl">${ws.map(v => `<div class="w"><span class="jw">${esc(v.w)}</span><span class="rd" hidden>${esc(v.r)}</span><span class="es">${esc(v.es)}</span><button class="btn ghost" data-show="${v.id}">ver</button><button class="btn ghost" data-say="${v.id}" aria-label="Escuchar">▶</button></div>`).join('')}</div>
    <button class="btn pri block" id="kgo">Estudiar estas ${ws.length} palabras</button></div>`;
  $('#mb').onclick = openKWords;
  $$('[data-show]').forEach(b => b.onclick = () => { const r = b.parentElement.querySelector('.rd'); r.hidden = !r.hidden; b.textContent = r.hidden ? 'ver' : 'ocultar'; });
  $$('[data-say]').forEach(b => b.onclick = () => speak(VBY.get(+b.dataset.say).r));
  $('#kgo').onclick = () => {
    introduce('k:' + c); ws.forEach(v => introduce('v:' + v.id)); save();
    const specs = shuffle(ws.flatMap(v => hasKanji(v.w) ? [{ g: 'v', id: v.id, sub: 'read' }, { g: 'v', id: v.id, sub: pick(['hyoki', 'jp']) }] : [{ g: 'v', id: v.id, sub: 'jp' }]));
    runSession({ mode: 'vocab', title: 'Palabras de ' + c, specs });
  };
}

// ================= INTRODUCCIÓN (INICIACIÓN) =================
function introCardHTML(key) {
  const [t, id] = key.split(/:(.+)/);
  if (t === 'k') {
    const k = KBY.get(id);
    return `<div class="k-big">${esc(k.k)}</div>
      <dl class="kv"><dt>On</dt><dd>${esc(k.onK.join('・') || '—')}</dd><dt>Kun</dt><dd>${esc(k.kun.map(kunFmt).join('・') || '—')}</dd><dt>Significa</dt><dd style="font-family:var(--f-body)">${esc(k.es)}</dd><dt>Nivel</dt><dd class="mono" style="font-size:13px">${k.lv} · ${k.st} trazos ${k.ok ? '' : '<span class="tag warn">revisar: 1 sola lista</span>'}</dd></dl>
      <div class="tr"><b class="acid mono" style="font-size:12px">TRUCO</b> ${esc(k.mn)}</div>
      ${PAIR_OF.has(k.k) ? `<div class="mute" style="font-size:14px">No confundir: ${PAIR_OF.get(k.k).map(p => esc(p[2])).join(' ')}</div>` : ''}
      <div class="lbl">Todas sus palabras (${(KW.get(k.k) || []).length})</div><div>${kWordsHTML(k, 99)}</div>`;
  }
  if (t === 'v') {
    const v = VBY.get(+id);
    return `<div class="q-word" style="text-align:center">${wordRuby(v.w, v.r)}</div><div class="q-es" style="text-align:center">${esc(v.es)}</div>
      <dl class="kv"><dt>Lectura</dt><dd>${esc(v.r)}</dd><dt>Tipo</dt><dd style="font-family:var(--f-body)">${esc(TYPES[v.t] || v.t)}</dd><dt>Tema</dt><dd style="font-family:var(--f-body)">${esc(THEMES[v.th] || '')} ${v.wk === 2 ? '<span class="tag">Semana 2</span>' : ''} <span class="tag">${v.lv === 'S2' ? 'libro' : v.lv}</span> ${v.ok === 0 ? '<span class="tag warn">revisar</span>' : ''}</dd></dl>
      <div class="ex">${ruby(v.ex)}<small>${esc(v.exes)}</small></div>
      ${[...v.w].filter(c => KSET.has(c)).map(c => `<div class="mute" style="font-size:13px"><b class="jp" style="color:var(--chrome)">${c}</b> ${esc(KBY.get(c).es)} · ${esc(KBY.get(c).mn)}</div>`).join('')}`;
  }
  if (t === 'p') {
    const P = PTS[id];
    return `<div class="lbl">Gramática · Semana 2</div><div class="q-word" style="font-size:24px">${esc(P.pat)}</div><div class="h-sec">${esc(P.name)}</div><div style="font-size:16px">${ruby(P.es)}</div>${P.ex.map(e => `<div class="ex">${ruby(e[0])}<small>${esc(e[1])}</small></div>`).join('')}<div class="tr"><b class="acid mono" style="font-size:12px">TRUCO</b> ${ruby(P.tr)}</div><div class="mute" style="font-size:13px">${G.filter(g => g.pt === id).length} preguntas de examen se desbloquean.</div>`;
  }
}
function sayFor(key) { const [t, id] = key.split(/:(.+)/); if (t === 'k') { const k = KBY.get(id); return k.ex.length ? VBY.get(k.ex[0]).r : (k.kun[0] || '').replace(/\..*/, ''); } if (t === 'v') return VBY.get(+id).r; if (t === 'p') return stripFuri(PTS[id].ex[0][0]); }
function startIntro(keys) {
  const batch = keys || pendingIntro().slice(0, 8);
  if (!batch.length) { toast('No queda nada por presentar. Todo el temario está visto.'); return; }
  let i = 0;
  document.body.classList.add('inq'); stage().classList.add('noscroll');
  const show = () => {
    const key = batch[i];
    stage().innerHTML = `<div class="q-wrap intro"><div class="row" style="justify-content:space-between"><span class="lbl">Iniciación · ${i + 1}/${batch.length}</span><button class="btn ghost" id="ix">Salir</button></div>
      <div class="arch" style="flex:1;min-height:0;display:flex;flex-direction:column">${ARCH}<div style="flex:1;min-height:0;overflow:auto;padding:0 16px 16px" class="col">${introCardHTML(key)}</div></div>
      <div class="grid2"><button class="btn" id="isay">▶ Audio</button><button class="btn pri" id="inext">${i < batch.length - 1 ? 'Siguiente' : 'Ponerme a prueba'}</button></div></div>`;
    $('#isay').onclick = () => speak(sayFor(key));
    $('#ix').onclick = () => { render(); };
    $('#inext').onclick = () => { introduce(key); i++; save(); if (i < batch.length) show(); else checkIntro(batch); };
  };
  show();
}
function checkIntro(batch) {
  // comprobación inmediata en ambos sentidos
  const specs = [];
  for (const k of batch) {
    if (k[0] === 'k') { specs.push({ g: 'k', id: k.slice(2), sub: 'meaning' }, { g: 'k', id: k.slice(2), sub: 'toM' }); }
    else if (k[0] === 'v') { specs.push({ g: 'v', id: +k.slice(2), sub: 'jp' }, { g: 'v', id: +k.slice(2), sub: 'es' }); }
    else if (k[0] === 'p') { const gs = shuffle(G.filter(g => g.pt === k.slice(2) && g.k === 'F')).slice(0, 2); gs.forEach(g => specs.push({ g: 'g', id: g.id })); }
  }
  runSession({ mode: 'intro', title: 'Comprobación', specs: shuffle(specs), gentle: 1, after: () => { const P = todayPlan(); if (P.done < P.quota) return 'more'; } });
}

// ================= SESIONES =================
function startReview() { const d = dueKeys(); if (!d.length) { toast('Nada vencido. El SRS está al día.'); return startWarm(); } runSession({ mode: 'review', title: 'Vencidos', specs: shuffle(d).slice(0, 30).map(k => specFor(k)) }); }
function startWarm() { const pool = introducedPool(); if (pool.length < 4) return needIntro('El calentamiento necesita material presentado.'); runSession({ mode: 'warm', title: 'Calentamiento', clock: 180000, gen: () => choose(pool, 1)[0], gentle: 1 }); }
function startCrypt() { const pool = introducedPool({ crypt: 1 }); if (!pool.length) { toast('La cripta está vacía.'); return; } runSession({ mode: 'crypt', title: 'La Cripta', specs: shuffle(pool.concat(pool, pool)).slice(0, Math.min(30, pool.length * 3)).map(k => k[0] === 'c' ? { g: 'c', id: +k.split(':')[1], f: k.split(':')[2] } : k[0] === 'p' && k.startsWith('pa:') ? { g: 'pa', id: +k.split(':')[1] } : k.startsWith('cn:') ? { g: 'cn' } : specFor(k)) }); }
function startRecord(sec) {
  const pool = introducedPool(); if (pool.length < 8) return needIntro('Las rondas de récord necesitan al menos 8 ítems presentados.');
  if (sec === 60) return runSession({ mode: 'r60', title: 'Récord 60 s', clock: 60000, gen: () => choose(pool, 1)[0], record: 1 });
  const specs = choose(pool, sec);
  runSession({ mode: 'r' + sec, title: `Récord ${sec} preguntas`, specs, clock: sec * limitMs(), record: 1 });
}
function startRoto() { const pool = introducedPool(); if (pool.length < 8) return needIntro('Espejo roto necesita al menos 8 ítems presentados.'); runSession({ mode: 'roto', title: 'Espejo roto', specs: choose(pool, 20), breakOnError: 1, record: 1 }); }
function startGhost() {
  if (!S.ghost) return toast('Juega primero un Récord de 10 preguntas: esa será tu sombra.');
  runSession({ mode: 'ghost', title: 'Tu reflejo', specs: S.ghost.specs, clock: 10 * limitMs(), ghost: S.ghost, record: 1 });
}
function startSimple(mode, title, gen, n, introFn) {
  if (introFn) { stage().innerHTML = `<div class="col"><h1 class="h-title">${esc(title)}</h1><div class="panel">${introFn()}</div><button class="btn pri block" id="go">Empezar</button></div>`; $('#go').onclick = () => startSimple(mode, title, gen, n); return; }
  runSession({ mode, title, specs: Array.from({ length: n }, gen) });
}
function openReading() {
  stage().innerHTML = `<div class="col"><button class="btn ghost" id="mb">← Volver</button><h1 class="h-title">Lectura 読解</h1>${READINGS.map((r, i) => `<button class="mode" data-r="${i}"><span class="mn jp" style="font-family:var(--f-jp)">${esc(r.title)}</span><span class="md">Día ${r.day} · ${r.qs.length} preguntas · ${esc(PTS[WEEKS[2].days[r.day - 1].pts[0]].name)}…</span></button>`).join('')}</div>`;
  $('#mb').onclick = render;
  $$('[data-r]').forEach(b => b.onclick = () => { const r = READINGS[+b.dataset.r]; runSession({ mode: 'read', title: r.title, specs: r.qs.map((_, qi) => ({ g: 'rd', id: r.id, q: qi })), perQ: 60000 }); });
}

// ================= MOTOR DE RONDA =================
let SES = null;
function roseSVG() {
  let s = '<svg class="rose" viewBox="-50 -50 100 100" aria-hidden="true"><circle r="48" fill="#070305" stroke="#3a2631"/><circle r="44" fill="none" stroke="#e9dfe5" stroke-width=".4" opacity=".5"/>';
  for (let i = 0; i < 12; i++) { const a = i * 30; s += `<g transform="rotate(${a})"><path class="pt" data-i="${i}" d="M0 -11 C6 -22 4 -32 0 -45 C-4 -32 -6 -22 0 -11Z" fill="${i % 2 ? '#ff5fae' : '#ffb8d9'}" stroke="#fff" stroke-width=".5" opacity=".95"/><path d="M0 -30 l4 -5 M0 -30 l-4 -5" stroke="#e9dfe5" stroke-width=".5" fill="none"/></g>`; }
  s += '<circle r="10" fill="#0b0609" stroke="#e9dfe5" stroke-width=".8"/><path d="M0 -6 L4 0 L0 6 L-4 0Z" fill="#ff5fae"/></svg>';
  return s;
}
function setRose(frac) { $$('.rose .pt').forEach(p => p.setAttribute('opacity', +p.dataset.i < Math.ceil(frac * 12) ? '.9' : '.08')); }
function crack(card) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'crack'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none');
  const cx = 30 + Math.random() * 40, cy = 25 + Math.random() * 30; let d = '';
  for (let b = 0; b < 6; b++) { let x = cx, y = cy; const ang = b * Math.PI / 3 + Math.random() * .6; d += `M${x} ${y}`; for (let s = 0; s < 5; s++) { x += Math.cos(ang + (Math.random() - .5)) * (6 + Math.random() * 8); y += Math.sin(ang + (Math.random() - .5)) * (6 + Math.random() * 8); d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; } }
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); p.setAttribute('vector-effect', 'non-scaling-stroke'); svg.appendChild(p); card.appendChild(svg);
}
function hitFx() { const f = $('#flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); if (!reduceMotion()) { document.body.classList.add('ab'); setTimeout(() => document.body.classList.remove('ab'), 200); } }
function runSession(cfg) {
  touchActivity();
  SES = { cfg, i: 0, ok: 0, bad: 0, streak: 0, best: 0, pts: 0, times: [], specs: [], log: [], startT: performance.now(), clock: cfg.clock || null, clockLeft: cfg.clock || null, paused: false, done: false, slow: 0, broke: 0, causes: {} };
  document.body.classList.add('inq'); stage().classList.add('noscroll');
  SND.start();
  nextQ();
}
function total() { return SES.cfg.specs ? SES.cfg.specs.length : null; }
function nextQ() {
  const c = SES.cfg;
  if (SES.clock && SES.clockLeft <= 0) return endSession();
  if (c.specs && SES.i >= c.specs.length) return endSession();
  const sp = c.specs ? c.specs[SES.i] : c.gen();
  let q; try { q = buildQ(sp); } catch (e) { q = null; }
  if (!q) { SES.i++; return nextQ(); }
  SES.q = q; SES.sp = sp; SES.answered = false;
  const tot = total();
  stage().innerHTML = `<div class="q-wrap">
    <div class="q-hud">${roseSVG()}<div class="meta">
      <div class="l1"><span>${esc(c.title)} · ${tot ? (SES.i + 1) + '/' + tot : '#' + (SES.i + 1)}</span><span class="combo num" id="combo">${SES.streak >= 3 ? '×' + mult().toFixed(1) : ''}</span></div>
      <div class="tbar"><i id="tb"></i></div>
      <div class="l1"><span class="clock num" id="clk"></span><span class="num">${SES.ok}✓ ${SES.bad}✗ · ${SES.pts} pts</span></div>
      ${c.ghost ? `<div class="ghostbar" title="Tu fantasma"><i id="gh"></i><b style="width:${(SES.i / 10) * 100}%"></b></div>` : ''}
    </div><button class="icon-btn" id="pz" aria-label="Pausa"><svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg></button></div>
    <div class="q-card arch">${ARCH}<div class="body"><div class="q-kind">${esc(q.kind)}</div>${q.prompt}
      <button class="btn ghost" data-act="say" style="min-height:36px;padding:4px 10px;font-size:12px" aria-label="Escuchar">▶ voz</button></div></div>
    ${q.type ? `<div class="typein"><input id="ti" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="romaji o kana · Enter" aria-label="Respuesta en kana"><div class="kana" id="tk"></div><button class="btn pri" id="tok">Comprobar</button></div>`
      : `<div class="opts ${q.opts.some(o => o.h.length > 28) ? 'one' : ''}">${q.opts.map((o, i) => `<button class="opt ${o.cls || ''}" data-i="${i}"><span class="k">${i + 1}</span>${o.h}</button>`).join('')}</div>`}
    <div id="fbx"></div></div>`;
  if (q.nofuri) $$('.q-card rt').forEach(r => r.remove());
  $$('[data-act="say"]').forEach(b => b.onclick = () => speak(q.say));
  $('#pz').onclick = pauseSes;
  if (q.type) {
    const ti = $('#ti'); ti.focus();
    ti.oninput = () => { $('#tk').textContent = romaToKana(ti.value); };
    ti.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('#tok').click(); } };
    $('#tok').onclick = () => { const v = normKana(romaToKana(ti.value)); answer(q.answers.includes(v) ? 0 : -1, v); };
  } else $$('.opt').forEach(b => b.onclick = () => answer(+b.dataset.i));
  if (q.audioOnly) setTimeout(() => speak(q.say), 250);
  SES.qStart = performance.now(); SES.qLimit = c.perQ || limitMs();
  loop();
}
function mult() { return 1 + Math.min(3, Math.floor(SES.streak / 3) * 0.5); }
function loop() {
  cancelAnimationFrame(SES.raf);
  let last = performance.now();
  const f = now => {
    if (!SES || SES.done) return;
    const dt = now - last; last = now;
    if (!SES.paused && !SES.answered) {
      const el = now - SES.qStart;
      let frac;
      if (SES.clock) {
        SES.clockLeft -= dt; frac = clamp(SES.clockLeft / SES.clock, 0, 1);
        const c = $('#clk'); if (c) { c.textContent = fmtTime(SES.clockLeft); c.classList.toggle('hot', SES.clockLeft < 10000); }
        SND.setTension(SES.clockLeft < 10000 ? 1 : SES.clockLeft < 20000 ? 0.5 : 0.15);
        if (SES.clockLeft <= 0) { SES.answered = true; return endSession(); }
      } else {
        frac = clamp(1 - el / SES.qLimit, 0, 1);
        const c = $('#clk'); if (c) { c.textContent = ((SES.qLimit - el) / 1000).toFixed(1) + ' s'; c.classList.toggle('hot', frac < 0.3); }
        SND.setTension(frac < 0.3 ? 1 : frac < 0.6 ? 0.45 : 0.1);
        if (el >= SES.qLimit) { answer(-2); }
      }
      const tb = $('#tb'); if (tb) tb.style.transform = `scaleX(${frac})`;
      setRose(frac);
      if (SES.cfg.ghost) { const g = SES.cfg.ghost; const tt = SES.cfg.clock - SES.clockLeft; let k = 0, acc = 0; for (const x of g.times) { acc += x; if (acc <= tt) k++; } const gh = $('#gh'); if (gh) gh.style.width = (k / 10 * 100) + '%'; }
    }
    SES.raf = requestAnimationFrame(f);
  };
  SES.raf = requestAnimationFrame(f);
}
function pauseSes() {
  SES.paused = true; SND.stop();
  const ov = document.createElement('div'); ov.className = 'pause-ov';
  ov.innerHTML = `<div class="h-sec">Pausa</div><div class="lbl">el reloj está detenido</div><button class="btn pri" id="pr">Continuar</button><button class="btn ghost" id="pq">Abandonar ronda</button>`;
  $('.q-wrap').appendChild(ov);
  const pausedAt = performance.now();
  $('#pr').onclick = () => { SES.qStart += performance.now() - pausedAt; SES.paused = false; ov.remove(); SND.start(); loop(); };
  $('#pq').onclick = () => { SES.done = true; cancelAnimationFrame(SES.raf); save(); render(); };
}
function answer(i, typed) {
  if (SES.answered) return; SES.answered = true; touchActivity();
  const q = SES.q, c = SES.cfg;
  const ms = Math.round(performance.now() - SES.qStart);
  const timeout = i === -2;
  const ok = !timeout && (q.type ? i === 0 : i === q.ans);
  const cause = timeout ? 'tiempo' : q.cause;
  let fast = false;
  if (!c.noGrade) fast = grade(q.key, q.dir, ok, ms, cause); else fast = ok && ms <= fastMs();
  // estadísticas por modo
  const A = S.acc[q.mode] || (S.acc[q.mode] = { q: 0, ok: 0 }); A.q++; if (ok) A.ok++;
  SES.times.push(ms); SES.specs.push(SES.sp); SES.log.push({ k: q.key, ok, ms, cause });
  if (ok) { SES.ok++; SES.streak++; SES.best = Math.max(SES.best, SES.streak); SES.pts += Math.round((fast ? 100 : 60) * mult()); if (!fast) SES.slow++; SND.bell(); }
  else {
    if (SES.streak >= 5) SES.broke = SES.streak; SES.bad++; SES.streak = 0; SES.causes[cause] = (SES.causes[cause] || 0) + 1; SND.glass(); hitFx(); crack($('.q-card'));
    if (SES.clock && c.record) SES.clockLeft -= 3000; // cada error resta 3 s
  }
  $('.q-wrap').classList.add('revealed');
  // marcar opciones
  if (!q.type) $$('.opt').forEach((b, j) => { b.disabled = true; if (j === q.ans) b.classList.add('ok'); else if (j === i) b.classList.add('bad'); });
  const verdict = ok ? (fast ? 'CORRECTO · ' + (ms / 1000).toFixed(1) + ' s' : 'CORRECTO PERO LENTO · ' + (ms / 1000).toFixed(1) + ' s') : timeout ? 'TIEMPO AGOTADO' : 'ERROR' + (typed != null ? ' · escribiste ' + typed : '');
  const autoNext = ok && (c.record || c.clock) && !c.gentle;
  $('#fbx').innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}"><div class="v ${ok ? 'acid' : 'red'}">${esc(verdict)}${SES.cfg.clock && !ok && c.record ? ' · −3 s' : ''}</div>${ok && autoNext ? '' : q.fb}${autoNext ? '' : `<button class="btn ${ok ? '' : 'pri'} block" id="nx">Siguiente (Enter)</button>`}</div>`;
  
  const go = () => { if (SES.done) return; SES.i++; if (!ok && c.breakOnError) return endSession(true); nextQ(); };
  if (autoNext) setTimeout(go, 450); else { $('#nx').onclick = go; $('#nx').focus({ preventScroll: true }); }
  save();
}
document.addEventListener('keydown', e => {
  if (!SES || SES.done || !document.body.classList.contains('inq')) return;
  if (e.target && e.target.id === 'ti') return;
  if (!SES.answered && /^[1-4]$/.test(e.key)) { const b = $$('.opt')[+e.key - 1]; if (b) b.click(); }
  else if (SES.answered && e.key === 'Enter') { const n = $('#nx'); if (n) { e.preventDefault(); n.click(); } }
  else if (e.key === 'p' || e.key === 'P') { if (!SES.paused) pauseSes(); }
});
function score0to100(ok, n, avgMs) { if (!n) return 0; const acc = ok / n; const sp = clamp(1 - avgMs / limitMs(), 0, 1); let s = Math.round(acc * 85 + sp * 15); if (ok < n) s = Math.min(s, 99); return s; }
function endSession(broken) {
  if (!SES || SES.done) return; SES.done = true; cancelAnimationFrame(SES.raf); SND.stop();
  const c = SES.cfg, n = SES.ok + SES.bad, avg = n ? SES.times.reduce((a, b) => a + b, 0) / n : 0;
  const sc = score0to100(SES.ok, n, avg), ms = Math.round(performance.now() - SES.startT);
  const tk = todayKey(); const dm = S.days[tk] || (S.days[tk] = {});
  if (c.mode === 'warm') dm.warm = 1;
  if (c.mode === 'r60' && sc >= 90) dm.rec90 = 1;
  if (c.mode === 'roto' && !broken && SES.bad === 0) dm.roto = 1;
  if (c.mode === 'crypt') dm.freed = (dm.freed || 0) + SES.log.filter(l => l.ok && !S.crypt[l.k]).length;
  // racha diaria
  if (S.lastDay !== tk) { const y = todayKey(new Date(Date.now() - DAY)); S.streak = S.lastDay === y ? S.streak + 1 : 1; S.lastDay = tk; }
  const h = S.hist[tk] || (S.hist[tk] = { r: 0, q: 0, ok: 0, ms: 0 }); h.ms += ms;
  const R = readiness(); h.r = R.pct; h.cm = catMastery();
  // récords
  let newRec = false, prev = null;
  if (c.record || ['kanji', 'vocab', 'gram', 'conj', 'warm'].includes(c.mode)) {
    const L = S.rec[c.mode] || (S.rec[c.mode] = []);
    prev = L[0] || null;
    const entry = { s: sc, pts: SES.pts, ms, n, ok: SES.ok, d: Date.now(), rank: RANKS[rankOf(R.pct)].n, best: SES.best };
    L.push(entry); L.sort((a, b) => c.mode === 'r60' ? b.pts - a.pts : (b.s - a.s) || (a.ms - b.ms)); S.rec[c.mode] = L.slice(0, 10);
    newRec = L[0] === entry && !!prev;
    if (c.mode === 'r10' && !broken && (!S.ghost || sc > S.ghost.s || (sc === S.ghost.s && ms < S.ghost.ms))) S.ghost = { specs: SES.specs.slice(0, 10), times: SES.times.slice(0, 10), ms, s: sc };
    if (c.mode === 'ghost' && S.ghost && (sc > S.ghost.s || (sc === S.ghost.s && ms < S.ghost.ms))) S.ghost = { specs: SES.specs, times: SES.times, ms, s: sc };
  }
  // frase del espejo según datos reales
  let line;
  const worst = SES.log.filter(l => !l.ok).map(l => l.k).find(k => S.crypt[k] && S.crypt[k].n >= 2);
  if (broken) line = mirror('roto', { n: SES.i });
  else if (newRec) line = mirror('record', { n: c.mode === 'r60' ? SES.pts : sc });
  else if (worst) line = mirror('repetido', { item: keyLabel(worst), n: S.crypt[worst].n });
  else if (n && SES.ok === n) line = SES.slow > n / 3 ? mirror('lento', { t: (avg / 1000).toFixed(1) }) : mirror('perfecto');
  else if (n && SES.ok / n >= 0.95) line = mirror('casi', { pct: Math.round(SES.ok / n * 100) });
  else if (SES.broke) line = mirror('racha', { s: SES.broke });
  else if (SES.bad) line = mirror('errores', { n: SES.bad });
  else line = mirror('examen', { d: daysLeft() });
  if (activeMs() > 90 * 60000 || (new Date().getHours() >= 1 && new Date().getHours() < 5)) mirror('madrugada');
  save(true);
  const more = c.after ? c.after() : null;
  const causeTxt = Object.entries(SES.causes).map(([k, v]) => `${k} ×${v}`).join(' · ');
  stage().innerHTML = `<div class="col" style="overflow:auto">
    <div class="lbl">${esc(c.title)} · fin de ronda</div>
    <div class="panel"><div class="integ"><div class="big num" style="color:${sc === 100 ? 'var(--acid)' : sc >= 90 ? '#f0cf8a' : 'var(--blood-hi)'}">${sc}</div><div class="mono mute" style="font-size:12px;padding-bottom:6px">puntuación /100<br>${SES.ok}/${n} · ${(avg / 1000).toFixed(1)} s media · ${SES.pts} pts · combo máx ${SES.best}</div></div>
    ${prev ? `<div class="mono" style="font-size:12px;margin-top:6px">Tu récord anterior: <span class="uv">${c.mode === 'r60' ? prev.pts + ' pts' : prev.s}</span> ${newRec ? '<span class="acid">· SUPERADO</span>' : ''}</div>` : ''}
    ${broken ? '<div class="red mono" style="margin-top:6px">ESPEJO ROTO en la pregunta ' + SES.i + '</div>' : ''}
    ${causeTxt ? `<div class="mono mute" style="font-size:12px;margin-top:6px">Causas: ${esc(causeTxt)}</div>` : ''}</div>
    ${logHTML()}
    ${SES.log.filter(l => !l.ok).length ? `<div class="panel"><div class="lbl">A la cripta</div>${[...new Set(SES.log.filter(l => !l.ok).map(l => l.k))].map(k => `<span class="chip" style="margin:3px">${esc(keyLabel(k))}</span>`).join('')}</div>` : ''}
    <div class="grid2"><button class="btn pri" id="again">${more === 'more' ? 'Siguientes nuevos' : 'Repetir'}</button><button class="btn" id="home">Volver</button></div></div>`;
  $('#again').onclick = () => more === 'more' ? startIntro() : (c.mode === 'intro' ? startIntro() : runSession(Object.assign({}, c, c.specs && !c.ghost ? { specs: c.mode === 'roto' || c.mode.startsWith('r') ? choose(introducedPool(), c.specs.length) : shuffle(c.specs) } : {})));
  $('#home').onclick = () => { document.body.classList.remove('inq'); render(); };
  stage().classList.remove('noscroll');
}
function catMastery() {
  const f = (arr, key) => arr.length ? arr.filter(x => mastered(key(x))).length / arr.length : 0;
  const o = { kN5: f(K.filter(k => k.lv === 'N5'), k => 'k:' + k.k), kN4: f(K.filter(k => k.lv === 'N4'), k => 'k:' + k.k), vS2: f(V.filter(v => v.wk === 2), v => 'v:' + v.id), vN5: f(V.filter(v => v.lv === 'N5'), v => 'v:' + v.id), vN4: f(V.filter(v => v.lv === 'N4'), v => 'v:' + v.id) };
  for (const p of GPTS) o['g_' + p] = f(G.filter(g => g.pt === p), g => 'g:' + g.id);
  return o;
}

// ================= TARJETAS DESLIZABLES =================
function openCards() {
  const st = { th: ['all'], wk: ['all'], lv: ['all'] };
  stage().innerHTML = `<div class="col"><button class="btn ghost" id="mb">← Volver</button><h1 class="h-title">Tarjetas</h1><div class="panel col"><div class="lbl">Semana / nivel</div>${chips('wk', [['all', 'Todo'], ['2', 'Semana 2']], st.wk)}${chips('lv', [['all', 'N5+N4'], ['N5', 'N5'], ['N4', 'N4']], st.lv)}<div class="lbl">Tema</div>${chips('th', [['all', 'Todos'], ...Object.entries(THEMES)], st.th)}<button class="btn pri block" id="go">Empezar</button></div></div>`;
  bindChips(st); $('#mb').onclick = render;
  $('#go').onclick = () => {
    const pool = introducedPool({ only: 'v', theme: st.th[0] === 'all' ? null : st.th[0], week: st.wk[0] === 'all' ? null : +st.wk[0], lv: st.lv[0] === 'all' ? null : st.lv[0] });
    if (!pool.length) return needIntro('No hay palabras presentadas con ese filtro.');
    const deck = shuffle(pool).slice(0, 30); let i = 0, flipped = false, t0 = 0, okN = 0;
    document.body.classList.add('inq'); stage().classList.add('noscroll');
    const show = () => {
      if (i >= deck.length) { mirror(okN === deck.length ? 'perfecto' : 'errores', { n: deck.length - okN }); save(); document.body.classList.remove('inq'); return render(); }
      const v = VBY.get(+deck[i].slice(2)); flipped = false; t0 = performance.now();
      stage().innerHTML = `<div class="q-wrap"><div class="row" style="justify-content:space-between"><span class="lbl">Tarjetas · ${i + 1}/${deck.length}</span><button class="btn ghost" id="cx">Salir</button></div>
        <div class="fc" id="fc"><div class="card arch" id="card">${ARCH}<div class="col" style="padding:0 16px 18px;align-items:center;text-align:center" id="cf"><div class="q-word" style="font-size:44px">${esc(v.w)}</div><div class="lbl">toca para girar</div></div></div></div>
        <div class="grid2"><button class="btn" id="cn">← No lo sé</button><button class="btn acidb" id="cy">Lo sé →</button></div></div>`;
      const card = $('#card');
      const flip = () => { if (flipped) return; flipped = true; $('#cf').innerHTML = `<div class="q-word" style="font-size:40px">${wordRuby(v.w, v.r)}</div><div class="q-es">${esc(v.es)}</div><div class="ex">${ruby(v.ex)}<small>${esc(v.exes)}</small></div>`; speak(v.r); };
      card.onclick = flip;
      const res = ok => { const ms = performance.now() - t0; grade('v:' + v.id, 'f', ok, flipped ? ms : ms, 'significado'); if (ok) okN++; (ok ? SND.bell : SND.glass)(); card.classList.add(ok ? 'r' : 'l'); setTimeout(() => { i++; show(); }, 160); save(); };
      $('#cy').onclick = () => res(true); $('#cn').onclick = () => res(false); $('#cx').onclick = () => { document.body.classList.remove('inq'); render(); };
      let sx = null; const fc = $('#fc');
      fc.ontouchstart = e => { sx = e.touches[0].clientX; };
      fc.ontouchend = e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 60) res(dx > 0); };
    };
    show();
  };
}

// ================= CRIPTA =================
function renderCrypt() {
  const entries = Object.entries(S.crypt).sort((a, b) => b[1].n - a[1].n);
  const causes = {}; entries.forEach(([k, c]) => Object.entries(c.c).forEach(([x, n]) => causes[x] = (causes[x] || 0) + n));
  const tot = Object.values(causes).reduce((a, b) => a + b, 0) || 1;
  const top = Object.entries(causes).sort((a, b) => b[1] - a[1])[0];
  const byPt = {}; entries.filter(([k]) => k[0] === 'g').forEach(([k, c]) => { const pt = GBY.get(k.slice(2)).pt; byPt[pt] = (byPt[pt] || 0) + c.n; });
  const ptTop = Object.entries(byPt).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const diag = !entries.length ? 'La cripta está vacía. Sin patrón que diagnosticar todavía.' :
    `Tu patrón: ${Math.round(top[1] / tot * 100)}% de tus fallos son de <b>${esc(top[0])}</b>.` + (ptTop.length ? ` Puntos que más se rompen: ${ptTop.map(([p, n]) => `<b>${esc(PTS[p].name)}</b> (×${n})`).join(', ')}.` : '') + (causes.tiempo ? ` ${causes.tiempo} fallos fueron por tiempo: sabes, pero tarde.` : '');
  stage().innerHTML = `<div class="col"><button class="btn ghost" id="mb">← Volver</button><h1 class="h-title">La Cripta</h1>
    <div class="panel"><div class="lbl">Diagnóstico</div><p style="margin:.4em 0 0">${diag}</p>
    <div class="row" style="margin-top:8px">${['lectura', 'significado', 'gramática', 'tiempo'].map(c => `<span class="tag">${c} ${Math.round((causes[c] || 0) / tot * 100)}%</span>`).join('')}</div>
    <div class="mono mute" style="font-size:12px;margin-top:8px">${entries.length} dentro · ${S.freed} liberados. Salen con 3 aciertos rápidos seguidos (≤ ${(fastMs() / 1000).toFixed(1)} s).</div></div>
    <button class="btn pri block" id="cg" ${entries.length ? '' : 'disabled'}>Entrar en la cripta</button>
    <div class="panel"><div class="tblwrap"><table class="tbl"><tr><th>Ítem</th><th>Fallos</th><th>Causa</th><th>Liberación</th></tr>${entries.slice(0, 60).map(([k, c]) => `<tr><td style="font-family:var(--f-jp)">${esc(keyLabel(k))}</td><td>${c.n}</td><td>${esc(Object.entries(c.c).sort((a, b) => b[1] - a[1])[0][0])}</td><td>${'■'.repeat(c.cs)}${'□'.repeat(3 - c.cs)}</td></tr>`).join('')}</table></div></div></div>`;
  $('#mb').onclick = render; $('#cg').onclick = startCrypt;
}

// ================= EXAMEN =================
function weekReady() {
  const keys = G.map(g => 'g:' + g.id).concat(V.filter(v => v.wk === 2).map(v => 'v:' + v.id));
  return keys.filter(mastered).length / keys.length * 100;
}
function renderExamen() {
  header();
  const wr = weekReady(), gu = S.guard[CUR_WEEK] || {};
  const lf = S.finals[S.finals.length - 1];
  const items = [
    ['r60', 'Récord 60 s', 'Contrarreloj. Cada error −3 s. Combo ×3.5.', () => startRecord(60)],
    ['r10', 'Récord 10', '10 preguntas, reloj compartido. Define tu fantasma.', () => startRecord(10)],
    ['r20', 'Récord 20', '20 preguntas, reloj compartido.', () => startRecord(20)],
    ['ghost', 'Tu reflejo', S.ghost ? `Repite tu mejor ronda (${S.ghost.s}, ${fmtTime(S.ghost.ms)}) contra tu fantasma.` : 'Aparece tras tu primer Récord 10.', startGhost],
    ['roto', 'Espejo roto', '20 preguntas. Un error y se rompe.', startRoto],
    ['guard', 'El Guardián', gu.dom ? 'Semana 2 DOMINADA.' : wr >= 95 ? 'Desbloqueado. Dominado solo con 100%.' : `Se desbloquea con 95% de la Semana 2 dominada (ahora ${wr.toFixed(1)}%).`, startGuard, wr < 95],
    ['final', 'La Prueba Final · JLPT N4', lf ? `Último simulacro: ${lf.tot}/180 · ${lf.pass ? '合格' : '不合格'} · ${lf.pct}%.` : 'Formato oficial: 文字・語彙 25 min · 文法・読解 55 min · 聴解 35 min.', openFinal],
    ['diag', 'Diagnóstico', S.diag ? `Hecho: ${Math.round(S.diag.acc * 100)}%. Repetir recalibra.` : 'Calibra tu punto de partida.', startDiag]
  ];
  stage().innerHTML = `<div class="col"><h1 class="h-title">Examen</h1><div class="grid2">${items.map((m, i) => `<button class="mode ${m[4] ? 'locked' : ''}" data-x="${i}" ${m[4] ? 'aria-disabled="true"' : ''}><span class="mn">${m[1]}</span><span class="md">${esc(m[2])}</span>${S.rec[m[0]] && S.rec[m[0]][0] ? `<span class="tag mk">${m[0] === 'r60' ? S.rec[m[0]][0].pts + ' pts' : S.rec[m[0]][0].s}</span>` : ''}${m[4] ? '<span class="tag mk">bloqueado</span>' : ''}</button>`).join('')}</div>${logHTML()}</div>`;
  $$('[data-x]').forEach(b => b.onclick = () => { const m = items[+b.dataset.x]; if (m[4]) return toast('Bloqueado: domina el 95% de la Semana 2.'); m[3](); });
}
function startGuard() {
  const keys = G.map(g => 'g:' + g.id).concat(V.filter(v => v.wk === 2).map(v => 'v:' + v.id)).filter(isIntro);
  const specs = shuffle(keys).slice(0, 30).map(k => specFor(k));
  runSession({ mode: 'guard', title: 'El Guardián', specs, clock: 30 * limitMs(), record: 1, after: () => { const L = SES; const g = S.guard[CUR_WEEK] || (S.guard[CUR_WEEK] = {}); const pct = Math.round(L.ok / (L.ok + L.bad) * 100); g.best = Math.max(g.best || 0, pct); if (pct === 100) { g.dom = 1; toast('Semana 2 DOMINADA.'); } save(); } });
}
function startDiag() {
  const specs = [
    ...shuffle(K.filter(k => k.lv === 'N5')).slice(0, 8).map(k => ({ g: 'k', id: k.k, sub: 'meaning' })),
    ...shuffle(V.filter(v => v.lv === 'N5')).slice(0, 4).map(v => ({ g: 'v', id: v.id, sub: 'jp' })),
    ...shuffle(V.filter(v => v.lv === 'N4')).slice(0, 4).map(v => ({ g: 'v', id: v.id, sub: 'jp' })),
    ...shuffle(G.filter(g => g.k === 'F')).slice(0, 8).map(g => ({ g: 'g', id: g.id }))];
  runSession({ mode: 'diag', title: 'Diagnóstico', specs: shuffle(specs), noGrade: 1, after: () => {
    const L = SES.log; const ok = L.filter(l => l.ok).length; S.diag = { acc: ok / L.length, d: Date.now() };
    // lo que ya sabes rápido entra en caja 2 (presentado); el resto se enseña en Iniciación
    L.filter(l => l.ok && l.ms <= fastMs() && /^[vk]:/.test(l.k)).forEach(l => { introduce(l.k); const r = rec(l.k); r.b = 2; r.d = Date.now() + DAY; });
    if (S.plan) delete S.plan[todayKey()];
    save();
  } });
}

// ================= STATS =================
function renderStats() {
  header();
  const R = readiness(), ri = rankOf(R.pct);
  const modes = { r60: 'Récord 60 s', r10: 'Récord 10', r20: 'Récord 20', roto: 'Espejo roto', ghost: 'Tu reflejo', guard: 'Guardián', kanji: 'Kanji', vocab: 'Vocabulario', gram: 'Gramática', conj: 'Conjugador', warm: 'Calentamiento' };
  const sel = renderStats.sel || 'r60';
  const L = S.rec[sel] || [];
  stage().innerHTML = `<div class="col"><h1 class="h-title">Cámara de récords</h1>
    <div class="panel"><div class="rank">${rankBadge(ri)}<div><div class="nm">${RANKS[ri].n}</div><div class="lbl">Integridad ${R.pct.toFixed(1)}% · ${S.xp} XP · racha ${S.streak}</div></div></div></div>
    <div class="row" style="gap:6px">${Object.entries(modes).map(([k, l]) => `<button class="chip" data-sm="${k}" aria-pressed="${k === sel}">${l}</button>`).join('')}</div>
    <div class="panel tblwrap"><table class="tbl"><tr><th>#</th><th>${sel === 'r60' ? 'Pts' : 'Punt.'}</th><th>Tiempo</th><th>Aciertos</th><th>Fecha</th><th>Rango</th></tr>
    ${L.length ? L.map((e, i) => `<tr class="${i === 0 ? 'me' : ''}"><td>${i + 1}</td><td>${sel === 'r60' ? e.pts : e.s}</td><td>${fmtTime(e.ms)}</td><td>${e.ok}/${e.n}</td><td>${new Date(e.d).toLocaleDateString('es')}</td><td>${esc(e.rank)}</td></tr>`).join('') : `<tr><td colspan="6" class="mute">Sin rondas en este modo todavía.</td></tr>`}</table>
    ${L.length > 1 ? `<div class="mono mute" style="font-size:12px;margin-top:6px">Tu récord vs el anterior: ${sel === 'r60' ? L[0].pts + ' vs ' + L[1].pts : L[0].s + ' vs ' + L[1].s}</div>` : ''}</div>
    <h2 class="h-sec">Listo para N4 por día</h2><div class="panel chart">${chartSVG()}</div>
    ${logHTML([mirrorAuto()])}
    <h2 class="h-sec">Precisión por modo</h2><div class="panel chart">${barsSVG()}</div>
    <h2 class="h-sec">Dominio por semana</h2><div class="panel">${heatHTML()}</div>
    <h2 class="h-sec">Cobertura y fuentes</h2><div class="panel" style="font-size:14px">${coverageHTML()}</div></div>`;
  $$('[data-sm]').forEach(b => b.onclick = () => { renderStats.sel = b.dataset.sm; renderStats(); });
  save();
}
function chartSVG() {
  const W = 340, H = 170, pl = 30, pr = 10, pt = 12, pb = 24;
  const ks = Object.keys(S.hist).sort();
  const start = ks.length ? new Date(ks[0] + 'T00:00:00') : new Date(); const end = examDate();
  const span = Math.max(1, (end - start) / DAY);
  const x = d => pl + ((d - start) / DAY) / span * (W - pl - pr), y = v => pt + (1 - v / 100) * (H - pt - pb);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Porcentaje listo para N4 por día">`;
  [0, 25, 50, 75, 100].forEach(v => s += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="#3a2631" stroke-width=".6"/><text x="${pl - 4}" y="${y(v) + 3}" text-anchor="end">${v}</text>`);
  s += `<line x1="${pl}" x2="${W - pr}" y1="${y(100)}" y2="${y(100)}" stroke="#ff5fae" stroke-dasharray="4 3" stroke-width="1"/><text x="${W - pr}" y="${y(100) - 3}" text-anchor="end" style="fill:#ff5fae">meta 100%</text>`;
  s += `<line x1="${x(end)}" x2="${x(end)}" y1="${pt}" y2="${H - pb}" stroke="#e9dfe5" stroke-width="1"/><text x="${x(end) - 3}" y="${H - pb + 14}" text-anchor="end" style="fill:#e9dfe5">juicio ${end.toLocaleDateString('es', { day: 'numeric', month: 'short' })}</text>`;
  s += `<text x="${pl}" y="${H - pb + 14}">${start.toLocaleDateString('es', { day: 'numeric', month: 'short' })}</text>`;
  if (ks.length) {
    const pts = ks.map(k => [x(new Date(k + 'T00:00:00')), y(S.hist[k].r || 0)]);
    s += `<path d="M${pts.map(p => p.join(' ')).join(' L')} L${pts[pts.length - 1][0]} ${y(0)} L${pts[0][0]} ${y(0)}Z" fill="rgba(255,95,174,.14)"/>`;
    s += `<path d="M${pts.map(p => p.join(' ')).join(' L')}" fill="none" stroke="#ffb8d9" stroke-width="1.8"/>`;
    const lp = pts[pts.length - 1]; s += `<circle cx="${lp[0]}" cy="${lp[1]}" r="3.5" fill="#ff5fae"/><text x="${lp[0] + 5}" y="${lp[1] - 5}" style="fill:#ff5fae">${(S.hist[ks[ks.length - 1]].r || 0).toFixed(1)}%</text>`;
  } else s += `<text x="${W / 2}" y="${H / 2}" text-anchor="middle">Sin datos: juega una ronda</text>`;
  return s + '</svg>';
}
function barsSVG() {
  const names = { kanji: 'Kanji', pares: 'Pares', vocab: 'Vocab', gram: 'Gramática', conj: 'Conjug.', part: 'Partíc.', cont: 'Contad.', read: 'Lectura', audio: 'Escucha', review: 'Repaso', warm: 'Calent.', intro: 'Inicia.', final: 'Final' };
  const E = Object.entries(S.acc).filter(([k]) => names[k]);
  if (!E.length) return '<p class="mute" style="margin:0">Sin datos todavía.</p>';
  const W = 340, rowH = 22, H = E.length * rowH + 10, pl = 70;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Precisión por modo">`;
  E.forEach(([k, a], i) => { const p = a.ok / a.q, yy = 5 + i * rowH, w = (W - pl - 50) * p; s += `<text x="${pl - 6}" y="${yy + 12}" text-anchor="end">${names[k]}</text><rect x="${pl}" y="${yy + 2}" width="${W - pl - 50}" height="13" fill="#1a0d14"/><rect x="${pl}" y="${yy + 2}" width="${w}" height="13" fill="${p === 1 ? '#ffffff' : p >= .9 ? '#ff5fae' : '#8f0d22'}"/><text x="${W - 4}" y="${yy + 12}" text-anchor="end">${Math.round(p * 100)}% · ${a.q}</text>`; });
  return s + '</svg>';
}
function heatHTML() {
  // filas = categorías, columnas = últimas 6 semanas (dominio al final de cada semana)
  const rows = [['kN5', 'Kanji N5'], ['kN4', 'Kanji N4'], ['vS2', 'Vocab S2'], ['vN5', 'Vocab N5'], ['vN4', 'Vocab N4'], ...GPTS.map(p => ['g_' + p, PTS[p].name])];
  const now = new Date(); const cols = [];
  for (let w = 5; w >= 0; w--) { const end = new Date(now - w * 7 * DAY); const k = Object.keys(S.hist).filter(d => d <= todayKey(end)).sort().pop(); cols.push(k ? S.hist[k].cm : null); }
  const col = v => v == null ? '#0b0609' : v >= 1 ? '#ffffff' : v >= .75 ? '#ff5fae' : v >= .5 ? '#b0337a' : v >= .25 ? '#6e1240' : v > 0 ? '#3a0a22' : '#170b11';
  return `<div class="heat"><span></span>${cols.map((_, i) => `<span class="mute" style="text-align:center">${i === 5 ? 'hoy' : '-' + (5 - i) + 's'}</span>`).join('')}${rows.map(([k, l]) => `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l)}</span>${cols.map(c => `<span class="c" style="background:${col(c ? c[k] : null)}" title="${c ? Math.round((c[k] || 0) * 100) + '%' : 'sin datos'}"></span>`).join('')}`).join('')}</div><div class="mono mute" style="font-size:11px;margin-top:8px">blanco = 100% dominado · rosa ≥ 75% · magenta ≥ 50% · vino &lt; 50% · negro = sin datos</div>`;
}
function coverageHTML() {
  const C = DATA.cov;
  return `<p style="margin-top:0"><b>${K.length}</b> kanji N5+N4 (${C.kOk} en ≥2 listas, ${K.length - C.kOk} marcados "revisar") · <b>${V.length}</b> palabras (${C.vOk} coinciden en las dos versiones de Tanos, ${C.vRev} "revisar", ${C.vS2} del libro) · <b>${G.length}</b> preguntas de gramática (${G.filter(g => g.f.includes('L')).length} de tu libro, ${G.filter(g => g.f.includes('T')).length} trampas) · ${PARTICLES.length} de partículas · ${COUNTERS.length} contadores · ${READINGS.length} lecturas · ${Object.values(MIRROR).reduce((a, c) => a + c.lines.length, 0)} frases del espejo.</p>
  <p class="mute" style="font-size:13px">Fuentes: listas JLPT de Jonathan Waller (tanos.co.uk, CC BY) vía open-anki-jlpt-decks y yomitan-jlpt-vocab (cruzada con JMdict); KANJIDIC2 (EDRDG, CC BY-SA) para lecturas; niveles de kanji cruzados con kanji-data (Waller) y jlpt-kanji-dictionary. Traducciones al español, trucos y frases de ejemplo escritos para esta app; furigana generado con kuromoji (IPADIC) y corregido a mano. Datos: ${esc(DATA.built)}.</p>`;
}

// ================= BIBLIOTECA / AJUSTES =================
function renderLibrary() {
  document.body.classList.remove('inq');
  stage().innerHTML = `<div class="col"><button class="btn ghost" id="mb">← Volver</button><h1 class="h-title">Biblioteca</h1><div class="lbl">Tu guía de la Semana 2 · con tus anotaciones</div>${libraryHTML()}</div>`;
  $('#mb').onclick = render; stage().scrollTop = 0;
}
function renderSettings() {
  const c = S.cfg;
  stage().innerHTML = `<div class="col"><button class="btn ghost" id="mb">← Volver</button><h1 class="h-title">Ajustes</h1>
  <div class="panel col">
    <div class="field"><label class="lbl" for="exd">Fecha del examen</label><input type="date" id="exd" value="${esc(c.exam || todayKey(examDate()))}"></div>
    <div class="field"><label class="lbl" for="dif">Dificultad del reloj</label><select id="dif"><option value="normal">Normal · 15 s por pregunta</option><option value="dura">Dura · 10 s</option><option value="brutal">Brutal · 6 s</option></select><span class="mute" style="font-size:13px">Acierto "rápido" = antes del 60% del tiempo. Solo los rápidos cuentan para dominar.</span></div>
    <div class="row"><button class="chip" id="fu" aria-pressed="${!!c.furiQ}">Furigana en preguntas</button><button class="chip" id="sn" aria-pressed="${!!c.snd}">Sonido</button><button class="chip" id="cl" aria-pressed="${!!c.calm}">Efectos reducidos</button><button class="chip" id="vt">Probar voz</button></div>
    <div class="mono mute" style="font-size:12px" id="cloudState">${dbDoc ? 'sincronizado en la nube' : 'guardado en este navegador (la nube no respondió)'}</div>
  </div>
  <div class="panel col"><div class="lbl">Progreso</div>
    <div class="grid2"><button class="btn" id="ex">Exportar JSON</button><button class="btn" id="im">Importar JSON</button></div>
    <textarea id="io" placeholder="Pega aquí un JSON exportado y pulsa Importar" aria-label="JSON de progreso"></textarea>
    <input type="file" id="imf" accept="application/json,.json" aria-label="Archivo JSON">
    <button class="btn ghost" id="rs">Borrar todo el progreso</button><div id="rsc"></div></div></div>`;
  $('#dif').value = c.diff; $('#mb').onclick = render;
  $('#exd').onchange = e => { c.exam = e.target.value; delete (S.plan || {})[todayKey()]; save(); header(); };
  $('#dif').onchange = e => { c.diff = e.target.value; save(); };
  const tog = (id, k, fn) => $(id).onclick = () => { c[k] = c[k] ? 0 : 1; $(id).setAttribute('aria-pressed', !!c[k]); fn && fn(); save(); };
  tog('#fu', 'furiQ', applyCfg); tog('#sn', 'snd', () => { SND.init(); SND.setVol(); paintMute(); }); tog('#cl', 'calm', applyCfg);
  $('#vt').onclick = () => speak('日本語の勉強をしましょう。');
  $('#ex').onclick = async () => {
    const data = JSON.stringify(S); $('#io').value = data;
    try { const dl = window.claude && await claude.use('downloads'); if (dl) { await dl.save({ filename: 'sinfalla-n4-progreso-' + todayKey() + '.json', data }); return; } } catch (e) { }
    $('#io').select(); toast('JSON listo en el cuadro: cópialo y guárdalo.');
  };
  const doImport = txt => { try { const o = JSON.parse(txt); if (!o.it || !o.cfg) throw 0; mergeState(o); save(true); applyCfg(); toast('Progreso importado.'); render(); } catch (e) { toast('Ese JSON no es un progreso válido de Sin Falla.'); } };
  $('#im').onclick = () => doImport($('#io').value);
  $('#imf').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => doImport(r.result); r.readAsText(f); };
  $('#rs').onclick = () => { $('#rsc').innerHTML = `<p class="red">Se borrará todo: ítems, cripta, récords. No se puede deshacer.</p><button class="btn pri block" id="rsy">Sí, borrar todo</button>`; $('#rsy').onclick = () => { const cfg = S.cfg; for (const k of ['it', 'crypt', 'rec', 'hist', 'acc', 'days', 'guard', 'plan']) S[k] = {}; S.intro = []; S.finals = []; S.ghost = null; S.xp = 0; S.streak = 0; S.log = []; S.diag = null; S.cfg = cfg; save(true); toast('Progreso borrado.'); render(); }; };
}
function applyCfg() { document.body.classList.toggle('furiq', !!S.cfg.furiQ); document.body.classList.toggle('calm', !!S.cfg.calm); BG.setCalm(reduceMotion()); }
const ICON_ON = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 8a5 5 0 010 8M19 5a9 9 0 010 14"/></svg>', ICON_OFF = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
function paintMute() { $('#muteBtn').innerHTML = S.cfg.snd ? ICON_ON : ICON_OFF; $('#muteBtn').setAttribute('aria-label', S.cfg.snd ? 'Silenciar sonido' : 'Activar sonido'); $('#vol').value = S.cfg.vol; }
