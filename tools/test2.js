const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch();
  const W = +process.argv[2] || 380, H = +process.argv[3] || 760;
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + e.stack)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file:///tmp/claude-0/-home-user-N4/351a78dc-ee4f-583b-83ed-a3c4246810e9/scratchpad/shots/page.html');
  await p.waitForTimeout(2300);
  const shot = n => p.screenshot({ path: '/tmp/claude-0/-home-user-N4/351a78dc-ee4f-583b-83ed-a3c4246810e9/scratchpad/shots/' + W + '_' + n + '.png' });
  await p.evaluate(() => { S.cfg.setup = 1; S.cfg.exam = '2026-11-17'; QUEUE.slice(0, 400).forEach(introduce); save(); setTab('hoy'); });
  async function play(maxQ = 30, wrongEvery = 4, shotName) {
    let n = 0;
    while (n < maxQ) {
      const has = await p.evaluate(() => !!(SES && !SES.done && !SES.answered && (document.querySelector('.opt') || document.querySelector('#ti'))));
      if (!has) { const nx = await p.$('#nx'); if (nx) { await nx.click(); await p.waitForTimeout(60); continue; } break; }
      const typ = await p.$('#ti');
      if (typ) { const a = await p.evaluate(() => SES.q.answers[0]); await typ.fill(n % wrongEvery === 1 ? 'xx' : a); await p.click('#tok'); }
      else { const ans = await p.evaluate(() => SES.q.ans); const bs = await p.$$('.opt'); await bs[n % wrongEvery === 1 ? (ans + 1) % bs.length : ans].click(); }
      await p.waitForTimeout(80);
      if (shotName && n === 1) await shot(shotName);
      const nx = await p.$('#nx'); if (nx) await nx.click(); else await p.waitForTimeout(500);
      await p.waitForTimeout(60); n++;
    }
    return n;
  }
  const res = {};
  let hc = 0;
  async function home() { hc++; const h = await p.$('#home'); if (h) { await h.click(); return; } await shot('fail' + hc); console.log('NO HOME at', hc, await p.evaluate(() => JSON.stringify({ i: SES && SES.i, done: SES && SES.done, ans: SES && SES.answered, n: SES && SES.cfg.specs && SES.cfg.specs.length, mode: SES && SES.cfg.mode }))); await p.evaluate(() => { if (SES) SES.done = true; render(); }); }
  // kanji
  await p.evaluate(() => openMode('kanji')); await p.click('#go'); res.kanji = await play(15, 4, 'kanji');
  await shot('kanji_end'); await home();
  // vocab typing
  await p.evaluate(() => openMode('vocab')); await p.click('.chip[data-g=typing][data-v=yes]'); await p.click('.chip[data-g=dir][data-v=b]'); await p.click('#go'); res.vocab = await play(15, 3, 'vocab');
  await home();
  await p.evaluate(() => openMode('gram')); await p.click('#go'); res.gram = await play(15, 3, 'gram'); await home();
  await p.evaluate(() => openMode('conj')); await p.click('.chip[data-g=forms][data-v=pas]'); await p.click('.chip[data-g=forms][data-v=imp]'); await p.click('#go'); res.conj = await play(15, 3, 'conj'); await home();
  await p.evaluate(() => openMode('part')); await p.click('#go'); res.part = await play(15, 3, 'part'); await home();
  await p.evaluate(() => openMode('cont')); await shot('cont_intro'); await p.click('#go'); res.cont = await play(15, 3, 'cont'); await home();
  await p.evaluate(() => openMode('read')); await p.click('[data-r="0"]'); res.read = await play(3, 2, 'read'); await shot('read_dbg'); console.log(await p.evaluate(()=>JSON.stringify({i:SES.i,done:SES.done,ans:SES.answered,n:SES.cfg.specs.length}))); await home();
  await p.evaluate(() => openMode('audio')); res.audio = await play(12, 2); await home();
  await p.evaluate(() => startRecord(10)); res.r10 = await play(10, 99, 'r10'); await shot('r10_end'); await home();
  await p.evaluate(() => startGhost()); res.ghost = await play(10, 99, 'ghost'); await home();
  await p.evaluate(() => startRecord(60)); res.r60 = await play(80, 6, 'r60'); await p.waitForTimeout(500); await shot('r60_end'); await home();
  await p.evaluate(() => startRoto()); res.roto = await play(20, 3); await shot('roto_end'); await home();
  await p.evaluate(() => renderCrypt()); await shot('crypt'); await p.click('#cg'); res.crypt = await play(10, 99); await home();
  await p.evaluate(() => openCards()); await p.click('#go'); await shot('cards'); await p.click('#card'); await p.waitForTimeout(100); await shot('cards_flip'); for (let i = 0; i < 4; i++) { await p.click(i % 2 ? '#cn' : '#cy'); await p.waitForTimeout(250); } await p.click('#cx');
  await p.evaluate(() => startWarm()); res.warm = await play(6, 3); await p.evaluate(() => { SES.clockLeft = 1; }); await p.waitForTimeout(300); await home();
  await p.evaluate(() => openFinal()); await shot('final'); await p.click('#fs'); res.final1 = await play(30, 5); await p.click('#again'); res.final2 = await play(30, 5); await p.click('#again'); res.final3 = await play(14, 5); await shot('final_end'); await home();
  await p.evaluate(() => startDiag()); res.diag = await play(30, 3); await home();
  await p.evaluate(() => setTab('hoy')); await shot('hoy');
  await p.evaluate(() => setTab('stats')); await shot('stats'); await p.evaluate(() => stage().scrollTop = 600); await shot('stats2'); await p.evaluate(() => stage().scrollTop = 1400); await shot('stats3');
  await p.evaluate(() => renderLibrary()); await shot('lib'); await p.evaluate(() => stage().scrollTop = 2500); await shot('lib2');
  await p.evaluate(() => renderSettings()); await shot('settings'); await p.click('#ex'); await p.waitForTimeout(200);
  await p.evaluate(() => setTab('examen')); await shot('examen');
  // persistence: reload and check
  const before = await p.evaluate(() => ({ intro: S.intro.length, rec: Object.keys(S.rec), crypt: Object.keys(S.crypt).length, xp: S.xp, r: readiness().pct, overflow: document.documentElement.scrollWidth > innerWidth }));
  await p.reload(); await p.waitForTimeout(2300);
  const after = await p.evaluate(() => ({ intro: S.intro.length, rec: Object.keys(S.rec), crypt: Object.keys(S.crypt).length, xp: S.xp, r: readiness().pct, tab: TAB }));
  console.log(JSON.stringify({ res, before, after }, null, 0));
  console.log(errs.slice(0, 10).join('\n') || 'no errors');
  await b.close();
})();
