'use strict';
// ================= UTILIDADES =================
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1);[a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const DAY = 86400000;
const todayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const hasKanji = s => /[一-鿿々]/.test(s);
const kata2hira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const stripFuri = s => s.replace(/\{[^}]*\}/g, '');
const readFuri = s => s.replace(/([一-鿿々〇]+)\{([^}]*)\}/g, '$2');
// 漢字{かんじ} → <ruby>
function ruby(s) { return esc(s).replace(/([一-鿿々〇ヶ]+)\{([^}]*)\}/g, '<ruby>$1<rt>$2</rt></ruby>'); }
function wordRuby(w, r) { // ruby for a dictionary word using its kana reading (aligning okurigana)
  if (!hasKanji(w) || !r || w === r) return esc(w);
  const parts = w.match(/[一-鿿々〇ヶ]+|[^一-鿿々〇ヶ]+/g);
  const re = new RegExp('^' + parts.map(p => hasKanji(p) ? '(.+?)' : '(' + kata2hira(p).replace(/[.*+?^${}()|[\]\\〜～]/g, '\\$&') + ')').join('') + '$');
  const m = kata2hira(r).match(re);
  if (!m) return `<ruby>${esc(w)}<rt>${esc(r)}</rt></ruby>`;
  return parts.map((p, i) => hasKanji(p) ? `<ruby>${esc(p)}<rt>${esc(m[i + 1])}</rt></ruby>` : esc(p)).join('');
}
function fmtTime(ms) { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function hhmmss(d = new Date()) { return [d.getHours(), d.getMinutes(), d.getSeconds()].map(x => String(x).padStart(2, '0')).join(':'); }
function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, ms); }
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches || S.cfg.calm;

// ================= DATOS =================
const V = DATA.vocab, K = DATA.kanji, G = DATA.grammar;
const VBY = new Map(V.map(v => [v.id, v]));
const KBY = new Map(K.map(k => [k.k, k]));
const GBY = new Map(G.map(g => [g.id, g]));
const KSET = new Set(K.map(k => k.k));
const THEMES = { t: 'Tiempo y calendario', n: 'Números y contadores', c: 'Comida y bebida', h: 'Casa y objetos', e: 'Escuela y estudio', w: 'Trabajo y sociedad', b: 'Cuerpo y salud', p: 'Personas y familia', l: 'Lugares y ciudad', v: 'Viaje y transporte', z: 'Naturaleza y clima', s: 'Compras y dinero', f: 'Sentimientos y carácter', a: 'Acciones cotidianas', d: 'Descripciones', g: 'Gramática y función', o: 'Ocio y cultura', r: 'Ropa' };
const TYPES = { n: 'sustantivo', v1: 'verbo G1 (godan)', v2: 'verbo G2 (ichidan)', v3: 'verbo G3 (irregular)', 'adj-i': 'adjetivo -i', 'adj-na': 'adjetivo -na', adv: 'adverbio', pron: 'pronombre / demostrativo', cnt: 'contador', suf: 'sufijo', pref: 'prefijo', part: 'partícula', conj: 'conjunción', int: 'interjección', num: 'número', exp: 'expresión' };

// ================= ESTADO =================
const S = {
  v: 3, created: Date.now(), cfg: { exam: '', snd: 1, vol: 60, furi: 1, diff: 'normal', calm: 0, setup: 0 },
  it: {},          // claves de ítems → registro
  intro: [],       // claves presentadas (orden)
  crypt: {},       // clave → {c: causa principal, n: fallos, cs: racha de liberación, t: fecha}
  freed: 0,
  rec: {},         // modo → [{s, pts, ms, d, acc, rank}]
  ghost: null,     // mejor ronda de 10: {keys, times, ms, s}
  hist: {},        // fecha → {r: % integridad, q: preguntas, ok: aciertos, ms: tiempo estudio}
  acc: {},         // modo → {q, ok}
  days: {},        // fecha → misiones completadas
  xp: 0, streak: 0, lastDay: '', lastSeen: 0,
  guard: {},       // semana → {best, dom}
  finals: [],      // simulacros
  rankSeen: 0, lastPhrase: '', log: [], plan: { base: 0 }, diag: null
};
const STORE_KEY = 'sinfalla-n4-v3';
let dbDoc = null, saveTimer = null, saving = false, dirty = false;

