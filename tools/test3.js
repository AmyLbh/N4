// Prueba rápida de lo añadido con el libro completo (semanas 1-6)
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const SP = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 380, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + SP + '/shots/page.html'); await p.waitForTimeout(2300);
  const shot = n => p.screenshot({ path: SP + '/shots/t3_' + n + '.png' });
  const out = {};
  out.counts = await p.evaluate(() => { S.cfg.setup = 1; S.cfg.exam = '2026-11-17'; QUEUE.slice(0, 900).forEach(introduce); save(); setTab('hoy');
    return { G: G.length, byW: [1, 2, 3, 4].map(w => G.filter(g => g.w === w).length), pts: GPTS.length, introP: S.intro.filter(k => k.startsWith('p:')).length, reads: READINGS.length, tadou: TADOU.length, kadai: JL_KADAI.length, missingPt: G.filter(g => !PTS[g.pt]).length }; });
  async function play(maxQ) {
    let n = 0;
    while (n < maxQ) {
      const has = await p.evaluate(() => !!(SES && !SES.done && !SES.answered && document.querySelector('.opt')));
      if (!has) break;
      const ans = await p.evaluate(() => SES.q.ans); const bs = await p.$$('.opt'); await bs[n % 3 === 1 ? (ans + 1) % bs.length : ans].click();
      await p.waitForTimeout(60); const nx = await p.$('#nx'); if (nx) await nx.click(); await p.waitForTimeout(50); n++;
    }
    await p.evaluate(() => { if (SES) SES.done = true; render(); });
    return n;
  }
  // gramática: semana 4
  await p.evaluate(() => openMode('gram')); await p.click('.chip[data-g=gw][data-v="4"]'); out.w4chips = await p.$$eval('#ptbox .chip', c => c.length); await shot('gram_w4');
  await p.click('#go'); out.gramQ = await p.evaluate(() => SES && SES.cfg.specs.map(s => GBY.get(s.id).w).join('')); await shot('gram_q'); out.gram = await play(10);
  // conjugador causativa
  await p.evaluate(() => openMode('conj')); for (const f of ['te', 'ta', 'nai']) await p.click(`.chip[data-g=forms][data-v=${f}]`);
  await p.click('.chip[data-g=forms][data-v=cau]'); await p.click('.chip[data-g=forms][data-v=caup]'); await p.click('#go'); await shot('conj'); out.conj = await play(10);
  out.conjCheck = await p.evaluate(() => [['書く', 'v1'], ['話す', 'v1'], ['言う', 'v1'], ['食べる', 'v2'], ['する', 'v3'], ['来る', 'v3']].map(([w, g]) => conj(w, g, 'cau') + '/' + conj(w, g, 'caup')).join(' '));
  // 他動詞
  await p.evaluate(() => openMode('tadou')); const go = await p.$('#go'); if (go) await go.click(); await shot('tadou'); out.tadou = await play(8);
  // lectura del libro
  await p.evaluate(() => openReading()); await shot('readlist'); await p.evaluate(() => { const i = READINGS.findIndex(r => r.id === 'b5'); document.querySelector(`[data-r="${i}"]`).click(); }); await p.waitForTimeout(100); await shot('read_b5'); out.read = await play(2);
  // biblioteca
  for (const w of [1, 3, 4, 5, 6, 0, 2]) { await p.evaluate(() => renderLibrary()); await p.click(`[data-lw="${w}"]`); await p.waitForTimeout(80); out['lib' + w] = await p.$eval('#libbox', e => e.textContent.length); if (w === 0 || w === 4) await shot('lib' + w); }
  // guardián y examen
  await p.evaluate(() => openGuard()); await shot('guard'); out.guardBtns = await p.$$eval('[data-w]', x => x.length);
  await p.evaluate(() => startExam([2])); await p.waitForTimeout(300); await shot('listen'); out.listen = await p.evaluate(() => EX.all[2].mondai.map(m => m[2].length).join('·'));
  await p.evaluate(() => { EX.stopAudio = 1; finishSection(); }); await p.waitForTimeout(200); await shot('listen_res');
  await p.evaluate(() => { document.body.classList.remove('inq'); EX = null; setTab('hoy'); }); await shot('hoy');
  await p.evaluate(() => setTab('stats')).catch(() => {}); await p.waitForTimeout(200);
  await p.reload(); await p.waitForTimeout(4000); out.persist = await p.evaluate(() => typeof S === 'undefined' ? 'noS' : S.intro.length);
  console.log(JSON.stringify(out, null, 1)); console.log('ERRORS', errs.length, errs.slice(0, 8).join('\n'));
  await b.close();
})();
