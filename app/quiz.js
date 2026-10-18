// ================= GENERADORES DE PREGUNTAS =================
const PAIRS = CONFUSABLE.filter(p => KSET.has(p[0]) && KSET.has(p[1]));
const PAIR_OF = new Map(); PAIRS.forEach(p => { (PAIR_OF.get(p[0]) || PAIR_OF.set(p[0], []).get(p[0])).push(p); (PAIR_OF.get(p[1]) || PAIR_OF.set(p[1], []).get(p[1])).push(p); });
const kunFmt = s => s.replace(/\.(.+)$/, '($1)');
function kReading(k) { const on = k.onK.slice(0, 2).join('・'), kun = k.kun.slice(0, 2).map(kunFmt).join('・'); return [on, kun].filter(Boolean).join(' / '); }
function kWordsHTML(k, n = 3) {
  const ws = k.ex.map(id => VBY.get(id)).filter(Boolean).slice(0, n).map(v => `<div class="ex">${wordRuby(v.w, v.r)} <span class="mute" style="font-size:13px">· ${esc(v.es)}</span></div>`);
  (k.xw || []).forEach(x => ws.push(`<div class="ex">${wordRuby(x[0], x[1])} <span class="mute" style="font-size:13px">· ${esc(x[2])}</span></div>`));
  return ws.join('');
}
function distinct(correct, pool, n, keyf = x => x) { const seen = new Set([keyf(correct)]); const out = []; for (const x of shuffle(pool)) { const k = keyf(x); if (seen.has(k)) continue; seen.add(k); out.push(x); if (out.length >= n) break; } return out; }
function mcq(correct, wrongs) { const opts = shuffle([correct, ...wrongs]); return { opts, ans: opts.indexOf(correct) }; }