function loadLocal() { try { const j = localStorage.getItem(STORE_KEY); if (j) return JSON.parse(j); } catch (e) { } return null; }
function mergeState(o) { if (!o || typeof o !== 'object') return; for (const k of Object.keys(S)) if (o[k] !== undefined) S[k] = (k === 'cfg') ? Object.assign(S.cfg, o.cfg) : o[k]; }
function save(now) {
  dirty = true; S.lastSeen = Date.now();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { }
  clearTimeout(saveTimer); saveTimer = setTimeout(flush, now ? 0 : 3500);
}
async function flush() {
  if (!dbDoc || saving || !dirty) return; saving = true; dirty = false;
  try { await dbDoc.set({ json: JSON.stringify(S), ts: Date.now(), v: S.v }); }
  catch (e) { dirty = true; }
  saving = false;
}
async function initCloud() {
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
    if (!db || !user) return;
    const id = await user.id(); if (!id) return;
    dbDoc = db.collection('data/users/' + id).doc('progreso');
    const snap = await dbDoc.get();
    const d = snap && snap.exists ? snap.data() : null;
    if (d && d.json) {
      const remote = JSON.parse(d.json);
      if ((remote.lastSeen || 0) > (S.lastSeen || 0)) { mergeState(remote); try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { } if (window.onCloudLoaded) onCloudLoaded(); }
      else { dirty = true; flush(); }
    } else { dirty = true; flush(); }
    $('#cloudState') && ($('#cloudState').textContent = 'sincronizado en la nube');
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  } catch (e) { }
}

// ================= FECHAS / PLAN =================
function examDate() { const s = S.cfg.exam; if (s) { const d = new Date(s + 'T09:00:00'); if (!isNaN(d)) return d; } return new Date(Date.now() + 30 * DAY); }
function daysLeft() { const t = new Date(); t.setHours(0, 0, 0, 0); const e = examDate(); e.setHours(0, 0, 0, 0); return Math.round((e - t) / DAY); }

// ================= ÍTEMS Y SRS =================
// claves: v:<id> (vocab, dirs f=JP→ES b=ES→JP), k:<kanji> (f=kanji→lectura/significado, b=→kanji), g:<id> (gramática, dir f), p:<punto> (presentación de punto)
function rec(key) { return S.it[key] || (S.it[key] = { b: 0, f: 0, r: 0, c: 0, w: 0, t: 0, n: 0, l: 0, d: 0 }); }
function isIntro(key) { return !!(S.it[key] && S.it[key].b > 0); }
function dual(key) { return key[0] === 'v' || key[0] === 'k'; }
function mastered(key) { const r = S.it[key]; if (!r) return false; return dual(key) ? (r.f >= 3 && r.r >= 3) : r.f >= 3; }
const BOXI = [0, 10 / 1440, 1, 3, 7, 14]; // días
function intervalDays(box) { const dl = daysLeft(); const sc = clamp(dl / 30, 0.35, 1); return BOXI[box] * (box > 1 ? sc : 1); }
function limitMs() { return { normal: 15000, dura: 10000, brutal: 6000 }[S.cfg.diff] || 15000; }
function fastMs() { return Math.round(limitMs() * 0.6); }
function introduce(key) {
  const r = rec(key); if (r.b === 0) { r.b = 1; r.d = Date.now(); r.i = Date.now(); S.intro.push(key); }
}
// resultado de una respuesta
function grade(key, dir, ok, ms, cause) {
  const r = rec(key); if (r.b === 0) introduce(key);
  const fast = ok && ms <= fastMs();
  r.n++; r.l = Date.now(); r.t = r.t ? Math.round(r.t * 0.7 + ms * 0.3) : ms;
  const sk = dir === 'b' ? 'r' : 'f';
  if (ok) {
    r.c++; r[sk] = fast ? r[sk] + 1 : r[sk];
    if (fast) r.b = Math.min(5, r.b + 1);
    if (!dual(key) && fast) r.r = r.f;
  } else {
    r.w++; r[sk] = 0; r.b = 1;
    const c = S.crypt[key] || (S.crypt[key] = { c: {}, n: 0, cs: 0, t: Date.now() });
    c.n++; c.cs = 0; c.c[cause] = (c.c[cause] || 0) + 1; c.last = Date.now();
  }
  if (ok && S.crypt[key]) {
    const c = S.crypt[key];
    c.cs = fast ? c.cs + 1 : 0;
    if (c.cs >= 3) { delete S.crypt[key]; S.freed++; S.cryptLog = (S.cryptLog || []).concat([{ k: key, t: Date.now() }]).slice(-50); }
  }
  r.d = Date.now() + intervalDays(r.b) * DAY;
  // contadores diarios
  const h = S.hist[todayKey()] || (S.hist[todayKey()] = { r: 0, q: 0, ok: 0, ms: 0, slow: 0 });
  h.q++; if (ok) h.ok++; if (ok && !fast) h.slow++;
  S.xp += ok ? (fast ? 12 : 6) : 1;
  return fast;
}
function due(key) { const r = S.it[key]; return r && r.b > 0 && r.d <= Date.now(); }

