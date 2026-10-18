// ================= LA PRUEBA FINAL: simulacro JLPT N4 con el formato oficial =================
const JL_INST = {
  m1: '＿＿の ことばは ひらがなで どう かきますか。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。',
  m2: '＿＿の ことばは どう かきますか。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。',
  m3: '（　　）に なにを いれますか。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。',
  m4: '＿＿の ぶんと だいたい おなじ いみの ぶんが あります。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。',
  m5: 'つぎの ことばの つかいかたで いちばん いい ものを 1・2・3・4から ひとつ えらんで ください。',
  g1: 'つぎの 文の （　　）に 何を 入れますか。1・2・3・4から いちばん いい ものを 一つ えらんで ください。',
  g2: 'つぎの 文の ★ に 入る ものは どれですか。1・2・3・4から いちばん いい ものを 一つ えらんで ください。',
  g3: 'つぎの 文章を 読んで、文章全体の 内容を 考えて、（1）から（4）の 中に 入る 最も よい ものを 1・2・3・4から 一つ えらんで ください。',
  r4: 'つぎの （1）から（3）の 文章を 読んで、質問に こたえて ください。答えは 1・2・3・4から いちばん いい ものを 一つ えらんで ください。',
  r5: 'つぎの 文章を 読んで、質問に こたえて ください。答えは 1・2・3・4から いちばん いい ものを 一つ えらんで ください。',
  r6: 'つぎの ページを 見て、下の 質問に こたえて ください。答えは 1・2・3・4から いちばん いい ものを 一つ えらんで ください。',
  l1: 'もんだい1では、はじめに しつもんを 聞いて ください。それから 話を 聞いて、もんだいようしの 1から4の 中から、いちばん いい ものを 一つ えらんで ください。',
  l2: 'もんだい2では、はじめに しつもんを 聞いて ください。そのあと、もんだいようしを 見て ください。読む 時間が あります。それから 話を 聞いて、1から4の 中から、いちばん いい ものを 一つ えらんで ください。',
  l3: 'もんだい3では、えを 見ながら しつもんを 聞いて ください。やじるし（→）の 人は 何と 言いますか。1から3の 中から、いちばん いい ものを 一つ えらんで ください。',
  l4: 'もんだい4では、えなどが ありません。ぶんを 聞いて、1から3の 中から、いちばん いい へんじを 一つ えらんで ください。'
};
const uline = s => `<u style="text-decoration-color:var(--rose);text-underline-offset:5px">${esc(s)}</u>`;
function shuf4(opts, correct = 0) { const o = shuffle(opts.map((x, i) => ({ x, ok: i === correct }))); return { o: o.map(z => z.x), a: o.findIndex(z => z.ok) }; }
function vocabSentences() {
  return V.filter(v => v.lv !== 'S2' && hasKanji(v.w) && [...v.w].every(c => !hasKanji(c) || KSET.has(c)) && stripFuri(v.ex).includes(v.w));
}
function buildExam() {
  const vs = shuffle(vocabSentences());
  let vi = 0; const takeV = n => vs.slice(vi, vi += n);
  const m1 = takeV(7).map(v => { const s = stripFuri(v.ex); const r = shuf4([v.r, ...readingFakes(v.r)]); return { html: esc(s).replace(esc(v.w), uline(v.w)), o: r.o, a: r.a, key: 'v:' + v.id, cause: 'lectura', exp: `${v.w} = ${v.r} · ${v.es}` }; });
  const m2 = takeV(12).map(v => { const f = hyokiFakes(v.w); if (f.length < 3) return null; const s = stripFuri(v.ex); const r = shuf4([v.w, ...f]); return { html: esc(s).replace(esc(v.w), uline(v.r)), o: r.o, a: r.a, key: 'v:' + v.id, cause: 'lectura', exp: `${v.r} = ${v.w} · ${v.es}` }; }).filter(Boolean).slice(0, 5);
  const m3 = takeV(14).map(v => { const s = stripFuri(v.ex); const same = shuffle(V.filter(x => x.t === v.t && x.id !== v.id && x.lv !== 'S2' && x.w !== v.w && Math.abs(x.w.length - v.w.length) <= 1)).slice(0, 3).map(x => x.w); if (same.length < 3) return null; const r = shuf4([v.w, ...same]); return { html: esc(s).replace(esc(v.w), '（　　　）'), o: r.o, a: r.a, key: 'v:' + v.id, cause: 'significado', exp: `${v.w} (${v.r}) = ${v.es} · ${v.exes}` }; }).filter(Boolean).slice(0, 8);
  const m4 = shuffle(JL_IIKAE).slice(0, 4).map(([s, u, o, e]) => { const r = shuf4(o); return { html: esc(s).replace(esc(u), uline(u)), o: r.o, a: r.a, exp: e, cause: 'significado' }; });
  const m5 = shuffle(JL_YOUHOU).slice(0, 4).map(([w, o, e]) => { const r = shuf4(o); return { html: `<b style="font-size:22px">${esc(w)}</b>`, o: r.o, a: r.a, exp: e, cause: 'significado', long: 1 }; });
  const meta = /形は|語は|の命令形|なさい形|ば形|禁止形|受身形|のカジュアル/;
  const g1 = shuffle(G.filter(g => g.k === 'F' && !meta.test(g.q))).slice(0, 13).map(g => { const r = shuf4(g.o, g.a); return { html: esc(g.q).replace('（　）', '（　　　）'), o: r.o, a: r.a, key: 'g:' + g.id, cause: 'gramática', exp: g.e + ' ' + g.tr }; });
  const g2 = shuffle(G.filter(g => g.k === 'S')).slice(0, 4).map(g => { const ord = shuffle([0, 1, 2, 3]); const slots = [0, 1, 2, 3].map(i => i === g.st ? '＿★＿' : '＿＿＿').join(' '); return { html: `${esc(g.pre)} ${slots} ${esc(g.post)}`, o: ord.map(i => g.pc[i]), a: ord.indexOf(g.st), key: 'g:' + g.id, cause: 'gramática', exp: g.pre + g.pc.join('') + g.post + ' · ' + g.e }; });
  const B = pick(JL_BUNSHOU);
  const g3 = B.q.map(([o, a], i) => { const r = shuf4(o, a); return { html: `（${i + 1}）`, o: r.o, a: r.a, cause: 'gramática', exp: B.es }; });
  const r4 = shuffle(JL_TANBUN).slice(0, 3).map((t, i) => { const r = shuf4(t.o); return { pre: `<div class="jl-text">${esc(t.text).replace(/\n/g, '<br>')}</div>`, html: esc(t.q), o: r.o, a: r.a, cause: 'significado', exp: t.e, long: 1 }; });
  const C = pick(JL_CHUUBUN);
  const r5 = C.qs.map((q, i) => { const r = shuf4(q.o); return { pre: i === 0 ? `<div class="jl-text">${esc(C.text).replace(/\n/g, '<br>')}</div>` : '', html: esc(q.q), o: r.o, a: r.a, cause: 'significado', exp: q.e, long: 1 }; });
  const r6 = JL_JOUHOU.slice(0, 2).map(j => { const r = shuf4(j.o); return { pre: `<div class="jl-text"><b>${esc(j.title)}</b><br>${esc(j.text).replace(/\n/g, '<br>')}</div>`, html: esc(j.q), o: r.o, a: r.a, cause: 'significado', exp: j.e, long: 1 }; });
  const l1 = shuffle(JL_KADAI).slice(0, 8).map(x => { const r = shuf4(x.o); return { kind: 'l1', x, o: r.o, a: r.a, cause: 'significado', exp: x.e }; });
  const l2 = shuffle(JL_POINT).slice(0, 7).map(x => { const r = shuf4(x.o); return { kind: 'l2', x, o: r.o, a: r.a, cause: 'significado', exp: x.e }; });
  const l3 = shuffle(JL_HATSUWA).slice(0, 5).map(x => { const r = shuf4(x.o); return { kind: 'l3', x, o: r.o, a: r.a, cause: 'significado', exp: x.e, audioOpts: 1 }; });
  const l4 = shuffle(JL_SOKUJI).slice(0, 8).map(x => { const r = shuf4(x.o); return { kind: 'l4', x, o: r.o, a: r.a, cause: 'significado', exp: x.e, audioOpts: 1 }; });
  return [
    { id: 'moji', name: '言語知識（文字・語彙）', min: 25, mondai: [['もんだい1', JL_INST.m1, m1], ['もんだい2', JL_INST.m2, m2], ['もんだい3', JL_INST.m3, m3], ['もんだい4', JL_INST.m4, m4], ['もんだい5', JL_INST.m5, m5]] },
    { id: 'bunpo', name: '言語知識（文法）・読解', min: 55, mondai: [['もんだい1', JL_INST.g1, g1], ['もんだい2', JL_INST.g2, g2], ['もんだい3', JL_INST.g3, g3, `<div class="jl-text"><b>${esc(B.t)}</b><br>${esc(B.text)}</div>`], ['もんだい4', JL_INST.r4, r4], ['もんだい5', JL_INST.r5, r5], ['もんだい6', JL_INST.r6, r6]] },
    { id: 'choukai', name: '聴解', min: 35, listen: 1, mondai: [['もんだい1', JL_INST.l1, l1], ['もんだい2', JL_INST.l2, l2], ['もんだい3', JL_INST.l3, l3], ['もんだい4', JL_INST.l4, l4]] }
  ];
}
let EX = null;
function openFinal() {
  header();
  const last = S.finals.slice(-5).reverse();
  stage().innerHTML = `<div class="col"><button class="btn ghost" id="mb">← Volver</button><h1 class="h-title">La Prueba Final</h1>
  <div class="panel col"><div class="lbl">Simulacro JLPT N4 · formato oficial vigente (desde 2020)</div>
  <div class="tblwrap"><table class="tbl"><tr><th>Sección</th><th>Tiempo</th><th>Preguntas</th></tr>
  <tr><td>言語知識（文字・語彙）</td><td>25 min</td><td>漢字読み 7 · 表記 5 · 文脈規定 8 · 言い換え 4 · 用法 4</td></tr>
  <tr><td>言語知識（文法）・読解</td><td>55 min</td><td>文法形式 13 · 組み立て 4 · 文章の文法 4 · 短文 3 · 中文 3 · 情報検索 2</td></tr>
  <tr><td>聴解</td><td>35 min</td><td>課題理解 8 · ポイント理解 7 · 発話表現 5 · 即時応答 8</td></tr></table></div>
  <p style="margin:0;font-size:14px" class="mute">Como el examen real: instrucciones en japonés, sin furigana en las partes de kanji, hoja de respuestas, puedes volver atrás dentro de la sección, y no ves nada corregido hasta entregar. En 聴解 cada audio suena una sola vez. Puntuación: 言語知識・読解 /120 y 聴解 /60. Para aprobar (合格) hacen falta 90/180 en total, ≥38 y ≥19 por sección.</p>
  <p style="margin:0;font-size:13px" class="mute">Las preguntas son originales, escritas en el formato oficial. Los exámenes reales no se publican de forma libre y tienen derechos de autor. Los ejemplos oficiales están en jlpt.jp (問題例) y en el 公式問題集 de la Japan Foundation.</p>
  <button class="btn pri block" id="fs">Empezar examen completo</button>
  <div class="grid3"><button class="btn" data-sec="0">Solo 文字・語彙</button><button class="btn" data-sec="1">Solo 文法・読解</button><button class="btn" data-sec="2">Solo 聴解</button></div></div>
  ${last.length ? `<div class="panel tblwrap"><div class="lbl">Intentos anteriores</div><table class="tbl"><tr><th>Fecha</th><th>Total</th><th>言語・読解</th><th>聴解</th><th></th></tr>${last.map(f => `<tr><td>${new Date(f.t).toLocaleDateString('es')}</td><td>${f.tot ?? '-'}/180</td><td>${f.lr ?? '-'}</td><td>${f.li ?? '-'}</td><td class="${f.pass ? 'acid' : 'red'}">${f.pass ? '合格' : '不合格'}</td></tr>`).join('')}</table></div>` : ''}</div>`;
  $('#mb').onclick = render;
  $('#fs').onclick = () => startExam([0, 1, 2]);
  $$('[data-sec]').forEach(b => b.onclick = () => startExam([+b.dataset.sec]));
}
function startExam(secs) {
  const all = buildExam();
  EX = { all, secs, si: 0, ans: all.map(s => s.mondai.map(m => m[2].map(() => -1))), res: [] };
  document.body.classList.add('inq'); stage().classList.remove('noscroll');
  SND.stop(); runSection();
}
function runSection() {
  const sec = EX.all[EX.secs[EX.si]];
  EX.end = Date.now() + sec.min * 60000;
  clearInterval(EX.tick);
  if (sec.listen) return runListening(sec);
  let n = 0;
  stage().innerHTML = `<div class="col jl">
    <div class="jl-bar"><span class="jl-sec">${esc(sec.name)}</span><span class="num" id="jlt"></span><span class="mute num" id="jlc"></span></div>
    ${sec.mondai.map(([t, inst, items, pre], mi) => `<section class="panel col"><div class="jl-mon">${t}</div><div class="jl-inst">${esc(inst)}</div>${pre || ''}
      ${items.map((q, qi) => { n++; return `${q.pre || ''}<div class="jl-q" id="q${mi}_${qi}"><div class="jl-qt"><span class="jl-n">${n}</span> ${q.html}</div>
        <div class="jl-opts ${q.long || q.o.some(o => o.length > 12) ? 'one' : ''}">${q.o.map((o, oi) => `<button class="jl-o" data-m="${mi}" data-q="${qi}" data-o="${oi}"><span class="jl-b">${oi + 1}</span><span>${esc(o)}</span></button>`).join('')}</div></div>`; }).join('')}
    </section>`).join('')}
    <div class="panel col"><div class="lbl">Hoja de respuestas</div><div class="jl-sheet" id="sheet"></div><button class="btn pri block" id="sub">解答を提出（entregar）</button><div id="subc"></div></div></div>`;
  const paintSheet = () => {
    let k = 0; $('#sheet').innerHTML = sec.mondai.map((m, mi) => m[2].map((q, qi) => { k++; const a = EX.ans[EX.secs[EX.si]][mi][qi]; return `<a href="#q${mi}_${qi}" class="jl-s ${a >= 0 ? 'on' : ''}">${k}<b>${a >= 0 ? a + 1 : '·'}</b></a>`; }).join('')).join('');
    const tot = sec.mondai.reduce((a, m) => a + m[2].length, 0), done = EX.ans[EX.secs[EX.si]].flat().filter(x => x >= 0).length;
    $('#jlc').textContent = done + '/' + tot;
  };
  $$('.jl-o').forEach(b => b.onclick = () => {
    const mi = +b.dataset.m, qi = +b.dataset.q; EX.ans[EX.secs[EX.si]][mi][qi] = +b.dataset.o;
    $$(`.jl-o[data-m="${mi}"][data-q="${qi}"]`).forEach(x => x.classList.toggle('sel', x === b)); paintSheet(); touchActivity();
  });
  $$('.jl-sheet').forEach(sh => sh.onclick = e => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); const t = $(a.getAttribute('href')); t && t.scrollIntoView({ block: 'center' }); });
  $('#sub').onclick = () => {
    const left = EX.ans[EX.secs[EX.si]].flat().filter(x => x < 0).length;
    $('#subc').innerHTML = `<p class="${left ? 'red' : 'mute'}" style="margin:8px 0">${left ? `Te faltan ${left} respuestas. ` : ''}Al entregar ya no puedes cambiar esta sección.</p><button class="btn pri block" id="suby">Sí, entregar</button>`;
    $('#suby').onclick = finishSection;
  };
  paintSheet();
  const tick = () => { const ms = EX.end - Date.now(); const t = $('#jlt'); if (t) { t.textContent = fmtTime(ms); t.classList.toggle('red', ms < 5 * 60000); } if (ms <= 0) { toast('Tiempo terminado: se entrega la sección.'); finishSection(); } };
  tick(); EX.tick = setInterval(tick, 1000);
  stage().scrollTop = 0;
}
// ---- 聴解: suena una vez, sin volver atrás
function sayLines(lines, done) {
  if (!('speechSynthesis' in window)) { done(); return; }
  speechSynthesis.cancel(); let i = 0;
  const next = () => {
    if (EX && EX.stopAudio) return;
    if (i >= lines.length) return done();
    const [who, text] = lines[i++];
    const u = new SpeechSynthesisUtterance(text.replace(/\s+/g, '')); u.lang = 'ja-JP'; if (TTS.voice) u.voice = TTS.voice;
    u.rate = 0.92; u.pitch = who === 'M' ? 0.75 : who === 'F' ? 1.35 : 1; u.volume = clamp(S.cfg.vol / 100, 0.3, 1);
    u.onend = () => setTimeout(next, 450); u.onerror = () => setTimeout(next, 300);
    speechSynthesis.speak(u);
  };
  next();
}
function runListening(sec) {
  const flat = []; sec.mondai.forEach(([t, inst, items], mi) => items.forEach((q, qi) => flat.push({ t, inst, q, mi, qi, first: qi === 0 })));
  let idx = 0;
  const tick = () => { const ms = EX.end - Date.now(); const t = $('#jlt'); if (t) t.textContent = fmtTime(ms); if (ms <= 0) { EX.stopAudio = 1; speechSynthesis.cancel(); finishSection(); } };
  EX.tick = setInterval(tick, 1000);
  const show = () => {
    if (idx >= flat.length) return finishSection();
    const it = flat[idx], q = it.q, x = q.x; EX.stopAudio = 0;
    const optsShown = !q.audioOpts;
    stage().innerHTML = `<div class="col jl"><div class="jl-bar"><span class="jl-sec">${esc(sec.name)}</span><span class="num" id="jlt"></span><span class="mute num">${idx + 1}/${flat.length}</span></div>
      <section class="panel col"><div class="jl-mon">${it.t}</div><div class="jl-inst">${esc(it.inst)}</div>
      <div class="jl-qt"><span class="jl-n">${idx + 1}</span> ${q.kind === 'l3' ? `<span class="mute">（えの かわりに）</span> ${esc(x.sit)}` : q.kind === 'l4' ? '<span class="mute">（ぶんを 聞いて ください）</span>' : esc(x.q)}</div>
      ${optsShown ? `<div class="jl-opts one">${q.o.map((o, oi) => `<button class="jl-o" data-o="${oi}"><span class="jl-b">${oi + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>`
        : `<div class="jl-opts">${q.o.map((o, oi) => `<button class="jl-o" data-o="${oi}"><span class="jl-b">${oi + 1}</span><span class="mute">(audio)</span></button>`).join('')}</div>`}
      <div class="mono mute" id="lst" style="font-size:13px">▶ escuchando…</div>
      ${!TTS.ok ? `<details><summary class="mute">Sin voz japonesa en este dispositivo: ver transcripción</summary><div class="jl-text">${esc(transcript(q)).replace(/\n/g, '<br>')}</div></details>` : ''}
      <button class="btn block" id="lnx">Siguiente →</button></section></div>`;
    tick();
    $$('.jl-o').forEach(b => b.onclick = () => { EX.ans[EX.secs[EX.si]][it.mi][it.qi] = +b.dataset.o; $$('.jl-o').forEach(z => z.classList.toggle('sel', z === b)); });
    $('#lnx').onclick = () => { EX.stopAudio = 1; speechSynthesis.cancel(); idx++; show(); };
    const lines = q.kind === 'l1' || q.kind === 'l2' ? [['N', x.pre], ...x.d, ['N', x.q]] : q.kind === 'l3' ? [['N', x.sit], ...q.o.map((o, i) => ['N', (i + 1) + '、' + o])] : [x.s, ...q.o.map((o, i) => [x.s[0] === 'M' ? 'F' : 'M', (i + 1) + '、' + o])];
    sayLines(lines, () => { const l = $('#lst'); if (l) l.textContent = 'Fin del audio. Elige y pulsa Siguiente.'; });
  };
  show();
}
function transcript(q) { const x = q.x; if (q.kind === 'l1' || q.kind === 'l2') return [x.pre, ...x.d.map(d => (d[0] === 'M' ? '男：' : '女：') + d[1]), x.q].join('\n'); if (q.kind === 'l3') return q.o.map((o, i) => (i + 1) + '. ' + o).join('\n'); return [x.s[1], ...q.o.map((o, i) => (i + 1) + '. ' + o)].join('\n'); }
function finishSection() {
  if (!EX || EX.finishing) return; EX.finishing = 1; clearInterval(EX.tick); EX.stopAudio = 1; try { speechSynthesis.cancel(); } catch (e) { }
  const sid = EX.secs[EX.si], sec = EX.all[sid];
  let ok = 0, n = 0; const per = [];
  sec.mondai.forEach(([t, , items], mi) => { let o = 0; items.forEach((q, qi) => { const a = EX.ans[sid][mi][qi]; const good = a === q.a; if (good) o++; if (q.key) grade(q.key, 'f', good, good ? 4000 : 20000, a < 0 ? 'tiempo' : q.cause); }); ok += o; n += items.length; per.push([t, o, items.length]); });
  EX.res[sid] = { ok, n, per };
  EX.si++; EX.finishing = 0;
  if (EX.si < EX.secs.length) {
    stage().innerHTML = `<div class="col"><div class="panel col" style="text-align:center"><div class="lbl">Sección entregada</div><div class="h-sec">${esc(sec.name)}</div><p class="mute" style="margin:0">Siguiente: ${esc(EX.all[EX.secs[EX.si]].name)} · ${EX.all[EX.secs[EX.si]].min} min</p><button class="btn pri block" id="nxs">Empezar siguiente sección</button></div></div>`;
    $('#nxs').onclick = runSection; save(); return;
  }
  examResults();
}
function examResults() {
  const R = EX.res, has = i => !!R[i];
  const lrN = (has(0) ? R[0].n : 0) + (has(1) ? R[1].n : 0), lrOk = (has(0) ? R[0].ok : 0) + (has(1) ? R[1].ok : 0);
  const lr = lrN ? Math.round(lrOk / lrN * 120) : null, li = has(2) ? Math.round(R[2].ok / R[2].n * 60) : null;
  const full = EX.secs.length === 3;
  const tot = full ? lr + li : null;
  const pass = full ? (tot >= 90 && lr >= 38 && li >= 19) : null;
  const allN = R.reduce((a, r) => a + (r ? r.n : 0), 0), allOk = R.reduce((a, r) => a + (r ? r.ok : 0), 0), pct = Math.round(allOk / allN * 100);
  if (full) S.finals.push({ t: Date.now(), tot, lr, li, pass, pct });
  if (full && !pass) mirror('final', { pct }); else if (pct === 100) mirror('perfecto'); else if (pct >= 95) mirror('casi', { pct }); else mirror('errores', { n: allN - allOk });
  const tk = todayKey(); if (S.lastDay !== tk) { const y = todayKey(new Date(Date.now() - DAY)); S.streak = S.lastDay === y ? S.streak + 1 : 1; S.lastDay = tk; }
  save(true);
  // revisión de errores
  let rev = '', k = 0;
  EX.secs.forEach(sid => { const sec = EX.all[sid]; k = 0; sec.mondai.forEach(([t, , items], mi) => items.forEach((q, qi) => { k++; const a = EX.ans[sid][mi][qi]; if (a === q.a) return; rev += `<div class="jl-rev"><div class="lbl">${esc(sec.name)} · ${t} · ${k}</div><div class="jl-qt">${q.html || esc(q.kind === 'l3' ? q.x.sit : q.kind === 'l4' ? q.x.s[1] : q.x.q)}</div><div>Tu respuesta: <span class="red">${a >= 0 ? esc(q.o[a]) : 'sin responder'}</span></div><div>Correcta: <b class="acid">${esc(q.o[q.a])}</b></div><div class="mute" style="font-size:14px">${esc(q.exp || '')}</div></div>`; })); });
  stage().innerHTML = `<div class="col"><h1 class="h-title">Resultado</h1>
    <div class="panel col">${full ? `<div class="integ"><div class="big num">${tot}<span class="mute" style="font-size:22px">/180</span></div><div style="padding-bottom:6px;font-weight:800;font-size:20px" class="${pass ? 'acid' : 'red'}">${pass ? '合格' : '不合格'}</div></div>` : ''}
    <div class="tblwrap"><table class="tbl"><tr><th>Sección</th><th>Aciertos</th><th>Puntos</th></tr>
    ${has(0) || has(1) ? `<tr><td>言語知識・読解</td><td>${lrOk}/${lrN}</td><td>${lr}/120 ${lr < 38 ? '<span class="red">(&lt;38)</span>' : ''}</td></tr>` : ''}
    ${has(2) ? `<tr><td>聴解</td><td>${R[2].ok}/${R[2].n}</td><td>${li}/60 ${li < 19 ? '<span class="red">(&lt;19)</span>' : ''}</td></tr>` : ''}</table></div>
    <div class="tblwrap"><table class="tbl"><tr><th>もんだい</th><th>Aciertos</th></tr>${EX.secs.map(sid => R[sid].per.map(([t, o, n]) => `<tr><td>${esc(EX.all[sid].name)} · ${t}</td><td class="${o === n ? 'acid' : ''}">${o}/${n}</td></tr>`).join('')).join('')}</table></div>
    <div class="mono mute" style="font-size:12px">Aciertos totales: ${pct}%. Puntuación aproximada (el JLPT real usa escala equiparada).</div></div>
    ${logHTML()}
    ${rev ? `<h2 class="h-sec">Revisión de errores</h2><div class="panel col">${rev}</div>` : '<div class="panel acid">Sin errores.</div>'}
    <div class="grid2"><button class="btn pri" id="again">Nuevo simulacro</button><button class="btn" id="home">Volver</button></div></div>`;
  $('#again').onclick = openFinal; $('#home').onclick = () => { document.body.classList.remove('inq'); EX = null; render(); };
  stage().scrollTop = 0;
}
