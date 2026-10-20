// ================= SEMANAS (para añadir la Semana 3: copia este bloque como WEEKS[3]) =================
const WEEKS = {
  2: {
    n: 2, title: 'Semana 2 · 文法を勉強しましょう②',
    days: [
      { d: 1, t: '宿題をしなければいけません', s: 'obligación · permiso · prohibición · deseo', pts: ['oblig', 'permiso', 'nohace', 'prohib', 'deseo'] },
      { d: 2, t: '習ったことを忘れてしまいました', s: 'ておく · てしまう · てみる', pts: ['oku', 'shimau', 'miru'] },
      { d: 3, t: '教えてくれてありがとう', s: 'dar y recibir · keigo', pts: ['ageru', 'tekureru', 'keigo'] },
      { d: 4, t: '日記を書くようにしましょう', s: 'ため · ように', pts: ['tame', 'youni', 'youninaru', 'younisuru', 'youniiu'] },
      { d: 5, t: '日本語でどう言いますか', s: 'こそあど · という', pts: ['konna', 'kou', 'toiu'] },
      { d: 6, t: 'もっと勉強したほうがいいですよ', s: 'consejos · imperativo · なさい', pts: ['houga', 'meirei', 'nasai'] }
    ],
    points: {
      oblig: { name: 'Obligación', pat: 'Vなければならない · Vなくてはいけない · Vないと(いけない)', es: 'TENGO QUE V. Tu nota: one must · "si no lo hago, está mal". Casual: Vなきゃ / Vなくちゃ / Vないと.', ex: [['毎日{まいにち}、薬{くすり}を飲{の}まないといけない。', 'Cada día tengo que tomar la medicina.'], ['洗濯{せんたく}しなきゃ。', 'Tengo que lavar la ropa.']], tr: 'NO + NO = SÍ: ない pegado al verbo + いけない = tengo que.' },
      permiso: { name: 'Permiso', pat: 'Vてもいい', es: 'SE PUEDE V · "está bien" · can I?', ex: [['これ、すててもいいですか。', '¿Puedo tirar esto?']], tr: 'て + も + いい = permiso.' },
      nohace: { name: 'No hace falta', pat: 'Vなくてもいい', es: 'NO HACE FALTA V · no hay necesidad · you don’t have to. OJO: 来{こ}なくても, NUNCA 来ないでも.', ex: [['今日{きょう}じゃなくてもいいです。', 'No tiene que ser hoy.']], tr: 'なくて + も + いい = no hace falta.' },
      prohib: { name: 'Prohibición', pat: 'Vてはいけない', es: 'PROHIBIDO V · no se debe (establecimientos, prohibiciones) · don’t / can’t.', ex: [['テストのとき、ペンを使{つか}ってはいけません。', 'En el examen no se puede usar bolígrafo.']], tr: 'Verbo normal + ては + いけない = prohibido.' },
      deseo: { name: 'Deseo / consejo', pat: 'Vといい · Vたらいい · Vばいい', es: 'OJALÁ / ESTARÍA BIEN QUE (deseo) · you should (consejo). Tu regla: と = ojalá, たら/ば = debería.', ex: [['雨{あめ}が降{ふ}らないといいですね。', 'Ojalá no llueva.'], ['早{はや}く見{み}つかったらいいですね。', 'Ojalá lo encuentres pronto.']], tr: 'と/たら/ば + いい. Nunca て + いい.' },
      oku: { name: 'Dejar preparado', pat: 'Vておく (casual とく/どく)', es: 'DEJAR PREPARADO CON ANTICIPACIÓN · in advance. También: dejar en el estado actual. しておいた = lo dejé hecho.', ex: [['旅行{りょこう}の前{まえ}に、読{よ}んでおきましょう。', 'Antes del viaje, leámoslo.'], ['ドアを開{あ}けておいて。', 'Deja la puerta abierta.']], tr: 'て → と · で → ど: 開けとく, 読んどく.' },
      shimau: { name: 'Terminar / lamento', pat: 'Vてしまう (casual ちゃう/じゃう)', es: 'TERMINAR DEL TODO (énfasis) o LAMENTO (regret).', ex: [['ワインを飲{の}んでしまった。', 'Me bebí todo el vino.'], ['かさを忘{わす}れちゃった。', 'Se me olvidó el paraguas.']], tr: '飲んでしまう o 飲んじゃう: nunca mezclados.' },
      miru: { name: 'Probar a hacer', pat: 'Vてみる', es: 'PROBAR A HACER V · try.', ex: [['これ、食{た}べてみてください。', 'Prueba esto.']], tr: 'て + みる (nunca た + みる).' },
      ageru: { name: 'Dar y recibir (cosas)', pat: 'Nをあげる / くれる / もらう', es: 'あげる = DOY (yo → otro). くれる = ME DAN (otro → yo o mi familia), por su iniciativa. もらう = RECIBO (yo soy el sujeto).', ex: [['私{わたし}は田中{たなか}さんにセーターをあげた。', 'Le di un suéter a Tanaka.'], ['田中{たなか}さんがくれた。· 田中{たなか}さんにもらった。', 'Tanaka me lo dio. · Lo recibí de Tanaka.']], tr: 'LA PARTÍCULA DECIDE: が → くれる · に/から → もらう.' },
      tekureru: { name: 'Favores', pat: 'Vてあげる / Vてくれる / Vてもらう', es: 'Hacer algo por alguien (あげる, también ofrecerse) · alguien lo hace por mí (くれる) · me hicieron el favor (もらう, gratitud).', ex: [['姉{あね}が手伝{てつだ}ってくれた。', 'Mi hermana me ayudó.'], ['地図{ちず}をかいてもらった。', 'Me dibujaron un mapa.']], tr: '姉が → てくれた · 父に → てもらった.' },
      keigo: { name: 'Keigo y やる', pat: 'さしあげる / くださる / いただく · Nにやる / Vてやる', es: 'KEIGO de あげる / くれる / もらう (hacia superiores). やる = dar/hacer por plantas, animales, niños.', ex: [['先生{せんせい}が本{ほん}をくださいました。', 'El profesor me dio un libro.'], ['花{はな}に水{みず}をやる。', 'Riego las flores.']], tr: 'あげる→さしあげる · くれる→くださる · もらう→いただく.' },
      tame: { name: 'Para (objetivo) / causa', pat: 'Nのため(に) · Vる+ため(に)', es: 'PARA (objetivo) con verbo de voluntad. También CAUSA (formal): ため sin に.', ex: [['家{いえ}を買{か}うために、貯金{ちょきん}している。', 'Ahorro para comprar una casa.'], ['台風{たいふう}のため、飛行機{ひこうき}が遅{おく}れた。', 'Por el tifón, el avión se retrasó.']], tr: 'ために = objetivo con verbo de VOLUNTAD.' },
      youni: { name: 'Con el fin de', pat: 'Vように (solo)', es: 'CON EL FIN DE / para que (verbo potencial, negativo o involuntario) · in order to.', ex: [['忘{わす}れないように、復習{ふくしゅう}しましょう。', 'Repasemos para no olvidarlo.']], tr: 'ない / potencial / わかる・見える・聞こえる → ように.' },
      youninaru: { name: 'Llegar a', pat: 'Vようになる', es: 'LLEGAR A / EMPEZAR A V · cambio · lograr hacer algo que no podías.', ex: [['日本語{にほんご}が話{はな}せるようになった。', 'He llegado a poder hablar japonés.']], tr: 'なる = el tiempo lo cambió.' },
      younisuru: { name: 'Procurar', pat: 'Vようにする', es: 'PROCURO V · hábito o esfuerzo propio · "tengo el hábito de V".', ex: [['毎食後{まいしょくご}、歯{は}をみがくようにしている。', 'Procuro lavarme los dientes tras cada comida.']], tr: 'する = lo hago yo. して = hábito · なって = cambio.' },
      youniiu: { name: 'Decir que haga', pat: 'Vように言う', es: 'DECIR A ALGUIEN QUE V · tell someone to V. Pasiva: 言{い}われる = me dijeron.', ex: [['母{はは}から早{はや}く帰{かえ}るように言{い}われた。', 'Mi madre me dijo que volviera pronto.']], tr: '言う → 言われる (う → わ).' },
      konna: { name: 'Ese tipo de / tanto', pat: 'こんな・そんな・あんな・どんな + N · こんなに…', es: 'ESE TIPO DE N (cerca de mí / de ti / lejos de ambos / ¿cuál?). こんなに = TANTO / DE TAL MANERA.', ex: [['あんなバッグがほしい。', 'Quiero un bolso como aquel.'], ['そんなにむずかしかったんですか。', '¿Tan difícil fue?']], tr: 'な + SUSTANTIVO · なに + verbo/adjetivo.' },
      kou: { name: 'Así / ¿cómo?', pat: 'こう・そう・ああ・どう + V · あの/あそこ vs その/そこ', es: 'ASÍ (como esto / como dices / como aquello) · ¿CÓMO? あの/あそこ = ambos lo conocen; その/そこ = solo uno.', ex: [['こう書{か}きます。', 'Se escribe así.'], ['私{わたし}もそう思{おも}います。', 'Yo también lo creo.']], tr: 'こ = mío · そ = tuyo · あ = de ambos · ど = pregunta.' },
      toiu: { name: 'Llamado', pat: '〜というN · 〜っていうN · どういうN', es: 'N LLAMADO ~ · N called ~. どういうN = ¿qué clase de N?', ex: [['目黒{めぐろ}というところ。', 'Un lugar llamado Meguro.'], ['どういう意味{いみ}ですか。', '¿Qué significa?']], tr: 'どういう意味 (nunca なにの意味).' },
      houga: { name: 'Deberías', pat: 'Vたほうがいい · Vないほうがいい', es: 'DEBERÍAS / NO DEBERÍAS V. Siempre た / ない (nunca なかった).', ex: [['早{はや}く寝{ね}たほうがいいですよ。', 'Deberías acostarte temprano.'], ['行{い}かないほうがいいよ。', 'Mejor no vayas.']], tr: 'Afirmativo → た · Negativo → ない.' },
      meirei: { name: 'Imperativo y prohibitivo', pat: '命令形 · 禁止形 (Vるな)', es: '¡HAZ V! / ¡NO HAGAS V! Fuerte, de hombres; carteles y deportes; citas: 〜と言われた.', ex: [['早{はや}くしろ。', '¡Date prisa!'], ['飲{の}むな。', '¡No bebas!'], ['がんばれ!', '¡Ánimo!']], tr: 'G1 u→e · G2 る→ろ · する→しろ · 来る→来い · くれる→くれ.' },
      nasai: { name: 'Orden suave', pat: 'Vなさい', es: 'HAZ V (orden suave): padres → hijos, maestros → alumnos.', ex: [['野菜{やさい}も食{た}べなさい。', 'Come también verduras.'], ['静{しず}かにしなさい。', 'Estate en silencio.']], tr: 'ます sin ます + なさい: 食べます → 食べなさい.' }
    }
  }
};
const CUR_WEEK = 2;
// PTS / GPTS se construyen al final de weeks_book.js, con todas las semanas