// totales para INTEGRIDAD
function readiness() {
  let km = 0, vm = 0, gm = 0;
  for (const k of K) if (mastered('k:' + k.k)) km++;
  for (const v of V) if (mastered('v:' + v.id)) vm++;
  for (const g of G) if (mastered('g:' + g.id)) gm++;
  const pct = (km / K.length) * 30 + (vm / V.length) * 40 + (gm / G.length) * 30;
  const all = km === K.length && vm === V.length && gm === G.length;
  return { pct: all ? 100 : Math.min(99.9, pct), km, vm, gm };
}
const RANKS = [
  { n: 'Sombra', at: 0 }, { n: 'Cuervo', at: 20 }, { n: 'Espectro', at: 40 }, { n: 'Réquiem', at: 60 }, { n: 'Eclipse', at: 80 }, { n: 'SIN FALLA', at: 100 }];
function rankOf(p) { let r = 0; RANKS.forEach((x, i) => { if (p >= x.at) r = i; }); return r; }

// ================= ROMAJI → KANA =================
const RK = (() => {
  const m = {}; const add = (r, k) => m[r] = k;
  const base = { a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お' };
  Object.entries(base).forEach(([r, k]) => add(r, k));
  const rows = { k: 'かきくけこ', g: 'がぎぐげご', s: 'さしすせそ', z: 'ざじずぜぞ', t: 'たちつてと', d: 'だぢづでど', n: 'なにぬねの', h: 'はひふへほ', b: 'ばびぶべぼ', p: 'ぱぴぷぺぽ', m: 'まみむめも', r: 'らりるれろ' };
  for (const [c, ks] of Object.entries(rows)) 'aiueo'.split('').forEach((v, i) => add(c + v, ks[i]));
  Object.assign(m, { ya: 'や', yu: 'ゆ', yo: 'よ', wa: 'わ', wo: 'を', shi: 'し', chi: 'ち', tsu: 'つ', fu: 'ふ', ji: 'じ', "n'": 'ん', xtsu: 'っ', ltu: 'っ', xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ', xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ', '-': 'ー', je: 'じぇ', che: 'ちぇ', she: 'しぇ', ti: 'てぃ', di: 'でぃ', fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ', va: 'ゔぁ', wi: 'うぃ', we: 'うぇ' });
  const y = { ky: 'き', gy: 'ぎ', sh: 'し', j: 'じ', ch: 'ち', ny: 'に', hy: 'ひ', by: 'び', py: 'ぴ', my: 'み', ry: 'り', sy: 'し', zy: 'じ', ty: 'ち', jy: 'じ', cy: 'ち', dy: 'ぢ' };
  for (const [c, k] of Object.entries(y)) { add(c + 'a', k + 'ゃ'); add(c + 'u', k + 'ゅ'); add(c + 'o', k + 'ょ'); }
  return m;
})();
function romaToKana(s) {
  s = s.toLowerCase(); let out = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[^a-z'\-]/.test(c)) { out += c; i++; continue; }
    if (c === 'n' && s[i + 1] === 'n') { out += 'ん'; i += /[aiueoy]/.test(s[i + 2] || '') ? 1 : 2; continue; }
    if (c === s[i + 1] && /[bcdfghjkmprstwyz]/.test(c)) { out += 'っ'; i++; continue; }
    let hit = false;
    for (let L = 4; L >= 1; L--) { const seg = s.substr(i, L); if (RK[seg]) { out += RK[seg]; i += L; hit = true; break; } }
    if (!hit) {
      if (c === 'n' && (i + 1 >= s.length ? false : !/[aiueoy]/.test(s[i + 1]))) { out += 'ん'; i++; continue; }
      out += c; i++;
    }
  }
  return out;
}
const normKana = s => kata2hira(String(s).replace(/[\s。、.,!?！？・〜～]/g, '')).replace(/n$/, 'ん');

// ================= CONJUGADOR =================
const ROW = { う: ['わ', 'い', 'う', 'え', 'お'], く: ['か', 'き', 'く', 'け', 'こ'], ぐ: ['が', 'ぎ', 'ぐ', 'げ', 'ご'], す: ['さ', 'し', 'す', 'せ', 'そ'], つ: ['た', 'ち', 'つ', 'て', 'と'], ぬ: ['な', 'に', 'ぬ', 'ね', 'の'], ぶ: ['ば', 'び', 'ぶ', 'べ', 'ぼ'], む: ['ま', 'み', 'む', 'め', 'も'], る: ['ら', 'り', 'る', 'れ', 'ろ'] };
const TE = { う: 'って', つ: 'って', る: 'って', む: 'んで', ぶ: 'んで', ぬ: 'んで', く: 'いて', ぐ: 'いで', す: 'して' };
const FORMS = {
  dict: 'diccionario', masu: 'ます (cortés)', te: 'forma て', ta: 'forma た (pasado)', nai: 'forma ない', pot: 'potencial', pas: 'pasiva', imp: 'imperativo', pro: 'prohibitivo', ba: 'condicional ば', tara: 'condicional たら', vol: 'volitiva', cau: 'causativa (させる)', caup: 'causativa pasiva (させられる)'
};
const CONJ_EXCL = new Set(['いらっしゃる', 'くださる', 'なさる', 'おっしゃる', 'ござる', '～ございます', 'いただく', '参る', '申す', '致す', 'おる', '伺う', 'うかがう', '召し上がる', '申し上げる', '差し上げる', 'おいでになる', 'ごらんになる', 'ご覧になる', 'かまう', '～(て) しまう', '～おわる', '～だす', '～続ける', '～始める', 'いる', '要る', 'くれる', 'あげる', 'もらう', 'やる']);
function conj(word, group, form) {
  // devuelve string (en la misma escritura que word: kanji+okurigana o kana)
  const w = word;
  if (group === 'v3') {
    const isKuru = /来る$|くる$/.test(w) && (w === '来る' || w === 'くる');
    if (isKuru) {
      const k = w[0] === '来' ? '来' : '';
      const R = { dict: 'くる', masu: 'きます', te: 'きて', ta: 'きた', nai: 'こない', pot: 'こられる', pas: 'こられる', imp: 'こい', pro: 'くるな', ba: 'くれば', tara: 'きたら', vol: 'こよう', cau: 'こさせる', caup: 'こさせられる' }[form];
      return k ? k + R.slice(1) : R;
    }
    const st = w.replace(/する$/, '');
    return st + { dict: 'する', masu: 'します', te: 'して', ta: 'した', nai: 'しない', pot: 'できる', pas: 'される', imp: 'しろ', pro: 'するな', ba: 'すれば', tara: 'したら', vol: 'しよう', cau: 'させる', caup: 'させられる' }[form];
  }
  if (group === 'v2') {
    const st = w.slice(0, -1);
    if (form === 'imp' && /くれる$/.test(w)) return st;
    return form === 'dict' ? w : form === 'pro' ? w + 'な' : st + { masu: 'ます', te: 'て', ta: 'た', nai: 'ない', pot: 'られる', pas: 'られる', imp: 'ろ', ba: 'れば', tara: 'たら', vol: 'よう', cau: 'させる', caup: 'させられる' }[form];
  }
  // v1
  const end = w.slice(-1), st = w.slice(0, -1), row = ROW[end];
  if (!row) return w;
  const iku = /行く$|いく$/.test(w) && (w.endsWith('行く') || w === 'いく');
  const te = iku ? st + 'って' : st + TE[end];
  const ta = te.replace(/て$/, 'た').replace(/で$/, 'だ');
  switch (form) {
    case 'dict': return w;
    case 'masu': return st + row[1] + 'ます';
    case 'te': return te;
    case 'ta': return ta;
    case 'nai': return /^(ある|有る|在る)$/.test(w) ? 'ない' : st + row[0] + 'ない';
    case 'pot': return st + row[3] + 'る';
    case 'pas': return st + row[0] + 'れる';
    case 'imp': return st + row[3];
    case 'pro': return w + 'な';
    case 'ba': return st + row[3] + 'ば';
    case 'tara': return ta + 'ら';
    case 'vol': return st + row[4] + 'う';
    case 'cau': return st + row[0] + 'せる';
    case 'caup': return end === 'す' ? st + 'させられる' : st + row[0] + 'される';
  }
}
const row0 = e => (ROW[e] || [''])[0];
// errores típicos para distractores
function conjWrong(word, group, form) {
  const out = new Set();
  const other = { v1: ['v2'], v2: ['v1'], v3: ['v1', 'v2'] }[group] || [];
  for (const g of other) { try { const x = conj(word, g, form); if (x) out.add(x); } catch (e) { } }
  const fs = Object.keys(FORMS).filter(f => f !== form);
  for (const f of shuffle(fs).slice(0, 6)) out.add(conj(word, group, f));
  if (group === 'v1') {
    const end = word.slice(-1), st = word.slice(0, -1);
    const alt = { te: [st + 'って', st + 'んで', st + 'いて', st + 'して'], ta: [st + 'った', st + 'んだ', st + 'いた', st + 'した'] }[form];
    if (alt) alt.forEach(a => out.add(a));
    if (form === 'imp') out.add(st + ROW[end][3] + 'ろ');
    if (form === 'pas') out.add(st + ROW[end][0] + 'られる');
    if (form === 'nai' && end === 'う') out.add(st + 'あない');
    if (form === 'cau') { out.add(st + row0(end) + 'させる'); out.add(st + row0(end) + 'れる'); }
    if (form === 'caup') { out.add(st + row0(end) + 'せる'); out.add(st + row0(end) + 'させられる'); }
  }
  if (group === 'v2') { const st = word.slice(0, -1); if (form === 'imp') { out.add(st + 'れ'); out.add(word + 'ろ'); } if (form === 'nai') out.add(st + 'らない'); if (form === 'pot') out.add(st + 'れる'); }
  if (group === 'v3' && form === 'imp') { out.add(word.replace(/する$/, 'せろ')); out.add(word.replace(/くる$|来る$/, m => m[0] === '来' ? '来ろ' : 'ころ')); }
  return [...out];
}
const VERBS = V.filter(v => ['v1', 'v2', 'v3'].includes(v.t) && !CONJ_EXCL.has(v.w) && !/^[〜～]/.test(v.w) && /[うくぐすつぬぶむる]$/.test(v.w));

// ================= VOZ (ja-JP) =================
const TTS = { voice: null, ok: false };
function initVoice() {
  if (!('speechSynthesis' in window)) return;
  const pickV = () => { const vs = speechSynthesis.getVoices(); TTS.voice = vs.find(v => /ja[-_]JP/i.test(v.lang)) || vs.find(v => /^ja/i.test(v.lang)) || null; TTS.ok = !!TTS.voice; };
  pickV(); speechSynthesis.onvoiceschanged = pickV;
}
function speak(text, rate = 0.9) {
  if (!('speechSynthesis' in window)) { toast('Este navegador no tiene voz. Lee la lectura en kana.'); return false; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = rate; if (TTS.voice) u.voice = TTS.voice;
    u.volume = clamp(S.cfg.vol / 100, 0.2, 1);
    speechSynthesis.speak(u);
    if (!TTS.voice && !TTS.warned) { TTS.warned = 1; toast('Este dispositivo no tiene voz japonesa: puede sonar con otra voz. Fíjate en la lectura en kana.'); }
    return true;
  } catch (e) { return false; }
}
