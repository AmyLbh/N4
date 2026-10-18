// Builds data.json for the app from the source lists + authored Spanish files.
const fs = require('fs'), path = require('path');
const kuromoji = require('kuromoji');
const B = path.join(__dirname, '../data/authored/'), SRC = path.join(__dirname, '../data/sources/'), OUT = path.join(__dirname, '../data/');
const kata2hira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const hasKanji = s => /[一-鿿々]/.test(s);

kuromoji.builder({ dicPath: __dirname + '/node_modules/kuromoji/dict' }).build((err, tk) => {
  if (err) throw err;
  // furigana markup: 漢字{かんじ}
  const NUM = require('./num.js');
  function align(s, r) {
    // split surface into kanji runs / kana runs and match against reading
    const parts = s.match(/[\u4e00-\u9fff々]+|[^\u4e00-\u9fff々]+/g);
    const re = new RegExp('^' + parts.map(p => hasKanji(p) ? '(.+?)' : '(' + kata2hira(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')').join('') + '$');
    const m = kata2hira(r).match(re);
    if (!m) return `${s}{${kata2hira(r)}}`;
    return parts.map((p, i) => hasKanji(p) ? `${p}{${m[i + 1]}}` : p).join('');
  }
  function furiK(text) {
    let out = '';
    for (const t of tk.tokenize(text)) {
      const s = t.surface_form;
      if (!hasKanji(s) || !t.reading || t.reading === '*') { out += s; continue; }
      out += align(s, t.reading);
    }
    return out;
  }
  const NRE = /(八百屋|万年筆|一緒|一生懸命|一昨日|一昨年|二十歳|十分(?=あ|で|な|に))|([一二三四五六七八九十百千万億]+)(か月|時間|週間|時半|時|日|人|分|年|回|階|歳|本|匹|杯|冊|台|個|軒|番|倍|点|円|月|枚|度|つ)?/g;
  function furi(text) {
    let out = '', last = 0, m;
    NRE.lastIndex = 0;
    while ((m = NRE.exec(text))) {
      if (m[1]) { // special words
        const sp = { 二十歳: 'はたち', 十分: 'じゅうぶん' }[m[1]];
        if (!sp) continue;
        out += furiK(text.slice(last, m.index)) + `${m[1]}{${sp}}`; last = m.index + m[0].length; continue;
      }
      // skip when part of a bigger kanji word (e.g. 一番 handled by counter, 万年筆 above)
      const n = NUM.parse(m[2]); const c = m[3] || '';
      out += furiK(text.slice(last, m.index)) + (c === 'つ' ? `${m[2]}{${NUM.counter(n, c).slice(0, -1)}}つ` : `${m[2]}${c}{${NUM.counter(n, c)}}`);
      last = m.index + m[0].length;
    }
    return out + furiK(text.slice(last));
  }
  // overrides for known kuromoji misreadings in short sentences
  const FIX = [['一日{いちにち}に', '一日{いちにち}に'], ['何{なん}を', '何{なに}を'], ['何{なん}が', '何{なに}が'], ['日本{にっぽん}', '日本{にほん}'], ['今日{こんにち}', '今日{きょう}'], ['私{わたくし}', '私{わたし}'], ['上手{うわて}', '上手{じょうず}'], ['下手{しもて}', '下手{へた}'], ['大人{だいにん}', '大人{おとな}'], ['一人{いちにん}', '一人{ひとり}'], ['二人{ふたり}', '二人{ふたり}'], ['明日{あす}', '明日{あした}'], ['昨日{さくじつ}', '昨日{きのう}'], ['何{なん}時', '何{なん}時'], ['方{ほう}は', '方{かた}は'], ['風邪{ふうじゃ}', '風邪{かぜ}'], ['お腹{おなか}', 'お腹{なか}'], ['紅茶{こうちゃ}', '紅茶{こうちゃ}'], ['入口{いりぐち}', '入口{いりぐち}'], ['一緒{いっしょ}', '一緒{いっしょ}'], ['十{じゅう}に', '十{とお}に'], ['この間{かん}', 'この間{あいだ}'], ['四月{しがつ}一日{いちにち}', '四月{しがつ}一日{ついたち}'], ['一月{いちがつ}に一回', '一月{ひとつき}に一回'], ['十{じゅう}になりました', '十{とお}になりました'], ['お腹{なか}', 'お腹{なか}'], ['一日{いちにち}中{なか}', '一日中{いちにちじゅう}'], ['行{おこな}っ', '行{い}っ'], ['角{かく}を', '角{かど}を'], ['間{ま}、', '間{あいだ}、'], ['今{こん}会議', '今{いま}会議'], ['洗濯{せんたく}物{ぶつ}', '洗濯物{せんたくもの}'], ['木{こ}の葉', '木{き}の葉'], ['誕生{たんじょう}日{び}', '誕生日{たんじょうび}']];
  const fixF = s => { for (const [a, b] of FIX) s = s.split(a).join(b); return s; };

  const base = JSON.parse(fs.readFileSync(SRC + 'voc_pos.json'));
  const es = {};
  for (const f of ['es_01.txt', 'es_02.txt', 'es_03.txt', 'es_04.txt'])
    for (const line of fs.readFileSync(B + f, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      const p = line.split('|'); es[+p[0]] = p;
    }
  const missing = base.filter(v => !es[v.id]).map(v => v.id);
  if (missing.length) console.error('MISSING es', missing);
  const vocab = [];
  const seen = new Map();
  for (const v of base) {
    const p = es[v.id]; if (!p) continue;
    let w = v.w, r = v.r;
    const fix = p[6] || '';
    for (const kv of fix.split(';').filter(Boolean)) { const [k, val] = kv.split('='); if (k === 'w') w = val; if (k === 'r') r = val; }
    r = r.replace(/\s*\(する\)\s*/, '').replace(/^\(〜を\)\s*/, '');
    if (r.endsWith('する') && !w.endsWith('する')) r = r.slice(0, -2);
    if (!r) r = w;
    // show only first alternative spelling but keep alternatives
    const wMain = w.split(/;\s*/)[0].replace(/^～/, '〜'), rMain = r.split(/;\s*/)[0].replace(/^～/, '〜');
    const conf = v.src.includes('B') || v.src.includes('B~');
    const key = wMain + '|' + rMain;
    if (seen.has(key)) continue; seen.set(key, 1);
    vocab.push({ id: v.id, w: wMain, wa: w.includes(';') ? w : '', r: rMain, es: p[1], t: p[2], th: p[3], lv: v.lv, ok: conf ? 1 : 0, en: v.en, ex: fixF(furi(p[4])), exes: p[5] });
  }
  // S2 tags + extras
  let nextId = 2000; const s2 = new Set();
  for (const line of fs.readFileSync(B + 's2.txt', 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const p = line.split('|');
    const hit = vocab.find(v => v.w === p[0] || v.wa.split(/;\s*/).includes(p[0]) || (p[0].length > 1 && v.r === p[0] && !hasKanji(v.w)));
    if (hit) { s2.add(hit.id); continue; }
    if (p.length < 7) { console.error('S2 not found', p[0]); continue; }
    const id = nextId++;
    vocab.push({ id, w: p[0], wa: '', r: p[1], es: p[2], t: p[3], th: p[4], lv: 'S2', ok: 2, en: '', ex: fixF(furi(p[5])), exes: p[6] });
    s2.add(id);
  }
  vocab.forEach(v => { v.wk = s2.has(v.id) ? 2 : 0; });

  // kanji
  const kb = JSON.parse(fs.readFileSync(SRC + 'kanji_base.json'));
  const kes = {};
  for (const line of fs.readFileSync(B + 'kanji_es.txt', 'utf8').split('\n')) { if (!line.trim()) continue; const p = line.split('|'); kes[p[0]] = p; }
  const kset = new Set(kb.map(k => k.k));
  const kanji = kb.map(k => {
    const p = kes[k.k]; if (!p) console.error('no kanji es', k.k);
    let exs = vocab.filter(v => v.w.includes(k.k) && v.lv !== 'S2' && [...v.w].every(c => !hasKanji(c) || kset.has(c)))
      .sort((a, b) => (a.lv === b.lv ? 0 : a.lv === 'N5' ? -1 : 1) || a.w.length - b.w.length).slice(0, 3).map(v => v.id);
    const XW = { 京: [['東京', 'とうきょう', 'Tokio']], 田: [['田中', 'たなか', 'Tanaka (apellido)'], ['田んぼ', 'たんぼ', 'arrozal']], 的: [['目的', 'もくてき', 'objetivo']], 公: [['公園', 'こうえん', 'parque']], 県: [['県', 'けん', 'prefectura']], 可: [['可愛い', 'かわいい', 'bonito, mono']], 身: [['出身', 'しゅっしん', 'lugar de origen']], 友: [['友達', 'ともだち', 'amigo'], ['友人', 'ゆうじん', 'amigo (formal)']] };
    if (!exs.length) { const any = vocab.filter(v => v.w.includes(k.k) && v.lv !== 'S2').slice(0, 3).map(v => v.id); exs.push(...any); }
    return { xw: exs.length ? [] : (XW[k.k] || []), k: k.k, lv: k.lv, on: k.on.slice(0, 3).map(kata2hira).map(s => s), onK: k.on.slice(0, 3), kun: k.kun.filter(x => !x.startsWith('-') && !x.endsWith('-')).slice(0, 3), es: p ? p[1] : k.es.join(', '), mn: p ? p[2] : '', esK: k.es.slice(0, 3), st: k.st, src: k.src, ok: k.src.length >= 2 ? 1 : 0, ex: exs };
  });
  // grammar
  const grammar = [];
  let gi = 0;
  for (const line of fs.readFileSync(B + 'grammar.txt', 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const p = line.split('|'); const id = 'g' + (++gi);
    if (p[0] === 'F') grammar.push({ id, k: 'F', pt: p[1], q: p[2], o: p[3].split(';'), a: +p[4] - 1, e: p[5], tr: p[6], f: p[7] || '' });
    else grammar.push({ id, k: 'S', pt: p[1], pre: p[2], post: p[3], pc: p[4].split(';'), st: +p[5] - 1, e: p[6], tr: p[7], f: p[8] || '' });
  }
  // lecturas: furigana precomputado
  const vm = require('vm'); const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(B + 'extra.js', 'utf8') + ';this.R=READINGS;', ctx);
  const rfuri = {}; for (const r of ctx.R) rfuri[r.text] = fixF(furi(r.text));
  const cov = { kOk: kanji.filter(k => k.ok).length, vOk: vocab.filter(v => v.ok === 1).length, vRev: vocab.filter(v => v.ok === 0).length, vS2: vocab.filter(v => v.lv === 'S2').length };
  const out = { vocab, kanji, grammar, rfuri, cov, built: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync(OUT + 'data.json', JSON.stringify(out));
  const confirmed = vocab.filter(v => v.ok === 1).length;
  console.log(JSON.stringify({ vocab: vocab.length, vN5: vocab.filter(v => v.lv === 'N5').length, vN4: vocab.filter(v => v.lv === 'N4').length, vS2extra: vocab.filter(v => v.lv === 'S2').length, s2: s2.size, confirmed, revisar: vocab.filter(v => v.ok === 0).length, kanji: kanji.length, kOk: kanji.filter(k => k.ok).length, kNoEx: kanji.filter(k => !k.ex.length).map(k => k.k).join(''), grammar: grammar.length, size: JSON.stringify(out).length }));
});
