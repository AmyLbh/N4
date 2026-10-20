// ================= SEMANAS 1, 3 y 4 (gramática) · 5 (lectura) · 6 (escucha) — 日本語総まとめ N4 =================
WEEKS[1] = {
  n: 1, title: 'Semana 1 · 文法を勉強しましょう①',
  days: [
    { d: 1, t: '一日に二回、歯をみがきます', s: 'partículas · ほど · は/も · descripción del sustantivo', pts: ['w1_part', 'w1_hodo', 'w1_wamo', 'w1_mod'] },
    { d: 2, t: '漢字は少ししか書けません', s: 'でも · で · も · とか · しか', pts: ['w1_demo', 'w1_de', 'w1_mo', 'w1_toka', 'w1_shika'] },
    { d: 3, t: '9時までに来てください', s: 'まで/までに · たり · し · ばかり', pts: ['w1_made', 'w1_tari', 'w1_shi', 'w1_bakari'] },
    { d: 4, t: '今、勉強しているところです', s: 'ところ · 間に · とき · 中', pts: ['w1_tokoro', 'w1_aida', 'w1_toki', 'w1_chuu'] },
    { d: 5, t: '音楽を聞きながら勉強しています', s: 'て/で (causa y modo) · まま · ながら', pts: ['w1_te', 'w1_mama', 'w1_nagara'] },
    { d: 6, t: '雪を見たことがありません', s: 'ことがある · ことにする · ことになる · くする/になる', pts: ['w1_koto', 'w1_kotonisuru', 'w1_kotoninaru', 'w1_kusuru'] }
  ],
  points: {
    w1_part: { name: 'Partículas básicas', pat: 'で/に · から · に · も · ずつ', es: 'で = lugar de acción (日本で働く) · に con つとめる · から = material transformado (ぶどうからワインを作る) · に = proporción (1日に3回) · も = ejemplo extremo (ひらがなも書けません) · ずつ = de a ~ (1枚ずつ, 毎日2ページずつ).', ex: [['1日{にち}に3回{かい}、この薬{くすり}を飲{の}んでいます。', 'Tomo esta medicina 3 veces al día.'], ['このプリントを1枚{まい}ずつ配{くば}ってください。', 'Repartan una hoja a cada uno.']], tr: '働く→で · つとめる→に · 材料変化→から.' },
    w1_hodo: { name: 'No tan ~ como', pat: 'N1はN2ほど〜ない', es: 'N1 NO es tan ~ como N2 (= N2 es más ~). Siempre con negativo. También 今週もいそがしいですが、先週ほどではありません.', ex: [['日本{にほん}では、ぶた肉{にく}は牛肉{ぎゅうにく}ほど高{たか}くありません。', 'En Japón el cerdo no es tan caro como la res.']], tr: 'ほど → siempre ない.' },
    w1_wamo: { name: 'Partícula + は / も', pat: '〜では · 〜からも …', es: 'Partícula + は = contraste; partícula + も = también.', ex: [['この子{こ}は家{いえ}ではうるさいですが、外{そと}ではおとなしいです。', 'Este niño es ruidoso en casa, pero fuera es tranquilo.'], ['父{ちち}からも母{はは}からもプレゼントをもらいました。', 'Recibí regalos de papá y también de mamá.']], tr: 'は = contraste · も = también.' },
    w1_mod: { name: 'Describir un sustantivo', pat: '[frase] + N', es: 'La descripción va ANTES del sustantivo, en forma normal: 姉にもらったバッグ.', ex: [['これは姉{あね}にもらったバッグです。', 'Este es el bolso que me dio mi hermana.'], ['フランス語{ご}が話{はな}せる友{とも}だちがいます。', 'Tengo un amigo que habla francés.']], tr: 'Descripción → antes del N.' },
    w1_demo: { name: 'Incluso / por ejemplo', pat: 'Nでも', es: '① ejemplo extremo: 子どもでもできる (hasta un niño) ② ejemplo suave: お茶でも飲みましょうか.', ex: [['これは日本人{にほんじん}でも読{よ}めない漢字{かんじ}です。', 'Es un kanji que ni los japoneses saben leer.']], tr: 'でも = hasta / o algo así.' },
    w1_de: { name: 'Usos de で', pat: 'Nで', es: 'Medio (電車で, はさみで) · ámbito (日本でいちばん, 3個で500円) · causa (かぜで休んだ) · material (紙で作った).', ex: [['かぜで学校{がっこう}を休{やす}みました。', 'Falté a clase por un resfriado.']], tr: 'で = medio · ámbito · causa · material.' },
    w1_mo: { name: 'も con cantidades', pat: '数 + も', es: '① afirmativo: ¡tanto! (2時間もかかります) ② negativo: ni uno (10人も来ませんでした, 1枚も持っていません).', ex: [['ビールを3本{ぼん}も飲{の}みました。', '¡Bebí tres cervezas!']], tr: 'Mucho → も · Ni uno → 1〜も + ない.' },
    w1_toka: { name: 'Ejemplos', pat: 'N1とかN2(とか)', es: 'N1 o N2 (entre otros). Casual.', ex: [['昼{ひる}はラーメンとかそばとかを食{た}べます。', 'Al mediodía como cosas como ramen o soba.']], tr: 'とか = や (casual).' },
    w1_shika: { name: 'Solo', pat: 'Nしか〜ない', es: 'Solo N (y nada más). Siempre con negativo.', ex: [['れいぞうこに、たまごが1個{こ}しかありません。', 'En la nevera solo hay un huevo.']], tr: 'しか → ない. だけ → afirmativo.' },
    w1_made: { name: 'Hasta / antes de', pat: '〜まで · 〜までに', es: 'まで = hasta (estado que continúa) · までに = antes de (plazo).', ex: [['仕事{しごと}が終{お}わるまで、ここで待{ま}っていてください。', 'Espera aquí hasta que termine el trabajo.'], ['レポートは15日{にち}までに出{だ}してください。', 'Entrega el informe antes del día 15.']], tr: 'Continuo → まで · Plazo → までに.' },
    w1_tari: { name: 'Cosas como…', pat: '〜たり(〜たり)する', es: 'Enumerar algunas acciones, o algo que se repite (降ったりやんだり).', ex: [['休{やす}みの日{ひ}はDVDを見{み}たり本{ほん}を読{よ}んだりしています。', 'En mis días libres veo DVDs, leo…']], tr: 'たり…たり + する.' },
    w1_shi: { name: 'Y además (razones)', pat: '〜し、(〜し、)', es: 'Varias razones o cualidades.', ex: [['このレストランはおいしいし、安{やす}いです。', 'Este restaurante es rico y además barato.']], tr: 'Sumar razones → し.' },
    w1_bakari: { name: 'Solo (exceso)', pat: 'Nばかり', es: 'Mucha cantidad de N (queja). だけ = 100% solo N.', ex: [['弟{おとうと}はゲームばかりしています。', 'Mi hermano no hace más que jugar.']], tr: 'ばかり = no hace más que.' },
    w1_tokoro: { name: 'Momento de la acción', pat: 'Vるところ · Vているところ · Vたところ', es: 'Vる = a punto de · Vている = en este momento · Vた = acaba de.', ex: [['今{いま}、料理{りょうり}を作{つく}っているところです。', 'Ahora estoy cocinando.'], ['今{いま}、授業{じゅぎょう}が終{お}わったところです。', 'La clase acaba de terminar.']], tr: 'る antes · ている durante · た después.' },
    w1_aida: { name: 'Mientras', pat: 'Nの間に · Vている間に', es: 'Durante N / mientras V, pasa algo.', ex: [['映画{えいが}を見{み}ている間{あいだ}に、寝{ね}てしまいました。', 'Me dormí mientras veía la película.']], tr: '間に + suceso puntual.' },
    w1_toki: { name: 'Cuando (antes/después)', pat: 'V1るとき、V2 · V1たとき、V2', es: 'V1る = V2 antes de V1 · V1た = V2 después de V1.', ex: [['寝{ね}るとき、パジャマを着{き}ます。', 'Al acostarme me pongo el pijama.'], ['東京{とうきょう}に行{い}ったときに、友{とも}だちに会{あ}う予定{よてい}です。', 'Cuando vaya a Tokio (ya allí) veré a un amigo.']], tr: 'る = antes · た = ya hecho.' },
    w1_chuu: { name: 'En medio de', pat: 'N中(ちゅう)', es: 'Acción en curso: 会議中, 電話中. Ojo: 一日中, 今年中 = じゅう (todo el periodo).', ex: [['田中{たなか}さんは今{いま}、電話中{でんわちゅう}です。', 'Tanaka está al teléfono.']], tr: 'ちゅう = en curso · じゅう = todo el periodo.' },
    w1_te: { name: 'て/で: causa y modo', pat: '〜て · 〜で · 〜ないで', es: '① causa (からくて食べられない; お金がなくて買えない). No se usa con peticiones: 暑いから窓を開けて ✓. ② modo: すわって話す; 朝ご飯を食べないで行く.', ex: [['かぜをひいて、学校{がっこう}を休{やす}みました。', 'Me resfrié y falté a clase.'], ['辞書{じしょ}を使{つか}わないで、日本語{にほんご}の本{ほん}を読{よ}みます。', 'Leo libros en japonés sin diccionario.']], tr: 'Causa → なくて · Modo → ないで.' },
    w1_mama: { name: 'Tal cual', pat: '〜たまま · Nのまま', es: 'Sin cambiar el estado: めがねをかけたまま寝た; パジャマのまま出かけた.', ex: [['まどを開{あ}けたまま寝{ね}ました。', 'Me dormí con la ventana abierta.']], tr: 'た + まま · N + の + まま.' },
    w1_nagara: { name: 'Mientras (a la vez)', pat: 'Vますながら', es: 'Hacer dos cosas a la vez (el mismo sujeto).', ex: [['音楽{おんがく}を聞{き}きながら勉強{べんきょう}します。', 'Estudio escuchando música.']], tr: 'ます sin ます + ながら.' },
    w1_koto: { name: 'Experiencia / a veces', pat: 'Vたことがある · Vる/ないことがある', es: 'Vた = he hecho alguna vez · Vる/ない = a veces pasa.', ex: [['私{わたし}はアフリカに行{い}ったことがあります。', 'He estado en África.'], ['昼{ひる}ご飯{はん}を食{た}べないことがあります。', 'A veces no almuerzo.']], tr: 'た = experiencia · る = a veces.' },
    w1_kotonisuru: { name: 'Decidir (yo)', pat: 'Nにする · Vる/ないことにする(している)', es: 'Decisión propia; ことにしている = hábito decidido.', ex: [['毎日{まいにち}、牛乳{ぎゅうにゅう}を飲{の}むことにしています。', 'Tengo la costumbre de beber leche cada día.']], tr: 'する = lo decido yo.' },
    w1_kotoninaru: { name: 'Se decidió', pat: 'Nになる · Vる/ないことになる', es: 'Decisión ajena o de la situación.', ex: [['来月{らいげつ}、イギリスへ出張{しゅっちょう}することになりました。', 'Se decidió que el mes que viene voy de viaje a Inglaterra.']], tr: 'なる = lo decidieron.' },
    w1_kusuru: { name: 'Hacer / volverse', pat: 'i-Aく / na-Aに する・なる', es: 'する = alguien lo cambia a propósito · なる = cambia solo.', ex: [['テレビの音{おと}を小{ちい}さくしてください。', 'Baja el volumen de la tele.'], ['母{はは}がいなくて、さびしくなりました。', 'Sin mi madre, me sentí sola.']], tr: 'い → く · な → に.' }
  }
};
WEEKS[3] = {
  n: 3, title: 'Semana 3 · 文法を勉強しましょう③',
  days: [
    { d: 1, t: '漢字を書くのは大変です', s: 'かどうか · 疑問詞〜か · の · のに (para)', pts: ['w3_kadouka', 'w3_ka', 'w3_no', 'w3_noni_para'] },
    { d: 2, t: 'このまどから山が見えます', s: 'potencial · 見える/聞こえる · のが見える', pts: ['w3_kanou', 'w3_mieru', 'w3_noga'] },
    { d: 3, t: '雨でも行きましょう', s: 'ので · のに · ても/でも · 疑問詞〜ても', pts: ['w3_node', 'w3_noni', 'w3_temo', 'w3_qtemo'] },
    { d: 4, t: 'この漢字の読み方はむずかしいです', s: 'conectores · 形容詞+さ · V方', pts: ['w3_conj', 'w3_sa', 'w3_kata'] },
    { d: 5, t: '手伝ってくださいませんか', s: 'pedir · てほしい · たらどう · が/けど', pts: ['w3_irai', 'w3_hoshii', 'w3_tara', 'w3_ga'] },
    { d: 6, t: '今日はお酒を飲まないつもりです', s: 'と言う · と思う · Vよう · つもり', pts: ['w3_toiu', 'w3_toomou', 'w3_you', 'w3_youto', 'w3_tsumori'] }
  ],
  points: {
    w3_kadouka: { name: 'Si … o no', pat: '〜かどうか', es: 'Duda de sí/no: 本当かどうか, あるかどうか.', ex: [['明日{あした}、テストがあるかどうか、聞{き}いてみましょう。', 'Preguntemos si mañana hay examen o no.']], tr: 'Sin interrogativo → かどうか.' },
    w3_ka: { name: 'Pregunta incrustada', pat: '疑問詞(いつ/どこ/だれ…)〜か', es: 'Con palabra interrogativa basta か (sin どうか).', ex: [['田中{たなか}さんがどこに住{す}んでいるか知{し}っていますか。', '¿Sabes dónde vive Tanaka?']], tr: 'Con どこ/だれ/なぜ → か.' },
    w3_no: { name: 'Nominalizar con の', pat: '〜の(は/が/を)', es: '① sustituye a persona/cosa/tiempo (すっているのが社長) ② convierte la frase en sustantivo (= こと): 作るのが上手.', ex: [['漢字{かんじ}を覚{おぼ}えるのは大変{たいへん}です。', 'Memorizar kanji es duro.']], tr: 'の = こと (casi siempre).' },
    w3_noni_para: { name: 'Para (uso, tiempo, dinero)', pat: 'Vるのに', es: '= Vるために con 使う / かかる / 便利.', ex: [['この絵{え}をかくのに1か月{げつ}かかりました。', 'Tardé un mes en pintar este cuadro.']], tr: 'のに + 使う/かかる/便利.' },
    w3_kanou: { name: 'Potencial', pat: '可能形 = Vることができる', es: 'G1 u→eる · G2 る→られる · する→できる · 来る→来られる.', ex: [['この店{みせ}では新鮮{しんせん}な魚{さかな}が食{た}べられます。', 'En esta tienda se puede comer pescado fresco.']], tr: 'ことができる ← diccionario.' },
    w3_mieru: { name: 'Ver / oír (sin querer)', pat: '見える · 聞こえる · 見られる · 聞ける', es: '見える/聞こえる = llega a mis ojos/oídos · 見られる/聞ける = tengo la posibilidad.', ex: [['窓{まど}を開{あ}けると、鳥{とり}の声{こえ}が聞{き}こえます。', 'Al abrir la ventana se oyen pájaros.'], ['この美術館{びじゅつかん}では、ピカソの絵{え}が見{み}られます。', 'En este museo se pueden ver cuadros de Picasso.']], tr: 'Natural → える · Oportunidad → られる/ける.' },
    w3_noga: { name: 'Percibir una acción', pat: '〜のが見える · 〜のを見る · 〜のが聞こえる · 〜のを聞く', es: 'Aquí の NO se cambia por こと.', ex: [['公園{こうえん}で子{こ}どもたちが遊{あそ}んでいるのが見{み}えます。', 'Se ve a los niños jugando en el parque.']], tr: 'Ver/oír → の (nunca こと).' },
    w3_node: { name: 'Porque (cortés)', pat: '〜ので', es: 'Más cortés que から. na-A/N + なので. No existe 〜のでです (sí 〜からです).', ex: [['雨{あめ}が降{ふ}っているので、今日{きょう}は出{で}かけませんでした。', 'Como llueve, hoy no salí.']], tr: 'Final con です → から.' },
    w3_noni: { name: 'Aunque (decepción)', pat: '〜のに', es: 'Resultado contrario a lo esperado, con queja. na-A/N + なのに.', ex: [['きのう勉強{べんきょう}したのに、もう忘{わす}れてしまいました。', 'Aunque estudié ayer, ya lo olvidé.']], tr: 'Queja → のに.' },
    w3_temo: { name: 'Aunque', pat: '〜ても / 〜でも', es: 'Aunque ~, igual… い-A → くても · N/na-A → でも.', ex: [['明日{あした}雨{あめ}でも、動物園{どうぶつえん}に行{い}きます。', 'Aunque llueva mañana, iré al zoo.']], tr: 'くても · でも.' },
    w3_qtemo: { name: 'No importa…', pat: '疑問詞〜ても/でも', es: 'いつ〜ても (siempre), どんなに〜ても, いくら〜ても (por mucho que).', ex: [['この文{ぶん}は何回{なんかい}読{よ}んでも理解{りかい}できません。', 'Por más veces que lo lea, no lo entiendo.']], tr: 'Interrogativo + ても.' },
    w3_conj: { name: 'Conectores', pat: 'それに/そのうえ · それで/だから · ところが', es: 'それに/そのうえ = además · それで/だから = por eso · ところが = pero (inesperado, = のに). Otros: そして, それから, けれども, でも, しかし, ところで, たとえば, それでは, じゃあ.', ex: [['この店{みせ}の料理{りょうり}はおいしい。それにねだんも安{やす}い。', 'Aquí la comida es rica. Además es barata.'], ['きのうは試験{しけん}の日{ひ}だった。ところが、病気{びょうき}で受{う}けることができなかった。', 'Ayer era el examen. Pero no pude hacerlo por estar enferma.']], tr: 'Suma · resultado · sorpresa.' },
    w3_sa: { name: 'Adjetivo → sustantivo', pat: '形容詞 + さ', es: '高い→高さ, 大きい→大きさ, 便利→便利さ. いい → よさ.', ex: [['あの山{やま}の高{たか}さはどのくらいですか。', '¿Qué altura tiene esa montaña?']], tr: 'い/な → さ.' },
    w3_kata: { name: 'Manera de', pat: 'Vます + 方', es: '使い方, やり方, 読み方.', ex: [['この漢字{かんじ}の読{よ}み方{かた}を教{おし}えてください。', 'Dime cómo se lee este kanji.']], tr: 'ます sin ます + 方.' },
    w3_irai: { name: 'Pedir (de menos a más cortés)', pat: 'てくれませんか < てもらえませんか < てくださいませんか < ていただけませんか', es: 'Nunca いただきませんか.', ex: [['すみませんが、もう一度{いちど}言{い}っていただけませんか。', 'Disculpe, ¿podría repetirlo?']], tr: 'Lo más cortés → いただけませんか.' },
    w3_hoshii: { name: 'Quiero que (otro) haga', pat: 'Vてほしい · Vてもらいたい · Vていただきたい', es: 'Deseo sobre la acción de otra persona. Negativo: 聞かないでほしい = 聞いてほしくない.', ex: [['父{ちち}に早{はや}く元気{げんき}になってほしいです。', 'Quiero que mi padre se recupere pronto.']], tr: 'Otra persona → てほしい.' },
    w3_tara: { name: '¿Por qué no…?', pat: '〜たらどう/いかがですか', es: 'Sugerencia.', ex: [['インターネットで調{しら}べたらどうですか。', '¿Por qué no lo buscas en internet?']], tr: 'たら + どう.' },
    w3_ga: { name: 'Preámbulo', pat: '〜が、/ 〜け(れ)ど、', es: 'Introduce el tema antes de pedir o proponer (no significa "pero").', ex: [['すみませんが、この辺{へん}にコンビニはありませんか。', 'Disculpe, ¿hay alguna tienda por aquí?']], tr: 'Abrir conversación → が.' },
    w3_toiu: { name: 'Citar', pat: '〜と/って言う', es: 'って = と en lenguaje hablado. 酒を飲むなと言われた.', ex: [['田中{たなか}さんは明日{あした}は来{こ}ないと言{い}っていましたよ。', 'Tanaka dijo que mañana no viene.']], tr: 'Cita → と / って.' },
    w3_toomou: { name: 'Creo que', pat: '〜と思う', es: 'Forma normal + と思う.', ex: [['試験{しけん}に受{う}かったと思{おも}います。', 'Creo que aprobé.']], tr: 'Normal + と思う.' },
    w3_you: { name: 'Volitiva', pat: 'Vよう (行こう, 見よう, しよう, 来よう)', es: 'Forma casual de 〜ましょう.', ex: [['疲{つか}れたから、ちょっと休{やす}もう。', 'Estoy cansada, descansemos un poco.']], tr: 'G1 u→o+う · G2 る→よう.' },
    w3_youto: { name: 'Pienso hacer', pat: 'Vようと思う', es: 'Intención.', ex: [['新{あたら}しい自転車{じてんしゃ}を買{か}おうと思{おも}っています。', 'Estoy pensando en comprar una bici nueva.']], tr: 'よう + と思う.' },
    w3_tsumori: { name: 'Planear', pat: 'Vるつもり · Vないつもり · Vるつもりはない', es: 'Plan o intención firme. つもりはない es más fuerte que ないつもり. Nunca つもりません.', ex: [['夏休{なつやす}みに国{くに}に帰{かえ}るつもりです。', 'Pienso volver a mi país en vacaciones.']], tr: 'つもりはありません (no つもりません).' }
  }
};
WEEKS[4] = {
  n: 4, title: 'Semana 4 · 文法を勉強しましょう④',
  days: [
    { d: 1, t: '夏休みになったら、国に帰ります', s: 'たら · ば · なら · と', pts: ['w4_tara', 'w4_ba', 'w4_nara', 'w4_to'] },
    { d: 2, t: '明日は天気がよさそうです', s: 'ようだ/みたいだ · そうだ · でしょう · かもしれない', pts: ['w4_you', 'w4_sou', 'w4_deshou', 'w4_kamo'] },
    { d: 3, t: 'この本は使いやすいです', s: 'すぎる · やすい/にくい · 出す/終わる/続ける', pts: ['w4_sugiru', 'w4_yasui', 'w4_dasu'] },
    { d: 4, t: '会社をやめさせられました', s: 'pasiva · causativa · causativa pasiva · させてください', pts: ['w4_ukemi', 'w4_shieki', 'w4_shiekiukemi', 'w4_sasete'] },
    { d: 5, t: 'かぎがかかっています', s: 'transitivo/intransitivo · ている/てある · てくる/ていく', pts: ['w4_tadou', 'w4_teiru', 'w4_tearu', 'w4_tekuru'] },
    { d: 6, t: '試験に受からないかなあ', s: 'んです · なあ/ね/よ · かな/かしら', pts: ['w4_ndesu', 'w4_shuujo', 'w4_kana'] }
  ],
  points: {
    w4_tara: { name: 'Si / cuando (たら)', pat: 'Vた + ら', es: 'Condición, a menudo もし〜たら. También "cuando ya ocurra": お湯がわいたら、めんを入れて (aquí NO sirve と).', ex: [['雨{あめ}が降{ふ}ったら、明日{あした}の試合{しあい}は中止{ちゅうし}です。', 'Si llueve, se cancela el partido.']], tr: 'Después de que pase → たら.' },
    w4_ba: { name: 'Si (ば / なら)', pat: 'ば形 · N/na-A + なら', es: 'G1 u→e+ば · G2 る→れば · い→ければ (いい→よければ) · N/na → なら.', ex: [['安{やす}ければ買{か}いますが、高{たか}いので買{か}いません。', 'Si fuera barato lo compraría, pero es caro.']], tr: 'い → ければ · な/N → なら.' },
    w4_nara: { name: 'Si (opinión del hablante)', pat: '普通形 + なら', es: 'Consejo o decisión según lo que dice el otro: 行くなら地下鉄が便利. ラーメンなら駅前の店がおいしい.', ex: [['コンビニへ行{い}くなら、サンドイッチを買{か}ってきてください。', 'Si vas a la tienda, tráeme un sándwich.']], tr: 'Ya que vas a… → なら.' },
    w4_to: { name: 'Siempre que', pat: '普通形(no pasado) + と', es: 'Resultado natural o automático; indicaciones.', ex: [['このボタンを押{お}すと、ドアが開{あ}きます。', 'Al pulsar este botón, se abre la puerta.']], tr: 'Automático → と. Nunca con petición.' },
    w4_you: { name: 'Parece (deducción)', pat: '〜ようだ · 〜みたいだ', es: 'Deducción por pistas. N + のようだ / N + みたいだ.', ex: [['道路{どうろ}がぬれているから、雨{あめ}が降{ふ}ったようですね。', 'El suelo está mojado: parece que llovió.']], tr: 'みたい = よう (casual).' },
    w4_sou: { name: 'Parece / dicen que', pat: '〜そうだ', es: '① aspecto: Vます/い-A sin い/na-A + そう (元気そうな, よさそう) ② oído: forma normal + そうだ (降るそうです, 元気だそうです).', ex: [['雨{あめ}が降{ふ}りそうです。', 'Parece que va a llover.'], ['天気予報{てんきよほう}によると、午後{ごご}から雨{あめ}が降{ふ}るそうですよ。', 'Según el pronóstico, lloverá por la tarde.']], tr: 'Aspecto: 降りそう · Oído: 降るそう.' },
    w4_deshou: { name: 'Probablemente', pat: '〜でしょう · 〜だろう', es: 'Conjetura (= と思う).', ex: [['今日{きょう}は午後{ごご}から雨{あめ}が降{ふ}るでしょう。', 'Hoy probablemente llueva desde la tarde.']], tr: 'たぶん〜でしょう.' },
    w4_kamo: { name: 'Puede que', pat: '〜かもしれない', es: 'Posibilidad.', ex: [['来年{らいねん}、東京{とうきょう}に転勤{てんきん}になるかもしれません。', 'Puede que el año que viene me trasladen a Tokio.']], tr: 'Posible → かもしれない.' },
    w4_sugiru: { name: 'Demasiado', pat: 'Vます/i-A/na-A + すぎる', es: 'Exceso, no es adecuado.', ex: [['このぼうしは私{わたし}には小{ちい}さすぎます。', 'Este sombrero me queda demasiado pequeño.']], tr: 'Sin い / sin な + すぎる.' },
    w4_yasui: { name: 'Fácil / difícil de', pat: 'Vます + やすい / にくい', es: 'やすい = fácil de / se ~ fácilmente (割れやすい) · にくい = difícil de / no se ~ fácilmente (やぶれにくい).', ex: [['このペンは書{か}きやすいです。', 'Con este bolígrafo se escribe fácil.']], tr: 'やすい ↔ にくい.' },
    w4_dasu: { name: 'Empezar / terminar / seguir', pat: 'Vます + 出す · 終わる · 始める · 続ける', es: '出す = empezar de golpe · 始める = empezar · 終わる = terminar de · 続ける = seguir.', ex: [['午後{ごご}から雨{あめ}が降{ふ}り出{だ}しました。', 'Por la tarde se puso a llover.']], tr: 'ます sin ます + 出す/終わる/続ける.' },
    w4_ukemi: { name: 'Pasiva', pat: 'Vられる (受身形)', es: 'G1 u→a+れる (言う→言われる) · G2 る→られる · する→される · 来る→来られる. Con cosas como sujeto para hechos: 世界中で歌われている.', ex: [['私{わたし}はよく母{はは}にしかられました。', 'Mi madre me regañaba a menudo.']], tr: 'に + pasiva = quien lo hace.' },
    w4_shieki: { name: 'Causativa', pat: 'Vさせる (使役形)', es: 'Obligar o dejar hacer. G1 u→a+せる · G2 る→させる · する→させる · 来る→来させる.', ex: [['その先生{せんせい}は学生{がくせい}に日本語{にほんご}の日記{にっき}を書{か}かせます。', 'Ese profesor hace escribir a los alumnos un diario en japonés.']], tr: 'Yo hago que otro haga → させる.' },
    w4_shiekiukemi: { name: 'Causativa pasiva', pat: 'Vさせられる (使役受身形)', es: 'Me obligaron a hacerlo. G1: u→a+せられる o される (飲まされる; pero 話す→話させられる) · G2 る→させられる · する→させられる · 来る→来させられる.', ex: [['子{こ}どものころ、毎日{まいにち}母{はは}に野菜{やさい}を食{た}べさせられました。', 'De pequeña, mi madre me obligaba a comer verduras.']], tr: 'させ + られる = obligado.' },
    w4_sasete: { name: 'Déjame hacer', pat: '〜させてください', es: 'Pedir permiso para hacer algo.', ex: [['ノートをコピーさせてください。', 'Déjame fotocopiar tus apuntes.']], tr: 'Causativa + て + ください.' },
    w4_tadou: { name: 'Transitivo / intransitivo', pat: '他動詞 (を) · 自動詞 (が)', es: '人がコップを割る / コップが割れる · 火を消す / 火が消える · ドアを閉める / ドアが閉まる · 授業を始める / 授業が始まる.', ex: [['危{あぶ}ないから、ろうそくを消{け}しますよ。', 'Es peligroso: apago la vela.'], ['ろうそくの火{ひ}が消{き}えました。', 'Se apagó la vela.']], tr: 'を → 他動詞 · が → 自動詞.' },
    w4_teiru: { name: 'Estado resultante', pat: '自動詞 + ている · 〜ていない', es: 'Resultado que permanece: かぎがかかっている. ていない = todavía no (まだ終わっていない).', ex: [['窓{まど}が閉{し}まっています。', 'La ventana está cerrada.']], tr: 'が + 自動詞 + ている.' },
    w4_tearu: { name: 'Está hecho (a propósito)', pat: '他動詞 + てある', es: 'Alguien lo dejó así con un fin: 花がかざってある.', ex: [['おさらは、ぜんぶ洗{あら}ってあります。', 'Los platos ya están lavados.']], tr: 'が + 他動詞 + てある.' },
    w4_tekuru: { name: 'Venir / ir (cambio)', pat: 'Vてくる · Vていく', es: 'Movimiento, cambio o comienzo respecto al ahora: 降ってきた (empezó), 寒くなっていく (seguirá), 行ってくる (ir y volver).', ex: [['だんだん寒{さむ}くなってきました。', 'Ha ido haciendo más frío.']], tr: 'Hasta ahora → てくる · Desde ahora → ていく.' },
    w4_ndesu: { name: 'Explicar / preguntar el porqué', pat: '〜んです · 〜のです · 〜の？', es: 'Pedir o dar explicación. Casual: 〜の？ / 〜んだ。', ex: [['どうしてパーティーに行{い}かないんですか。', '¿Por qué no vas a la fiesta?']], tr: 'Explicación → んです.' },
    w4_shuujo: { name: 'Partículas finales', pat: '〜なあ · 〜ね · 〜よ', es: 'なあ = emoción · ね = acuerdo · よ = énfasis o aviso.', ex: [['トムさんのおねえさん、きれいだなあ。', '¡Qué guapa es la hermana de Tom!']], tr: 'ね compartir · よ informar.' },
    w4_kana: { name: 'Me pregunto / ojalá', pat: '〜かな(あ) · 〜かしら', es: 'Duda; con negativo, deseo (早く夏休みが来ないかなあ). かしら es femenino.', ex: [['試験{しけん}に受{う}からないかなあ。', 'Ojalá apruebe el examen.']], tr: 'ないかなあ = ojalá.' }
  }
};
WEEKS[5] = { n: 5, title: 'Semana 5 · 読む練習をしましょう', reading: 1, days: [], points: {},
  tips: [['メールやメモ', 'Busca las palabras importantes: 貸す/返す/借りる, あげる/もらう/くれる, peticiones (〜てもらえませんか, 〜ていただけませんか), までに/まで.'], ['説明文', 'Cuidado con las preguntas "〜ではないもの" (la que NO es): están subrayadas.'], ['案内板・注意書き', 'Expresiones de aviso y prohibición: 〜ないでください · 〜てはいけない · 〜なければならない · 〜てもいい.'], ['長めの文章①', 'Hay preguntas por párrafo: lee el primero y contesta la primera.'], ['長めの文章②', 'Ojo con los conectores (sobre todo los de contraste) y con los demostrativos: suelen referirse a lo anterior.'], ['広告・お知らせ', 'Lee primero la pregunta y busca solo esa parte. Puede haber cálculos sencillos.']] };