// Biblioteca: guía de la Semana 2 (tu PDF + anotaciones del libro)
function libraryHTML(w = 2) {
  const W = WEEKS[w];
  if (!W) return libTables();
  let h = `<div class="lib col"><div class="lbl">${esc(W.title)}</div>`;
  if (W.tips) {
    h += W.tips.map(([t, x]) => `<h3><span class="jp">${esc(t)}</span></h3><p>${ruby(x)}</p>`).join('');
    h += W.reading ? `<button class="btn pri block" data-lx="read">Practicar las lecturas del libro (${READINGS.filter(r => r.wk === 5).length})</button>` : `<p class="mute">El audio del CD no viene en el PDF: los ejemplos con guion del libro están en el simulacro con la voz ja-JP, junto a preguntas originales del mismo formato.</p><button class="btn pri block" data-lx="listen">Practicar 聴解 (formato JLPT, 35 min)</button>`;
    return h + '</div>';
  }
  for (const day of W.days) {
    h += `<h3>Día ${day.d} · <span class="jp">${esc(day.t)}</span></h3><div class="lbl">${esc(day.s)}</div>`;
    for (const p of day.pts) {
      const P = W.points[p];
      h += `<div class="pt"><div class="pat">${esc(P.pat)}</div><div>${ruby(P.es)}</div>${P.ex.map(e => `<div class="ex">${ruby(e[0])}<small>${esc(e[1])}</small></div>`).join('')}<div class="mono acid" style="font-size:13px">TRUCO · ${ruby(P.tr)}</div></div>`;
    }
  }
  if (w !== 2) return h + '</div>';
  h += `<h3>Tus confusiones resueltas</h3>
  <div class="tblwrap"><table><tr><th></th><th>いい = BIEN</th><th>いけない = MAL / NO SE DEBE</th></tr>
  <tr><th>V-て</th><td><b class="jp">Vてもいい</b><br>PERMISO</td><td><b class="jp">Vてはいけない</b><br>PROHIBIDO</td></tr>
  <tr><th>V-ない → なくて</th><td><b class="jp">Vなくてもいい</b><br>NO HACE FALTA</td><td><b class="jp">Vなくてはいけない</b><br>TENGO QUE</td></tr></table></div>
  <p>TRUCO: NO + NO = SÍ. Tus stickers: <span class="jp">ては いけない</span> = prohibido · <span class="jp">ないと いけない</span> = obligatorio.</p>
  <p><b>くれる vs もらう:</b> la partícula decide. <span class="jp">が → くれる · に / から → もらう</span>. くれる: me lo dan (solo "a mí o a mi familia", por iniciativa suya). もらう: yo lo recibo (hubo pedido). Si yo doy → あげる.</p>
  <p><b>ようになる vs ようにする:</b> ¿"llegué a / ya puedo / empecé a"? → なる. ¿"procuro / me esfuerzo"? → する. して = hábito · なって = cambio. ために = objetivo con verbo de voluntad; ように = potencial / negativo / involuntario.</p>
  <div class="tblwrap"><table><tr><th>こう + V</th><td>ASÍ, como esto (cerca de mí)</td><td class="jp">こう書きます。</td></tr><tr><th>そう + V</th><td>ASÍ, como dices (cerca de ti)</td><td class="jp">私もそう思います。</td></tr><tr><th>ああ + V</th><td>ASÍ, como aquello (lejos de ambos / ambos lo conocen)</td><td class="jp">彼はいつもああ言う。</td></tr><tr><th>どう + V</th><td>¿CÓMO?</td><td class="jp">漢字でどう書きますか。</td></tr></table></div>
  <h3>Imperativo y prohibitivo por grupo</h3>
  <div class="tblwrap"><table><tr><th>Grupo</th><th>Imperativo</th><th>Ejemplos</th><th>Prohibitivo</th></tr>
  <tr><td>G1 (五段)</td><td>u → e (= potencial sin る)</td><td class="jp">書く→書け · 飲む→飲め · 止まる→止まれ · 打つ→打て · 言う→言え</td><td class="jp">書くな · 飲むな</td></tr>
  <tr><td>G2 (一段)</td><td>quita る + ろ</td><td class="jp">食べる→食べろ · 見る→見ろ · 寝る→寝ろ</td><td class="jp">食べるな · 混ぜるな</td></tr>
  <tr><td>G3</td><td>する→しろ · 来る→来い</td><td class="jp">早くしろ。こっちに来い。</td><td class="jp">するな · 来るな</td></tr>
  <tr><td>Especial</td><td>くれる → くれ (NO くれろ)</td><td class="jp">毎日メールをくれ。</td><td>—</td></tr></table></div>
  <h3>Voz pasiva (受身) por grupo</h3>
  <div class="tblwrap"><table><tr><th>G1</th><td>u → a + れる (う → わ)</td><td class="jp">書く→書かれる · 読む→読まれる · 言う→言われる</td></tr>
  <tr><th>G2</th><td>る → られる</td><td class="jp">食べる→食べられる · 見る→見られる</td></tr>
  <tr><th>G3</th><td>する → される · 来る → 来られる</td><td class="jp">する→される · 来(こ)られる</td></tr></table></div>
  <p>Estructura: <span class="jp">私は + quien lo hace に + pasiva</span>. <span class="jp">母に早く帰るように言われた · 先生にほめられた</span>. Ojo: en G2 la pasiva = potencial (食べられる); con に + persona es pasiva.</p>
  <h3>Trampas del libro</h3>
  <ol><li>ないほうがいい: siempre ない, nunca なかった.</li><li>来なくても, no 来ないでも.</li><li>飲んでしまう o 飲んじゃう, nunca mezclados.</li><li>はじめて en 「待たないではじめておいて」 = el verbo EMPEZAR.</li><li>くれ, no くれろ.</li><li>が + くれる / に + もらう.</li></ol>
  <p class="mute">Rutina diaria (5 min): tapa la columna del medio, di el significado en voz alta, destapa y corrige.</p></div>`;
  return h;
}

