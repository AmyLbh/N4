# Sin Falla N4

App de estudio para el JLPT N4, centrada en la **Semana 2** del libro (文法を勉強しましょう②). Es un solo archivo HTML autocontenido (`dist/sin-falla-n4.html`), mobile-first, con estética de catedral gótica hackeada.

## Reporte de cobertura

| Banco | Cantidad | Detalle |
|---|---|---|
| Kanji N5 + N4 | **289** (81 N5 · 208 N4) | 246 aparecen en ≥ 2 listas; **43 marcados "revisar"** porque solo figuran en la lista antigua de Waller (nivel 3/4) y no en la estimación moderna: 民合市回首的都区県進産引所村無可身説乗声働好頭低門光太森林顔短薬便軽池遠弱暗洗菜耳暑寒 |
| Vocabulario | **1,409** (717 N5 · 667 N4 · 25 del libro) | 1,233 coinciden en las dos versiones de la lista Tanos; 151 marcados "revisar" (variantes de escritura que no coinciden exactas); 128 etiquetadas Semana 2 |
| Gramática Semana 2 | **268 preguntas** (236 入れる · 32 ★ ordenar) | 22 puntos, de 11 a 15 preguntas por punto; 63 trampas; 31 sacadas de tu libro (págs. 19-29) con su clave de respuestas |
| Partículas | 40 | |
| Contadores | 16 contadores × 10 números | lecturas irregulares |
| Lecturas 読解 | 6 textos, 18 preguntas | uno por día de la semana |
| Frases de El Espejo | 151 en 14 categorías | |

Cada kanji lleva: on'yomi, kun'yomi, significado en español, 2-3 palabras de ejemplo del banco, un truco mnemotécnico por componentes y, si aplica, su par confuso (46 pares, p. ej. 待/持, 午/牛, 買/売). Cada palabra lleva: lectura, español, tipo (G1/G2/G3, adj-i/na…), tema (18 temas), frase de ejemplo con furigana y traducción.

### Fuentes
- **Listas JLPT de Jonathan Waller** (tanos.co.uk, CC BY), en dos versiones independientes: `jamsinclair/open-anki-jlpt-decks` y `stephenmk/yomitan-jlpt-vocab` (esta última cruzada entrada por entrada con JMdict). tanos.co.uk, jisho.org y tatoeba no eran accesibles desde el entorno de construcción, así que se usaron estas copias en GitHub.
- **KANJIDIC2** (EDRDG, CC BY-SA) vía el paquete npm `kanjidic2-json`: lecturas, trazos y significados de referencia.
- Niveles de kanji cruzados con `davidluzgouveia/kanji-data` (niveles antiguo y nuevo de Waller) y `AnchorI/jlpt-kanji-dictionary`.
- Furigana de las frases generado con **kuromoji** (IPADIC); los números y contadores, y las lecturas ambiguas (行った, 角, 間, 一日中…), se corrigieron a mano o por regla.
- Las traducciones al español, los trucos, las frases de ejemplo, el banco de gramática, las lecturas y las frases de El Espejo se escribieron para esta app a partir de tu guía PDF y de tus anotaciones en el libro.

### Limitaciones
- No existe lista oficial del JLPT: las listas de Waller son una estimación. Por eso los ítems que solo están en una lista llevan la etiqueta "revisar".
- Las frases de ejemplo no salen de un corpus (Tatoeba estaba bloqueado): son originales y pueden sonar a libro de texto.
- El furigana automático se revisó en los casos ambiguos, pero no frase por frase. Si ves una lectura mal, avísame.
- El audio usa la voz ja-JP del dispositivo (SpeechSynthesis). Si el dispositivo no tiene voz japonesa, la app avisa y muestra la lectura en kana.
- El 聴解 de la Prueba Final es una aproximación con voz sintética, no audio real del examen.

## Estructura

```
data/sources/   listas originales (CSV) y bases derivadas; PDF de la guía
data/authored/  español, trucos, frases y gramática escritos a mano
  es_01..04.txt   vocabulario: id|español|tipo|tema|frase|traducción|correcciones
  kanji_es.txt    kanji|significado|truco
  grammar.txt     banco de preguntas (formato descrito en la cabecera)
  s2.txt          palabras de la Semana 2 (+ extras del libro)
  extra.js        El Espejo, lecturas, partículas, contadores, pares confusos
app/            código de la app (shell.html, core, audio, weeks, quiz, app, main)
tools/          build.js (datos), assemble.py (HTML final), num.js (lecturas de números)
dist/           sin-falla-n4.html: el archivo final
```

Reconstruir: `cd tools && npm i kuromoji && node build.js && python3 assemble.py`

## Cómo añadir la Semana 3
1. **Gramática:** añade líneas a `data/authored/grammar.txt` con nuevos ids de punto (p. ej. `F|kamoshirenai|…`).
2. **Puntos:** en `app/weeks.js` copia el bloque `WEEKS[2]` como `WEEKS[3]`, con sus `days` y `points` (nombre, patrón, explicación, ejemplos, truco), y cambia `CUR_WEEK = 3`.
3. **Vocabulario de la semana:** crea `data/authored/s3.txt` como `s2.txt` y, en `tools/build.js`, etiqueta esas palabras con `wk = 3`.
4. **Lecturas:** añade textos a `READINGS` en `extra.js` con `day` de la nueva semana.
5. Reconstruye. El progreso guardado se conserva, porque los ítems se identifican por clave (`v:id`, `k:漢`, `g:id`).