WEEKS[6] = { n: 6, title: 'Semana 6 · 聞く練習をしましょう', listening: 1, days: [], points: {},
  tips: [['会話らしい表現', 'En preguntas casuales no se dice か: sube la entonación (おいしい？↗). Al rechazar se alarga el final: 明日は、ちょっとー…。'], ['「ない」を使った表現', '〜じゃない？ = creo que ~ (いいんじゃない？). 〜ないかな(あ) = ojalá (早く来ないかな).'], ['気持ちの表現', 'えー (antes de hablar) · えーっと (pensando) · えーっ！/ うそー！ (sorpresa) · へえー / すごーい (admiración).'], ['Fechas y números', '半 = 30 分. Días: ついたち, ふつか, みっか, よっか, いつか, むいか, なのか, ようか, ここのか, とおか, じゅうよっか, はつか, にじゅうよっか. Toma notas con números.'], ['課題理解', 'Lee las opciones antes de escuchar. Explicación + pregunta → conversación → pregunta otra vez.'], ['ポイント理解', 'Tras la pregunta hay una pausa para leer las opciones. Ojo con 父/母 vs お父さん/お母さん, 主人/ご主人, 妻/奥さん, y con quién es la pregunta.'], ['発話表現', 'Mira a la persona de la flecha. お先に失礼します · どうぞお入りください · すみません · お大事に · 〜してくださいませんか · 〜しませんか.'], ['即時応答', 'La respuesta a どこに行きますか no siempre es un lugar (食事に行きます). Las negativas son indirectas: その日は、ちょっと…。']] };

// Todos los puntos de gramática, en el orden del libro (S1 → S4)
const GWEEKS = [1, 2, 3, 4];
const PTS = {}, PT_WEEK = {};
for (const w of GWEEKS) for (const k in WEEKS[w].points) { PTS[k] = WEEKS[w].points[k]; PT_WEEK[k] = w; }
const GPTS = Object.keys(PTS);
