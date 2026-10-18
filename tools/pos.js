const kuromoji=require('kuromoji');const fs=require('fs');
const base=JSON.parse(fs.readFileSync(process.argv[2])).voc;
kuromoji.builder({dicPath:__dirname+'/node_modules/kuromoji/dict'}).build((e,t)=>{
 const lvOrder={N5:0,N4:1};
 base.sort((a,b)=>lvOrder[a.lv]-lvOrder[b.lv]||a.r.localeCompare(b.r,'ja'));
 const out=base.map((v,i)=>{
  const w=v.w.replace(/^～|～$/g,'');
  const toks=t.tokenize(w);
  let pos='';
  if(toks.length===1||(toks.length===2&&toks[1].pos==='助動詞')){const k=toks[0];pos=[k.pos,k.pos_detail_1,k.conjugated_type].filter(x=>x&&x!=='*').join('/')}
  else pos='multi:'+toks.map(k=>k.pos).join('+');
  // verb grouping
  let g='';
  const en=v.en;
  if(/^to /.test(en)||/; to |, to /.test(en)){
    if(/^(する|為る)$/.test(v.w)||/する$/.test(v.r)&&v.w.endsWith('する')) g='v3';
    else if(v.r==='くる'||v.w==='来る') g='v3k';
    else { const k=toks[toks.length-1]; const ct=k.conjugated_type||''; if(ct.startsWith('五段')) g='v1'; else if(ct.startsWith('一段')) g='v2'; else if(ct.startsWith('サ変')) g='v3'; else if(ct.startsWith('カ変')) g='v3k'; else g='v?'}
  }
  return {id:i+1,...v,pos,g};
 });
 fs.writeFileSync(process.argv[3],JSON.stringify(out));
 fs.writeFileSync(process.argv[4],out.map(o=>[o.id,o.w,o.r,o.lv,o.g,o.en].join('|')).join('\n'));
});