// Tablas de conjugación (libro, págs. 125-127) y pares 他動詞 / 自動詞
function libTables() {
  const ex = [['書く', 'v1'], ['飲む', 'v1'], ['話す', 'v1'], ['言う', 'v1'], ['食べる', 'v2'], ['見る', 'v2'], ['する', 'v3'], ['来る', 'v3']];
  const fs = ['masu', 'te', 'nai', 'pot', 'vol', 'ba', 'imp', 'pas', 'cau', 'caup'];
  return `<div class="lib col"><h3>Formas verbales</h3><div class="tblwrap"><table class="tbl"><tr><th></th>${fs.map(f => `<th style="font-size:12px">${esc(FORMS[f].split(' (')[0])}</th>`).join('')}</tr>${ex.map(([v, g]) => `<tr><th class="jp">${v}</th>${fs.map(f => `<td class="jp">${esc(conj(v, g, f))}</td>`).join('')}</tr>`).join('')}</table></div>
  <p>Causativa (使役): G1 u→a+せる · G2 る→させる · する→させる · 来る→来させる. Causativa pasiva (使役受身): G1 u→a+される (o せられる); con す siempre させられる (話させられる) · G2 る→させられる · させられる · 来させられる. <span class="jp">母に野菜を食べさせられた</span> = mi madre me obligó a comer verduras.</p>
  <h3>他動詞 (を) / 自動詞 (が)</h3><p>Transitivo: alguien lo hace (<span class="jp">ドアを開ける</span>). Intransitivo: pasa solo (<span class="jp">ドアが開く</span>). Con ている va el 自動詞 (<span class="jp">ドアが開いている</span>); con てある, el 他動詞 (<span class="jp">ドアが開けてある</span>).</p>
  <div class="tblwrap"><table class="tbl"><tr><th>他動詞 を</th><th>自動詞 が</th><th></th></tr>${TADOU.map(t => `<tr><td class="jp">${wordRuby(t[0], t[1])}</td><td class="jp">${wordRuby(t[2], t[3])}</td><td>${esc(t[4])}</td></tr>`).join('')}</table></div></div>`;
}