// ---- KANJI
function kDistractors(k, n = 3) {
  const pref = (PAIR_OF.get(k.k) || []).map(p => p[0] === k.k ? p[1] : p[0]).map(c => KBY.get(c));
  const same = K.filter(x => x.lv === k.lv && x.k !== k.k);
  const pool = distinct(k, pref.concat(shuffle(same).slice(0, 20)), n, x => x.k);
  return pool.slice(0, n);
}
function qKanji(k, sub) {
  const key = 'k:' + k.k; const ds = kDistractors(k);
  const fb = `<div class="ans"><span style="font-size:30px">${esc(k.k)}</span> · ${esc(kReading(k))} · ${esc(k.es)}</div><div class="tr"><b>Truco:</b> ${esc(k.mn)}</div>${kWordsHTML(k, 2)}`;
  const say = k.ex.length ? VBY.get(k.ex[0]).r : (k.kun[0] || k.on[0] || '').replace(/\..*/, '');
  if (sub === 'read') {
    const { opts, ans } = mcq(kReading(k), ds.map(kReading));
    return { key, dir: 'f', mode: 'kanji', kind: 'Kanji → lectura', prompt: `<div class="q-big">${esc(k.k)}</div>`, opts: opts.map(o => ({ h: esc(o), cls: 'jp' })), ans, cause: 'lectura', fb, say };
  }
  if (sub === 'meaning') {
    const { opts, ans } = mcq(k.es, ds.map(x => x.es));
    return { key, dir: 'f', mode: 'kanji', kind: 'Kanji → significado', prompt: `<div class="q-big">${esc(k.k)}</div>`, opts: opts.map(o => ({ h: esc(o) })), ans, cause: 'significado', fb, say };
  }
  if (sub === 'toR') {
    const { opts, ans } = mcq(k.k, ds.map(x => x.k));
    return { key, dir: 'b', mode: 'kanji', kind: 'Lectura → kanji', prompt: `<div class="q-word">${esc(kReading(k))}</div><div class="q-sub">¿Qué kanji se lee así?</div>`, opts: opts.map(o => ({ h: esc(o), cls: 'kj' })), ans, cause: 'lectura', fb, say };
  }
  if (sub === 'toM') {
    const { opts, ans } = mcq(k.k, ds.map(x => x.k));
    return { key, dir: 'b', mode: 'kanji', kind: 'Significado → kanji', prompt: `<div class="q-es">${esc(k.es)}</div>`, opts: opts.map(o => ({ h: esc(o), cls: 'kj' })), ans, cause: 'significado', fb, say };
  }
  if (sub === 'pair') {
    const prs = PAIR_OF.get(k.k); if (!prs) return qKanji(k, 'toM');
    const p = pick(prs), other = KBY.get(p[0] === k.k ? p[1] : p[0]);
    const extra = distinct(k, K.filter(x => x.lv === k.lv), 2, x => x.k).filter(x => x.k !== other.k).slice(0, 2);
    const { opts, ans } = mcq(k.k, [other.k, ...extra.map(x => x.k)]);
    return { key, dir: 'b', mode: 'pares', kind: 'Pares confusos', prompt: `<div class="q-es">${esc(k.es)}</div><div class="q-sub jp">${esc(kReading(k))}</div><div class="q-sub">Cuidado con ${esc(other.k)} (${esc(other.es)})</div>`, opts: opts.map(o => ({ h: esc(o), cls: 'kj' })), ans, cause: 'significado', fb: fb + `<div class="tr">${esc(p[2])}</div>`, say };
  }
}
// ---- VOCABULARIO
function vDistractors(v, n = 3) {
  const sameT = V.filter(x => x.t === v.t && x.id !== v.id && x.es !== v.es);
  const sameTh = sameT.filter(x => x.th === v.th);
  const kanjiShare = hasKanji(v.w) ? V.filter(x => x.id !== v.id && [...v.w].some(c => hasKanji(c) && x.w.includes(c))) : [];
  const pool = shuffle(sameTh).slice(0, 6).concat(shuffle(kanjiShare).slice(0, 3), shuffle(sameT).slice(0, 10));
  return distinct(v, pool, n, x => x.es + '|' + x.w);
}
function vFb(v) { return `<div class="ans">${wordRuby(v.w, v.r)} · ${esc(v.es)} <span class="tag">${esc(TYPES[v.t] || v.t)}</span></div><div class="ex">${ruby(v.ex)}<small>${esc(v.exes)}</small></div>`; }
function qVocab(v, sub) {
  const key = 'v:' + v.id; const ds = vDistractors(v);
  const show = `<div class="q-word">${wordRuby(v.w, v.r)}</div>`;
  if (sub === 'jp') {
    const { opts, ans } = mcq(v.es, ds.map(x => x.es));
    return { key, dir: 'f', mode: 'vocab', kind: 'Japonés → español', prompt: show, opts: opts.map(o => ({ h: esc(o) })), ans, cause: 'significado', fb: vFb(v), say: v.r };
  }
  if (sub === 'read') {
    const rs = distinct(v, V.filter(x => x.id !== v.id && x.r.length === v.r.length && x.r !== v.r).concat(ds), 3, x => x.r).map(x => x.r);
    const { opts, ans } = mcq(v.r, rs);
    return { key, dir: 'f', mode: 'vocab', kind: 'Palabra → lectura', prompt: `<div class="q-word" style="font-size:clamp(40px,12vw,64px)">${esc(v.w)}</div><div class="q-sub">${esc(v.es)}</div>`, opts: opts.map(o => ({ h: esc(o), cls: 'jp' })), ans, cause: 'lectura', fb: vFb(v), say: v.r, nofuri: 1 };
  }
  if (sub === 'es') {
    const { opts, ans } = mcq(v, ds);
    return { key, dir: 'b', mode: 'vocab', kind: 'Español → japonés', prompt: `<div class="q-es">${esc(v.es)}</div><div class="q-sub">${esc(TYPES[v.t] || '')}</div>`, opts: opts.map(o => ({ h: wordRuby(o.w, o.r), cls: 'jp' })), ans, cause: 'significado', fb: vFb(v), say: v.r };
  }
  if (sub === 'type') {
    return { key, dir: 'b', mode: 'vocab', kind: 'Escribe en kana', prompt: `<div class="q-es">${esc(v.es)}</div><div class="q-sub">${esc(TYPES[v.t] || '')} · escribe la lectura (romaji o kana)</div>`, type: 1, answers: v.r.split(/;\s*/).map(normKana).concat(v.wa ? [] : []), cause: 'lectura', fb: vFb(v), say: v.r };
  }
}
function qAudio(v) {
  const q = qVocab(v, 'jp'); q.mode = 'audio'; q.kind = 'Escucha (聴解)'; q.audioOnly = 1;
  q.prompt = `<button class="btn acidb" data-act="say" style="min-width:160px">▶ Escuchar</button><div class="q-sub">Escucha y elige el significado</div>`;
  return q;
}
// ---- GRAMÁTICA
function gPrompt(g, reveal) {
  if (g.k === 'F') return `<div class="q-sent">${esc(g.q).replace('（　）', reveal != null ? `<span class="blank">${esc(g.o[g.a])}</span>` : '<span class="blank">　</span>')}</div>`;
  const slots = [0, 1, 2, 3].map(i => i === g.st ? '<span class="blank">★</span>' : '<span class="blank">　</span>').join(' ');
  return `<div class="q-sent">${esc(g.pre)} ${slots} ${esc(g.post)}</div>`;
}
function gFull(g) { return g.k === 'F' ? esc(g.q).replace('（　）', `<b class="acid">${esc(g.o[g.a])}</b>`) : esc(g.pre) + g.pc.map((p, i) => i === g.st ? `<b class="acid">${esc(p)}</b>` : esc(p)).join('') + esc(g.post); }
function qGrammar(g) {
  const key = 'g:' + g.id; const P = PTS[g.pt];
  const fb = `<div class="ans">${gFull(g)}</div><div>${esc(g.e)}</div><div class="tr"><b>Truco:</b> ${ruby(g.tr)}</div>${g.f.includes('L') ? '<div class="tag">LIBRO</div>' : ''}`;
  if (g.k === 'F') return { key, dir: 'f', mode: 'gram', kind: (g.f.includes('T') ? 'TRAMPA · ' : '') + P.name, prompt: gPrompt(g), opts: g.o.map(o => ({ h: esc(o), cls: 'jp' })), ans: g.a, cause: 'gramática', fb, say: g.q.replace('（　）', g.o[g.a]), shuffleOk: 0 };
  const order = shuffle([0, 1, 2, 3]);
  return { key, dir: 'f', mode: 'gram', kind: '★ Ordena · ' + P.name, prompt: gPrompt(g) + `<div class="q-sub">¿Qué pieza va en ★?</div><div class="q-sub jp">${order.map(i => esc(g.pc[i])).join(' ／ ')}</div>`, opts: order.map(i => ({ h: esc(g.pc[i]), cls: 'jp' })), ans: order.indexOf(g.st), cause: 'gramática', fb, say: g.pre + g.pc.join('') + g.post };
}
// ---- CONJUGADOR
function qConj(v, form) {
  const gr = v.t; const W = conj(v.w, gr, form), R = conj(v.r, gr, form);
  const wrongR = conjWrong(v.r, gr, form).filter(x => x !== R);
  const ws = shuffle(wrongR).slice(0, 3);
  const { opts, ans } = mcq(R, ws);
  const gl = { v1: 'G1', v2: 'G2', v3: 'G3' }[gr];
  const key = 'c:' + v.id + ':' + form;
  return { key, dir: 'f', mode: 'conj', kind: 'Conjugador · ' + gl, prompt: `<div class="q-word">${wordRuby(v.w, v.r)}</div><div class="q-sub">${esc(v.es)}</div><div class="q-es" style="font-size:20px">→ <span class="acid">${esc(FORMS[form])}</span></div>`, opts: opts.map(o => ({ h: esc(o), cls: 'jp' })), ans, cause: 'gramática', fb: `<div class="ans">${wordRuby(W, R)}</div><div class="tr"><b>Regla:</b> ${esc(conjRule(gr, form, v))}</div>`, say: R };
}
function conjRule(g, f, v) {
  const R = {
    v1: { masu: 'u → i + ます', te: 'う/つ/る→って · む/ぶ/ぬ→んで · く→いて (行く→行って) · ぐ→いで · す→して', ta: 'como て, con た/だ', nai: 'u → a + ない (う → わない)', pot: 'u → e + る', pas: 'u → a + れる (う → わ)', imp: 'u → e', pro: 'diccionario + な', ba: 'u → e + ば', tara: 'forma た + ら', vol: 'u → o + う', dict: 'forma de diccionario' },
    v2: { masu: 'quita る + ます', te: 'quita る + て', ta: 'quita る + た', nai: 'quita る + ない', pot: 'quita る + られる', pas: 'quita る + られる (= potencial)', imp: 'quita る + ろ (くれる → くれ)', pro: 'diccionario + な', ba: 'quita る + れば', tara: 'quita る + たら', vol: 'quita る + よう', dict: 'forma de diccionario' },
    v3: { masu: 'します · 来ます', te: 'して · 来て(きて)', ta: 'した · 来た(きた)', nai: 'しない · 来ない(こない)', pot: 'できる · 来られる(こられる)', pas: 'される · 来られる(こられる)', imp: 'しろ · 来い(こい)', pro: 'するな · 来るな', ba: 'すれば · 来れば(くれば)', tara: 'したら · 来たら(きたら)', vol: 'しよう · 来よう(こよう)', dict: 'する · 来る' }
  };
  return R[g][f];
}
// ---- PARTÍCULAS / CONTADORES / LECTURA
function qParticle(i) {
  const [s, a, o, e] = PARTICLES[i]; const { opts, ans } = mcq(a, o.filter(x => x !== a));
  return { key: 'pa:' + i, dir: 'f', mode: 'part', kind: 'Partículas', prompt: `<div class="q-sent">${esc(s).replace('（　）', '<span class="blank">　</span>')}</div>`, opts: opts.map(x => ({ h: esc(x), cls: 'jp' })), ans, cause: 'gramática', fb: `<div class="ans">${esc(s.replace('（　）', a))}</div><div class="tr"><b>Regla:</b> ${esc(e)}</div>`, say: s.replace('（　）', a) };
}
function qCounter() {
  const c = pick(COUNTERS), n = 1 + rnd(10); const a = c.r[n - 1];
  const others = shuffle(COUNTERS.filter(x => x.c !== c.c && x.r[n - 1] !== a)).slice(0, 1).map(x => x.r[n - 1]);
  const near = c.r.filter((x, i) => i !== n - 1 && x !== a);
  // errores fonéticos típicos
  const fake = a.replace(/っぽん|っぴき|っぱい|っぷん/, m => ({ 'っぽん': 'ちほん', 'っぴき': 'ちひき', 'っぱい': 'ちはい', 'っぷん': 'ちふん' }[m])).replace(/^さんぼん$/, 'さんほん').replace(/^さんびき$/, 'さんひき');
  const pool = [...new Set([fake, ...others, ...shuffle(near)].filter(x => x !== a))].slice(0, 3);
  const { opts, ans } = mcq(a, pool);
  const num = '一二三四五六七八九十'[n - 1];
  return { key: 'cn:' + c.c + n, dir: 'f', mode: 'cont', kind: 'Contadores · ' + c.es, prompt: `<div class="q-big" style="font-size:clamp(54px,18vw,90px)">${num}${esc(c.c)}</div>`, opts: opts.map(x => ({ h: esc(x), cls: 'jp' })), ans, cause: 'lectura', fb: `<div class="ans">${num}${esc(c.c)} = ${esc(a)}</div><div class="tr">1–10: ${c.r.map((x, i) => i === n - 1 ? `<b>${esc(x)}</b>` : esc(x)).join(' · ')}</div>`, say: a };
}
function qReadingQ(r, qi) {
  const q = r.qs[qi]; const { opts, ans } = mcq(q.o[0], q.o.slice(1));
  return { key: 'rd:' + r.id + ':' + qi, dir: 'f', mode: 'read', kind: '読解 · ' + r.title, prompt: `<div class="q-sent" style="font-size:17px;line-height:1.9;max-height:38vh;overflow:auto;border:1px solid var(--rib);padding:8px">${ruby(furiText(r.text))}</div><div class="q-sent" style="font-size:18px">${esc(q.q)}</div>`, opts: opts.map(x => ({ h: esc(x), cls: 'jp' })), ans, cause: 'significado', fb: `<div class="ans">${esc(q.o[0])}</div><div>${esc(q.e)}</div><div class="tr mute">${esc(r.es)}</div>`, say: r.text, long: 1 };
}
// furigana para lecturas: usa lecturas de palabras del banco si coinciden (precomputado en build)
function furiText(t) { return (DATA.rfuri && DATA.rfuri[t]) || t; }
