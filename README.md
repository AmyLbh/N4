# Sin Falla N4

App de estudio para el JLPT N4 con el libro **日本語総まとめ N4 (文法・読解・聴解)** completo: semanas 1-4 de gramática, 5 de lectura y 6 de escucha. Es un solo archivo HTML autocontenido (`dist/sin-falla-n4.html`), mobile-first, con estética de catedral gótica hackeada.

## Reporte de cobertura

| Banco | Cantidad | Detalle |
|---|---|---|
| Kanji N5 + N4 | **289** (81 N5 · 208 N4) | 246 aparecen en ≥ 2 listas; **43 marcados "revisar"** porque solo figuran en la lista antigua de Waller (nivel 3/4) y no en la estimación moderna: 民合市回首的都区県進産引所村無可身説乗声働好頭低門光太森林顔短薬便軽池遠弱暗洗菜耳暑寒 |
| Vocabulario | **1,409** (717 N5 · 667 N4 · 25 del libro) | 1,233 coinciden en las dos versiones de la lista Tanos; 151 marcados "revisar" (variantes de escritura que no coinciden exactas); 128 etiquetadas Semana 2 |
| Gramática Semanas 1-4 | **607 preguntas** (S1 107 · S2 286 · S3 100 · S4 114) | 91 puntos con ficha (patrón, explicación, ejemplos del libro, truco). Incluye los ejercicios del libro y las 4 まとめ問題; las まとめ las resolvió la app porque la clave oficial está en el cuadernillo aparte. 40 preguntas originales de refuerzo en `grammar_extra.txt` para los puntos con pocas preguntas |
| Conjugador | 14 formas | ahora con causativa (させる) y causativa pasiva (させられる), según las tablas del libro |
| 他動詞 / 自動詞 | 34 pares | modo propio (pareja y partícula を/が) y tabla en la Biblioteca |
| Partículas | 40 | |
| Contadores | 16 contadores × 10 números | lecturas irregulares |
| Lecturas 読解 | 17 textos | 6 originales (Semana 2) + 11 del libro (Semana 5, ejercicios y まとめ, respuestas resueltas por la app) |
| 聴解 del libro | 11 ítems | los ejemplos con guion de la Semana 6 (課題理解, ポイント理解, 発話表現, 即時応答), añadidos al simulacro. El audio del CD no está en el PDF: se leen con la voz ja-JP |
| Frases de El Espejo | 151 en 14 categorías | |
| Simulacro JLPT N4 | formato oficial vigente desde 2020 | 文字・語彙 28 (7·5·8·4·4) en 25 min · 文法・読解 29 (13·4·4·3·3·2) en 55 min · 聴解 28 (8·7·5·8) en 35 min. Las preguntas de vocabulario se generan del banco; las de sinónimos, uso, textos y diálogos están escritas en `data/authored/jlpt.js`. No se copian exámenes reales (tienen derechos de autor) |

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
  grammar.txt     banco de preguntas de la Semana 2 (formato descrito en la cabecera)
  grammar_w1/w3/w4.txt  semanas 1, 3 y 4 del libro (+ まとめ de la 2) · grammar_extra.txt refuerzo
  book.js         lecturas de la Semana 5, ejemplos de escucha de la Semana 6, pares 他動詞/自動詞
  s2.txt          palabras de la Semana 2 (+ extras del libro)
  extra.js        El Espejo, lecturas, partículas, contadores, pares confusos
app/            código de la app (shell.html, core, audio, weeks, weeks_book, quiz, app, jlptui, main)
tools/          build.js (datos), assemble.py (HTML final), num.js (lecturas de números)
dist/           sin-falla-n4.html: el archivo final
```

Reconstruir: `cd tools && npm i kuromoji && node build.js && python3 assemble.py`

## Cómo añadir contenido
1. **Gramática:** añade líneas a un `data/authored/grammar_*.txt` (y el nombre del archivo a la lista de `tools/build.js`, al final para no cambiar los ids). Los puntos `wN_…` se asignan a la semana N; el resto, a la 2.
2. **Puntos:** su ficha va en `app/weeks.js` (semana 2) o `app/weeks_book.js` (`WEEKS[n].points` y `days`).
3. **Lecturas:** `READINGS.push({ id, wk, day, title, text, es, qs })` en `book.js`; la opción correcta va primero.
4. Reconstruye. El progreso guardado se conserva, porque los ítems se identifican por clave (`v:id`, `k:漢`, `g:id`, `td:n`).

## Derechos
Los textos y ejercicios del libro se transcribieron solo para uso personal de estudio. El libro prohíbe su reproducción: no publiques esta app ni este repositorio.
