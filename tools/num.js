// Japanese numeral + counter readings
const D={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
function parse(s){let tot=0,sec=0,cur=0;for(const c of s){if(D[c]){cur=D[c]}else if(c==='十'){sec+=(cur||1)*10;cur=0}else if(c==='百'){sec+=(cur||1)*100;cur=0}else if(c==='千'){sec+=(cur||1)*1000;cur=0}else if(c==='万'){tot+=(sec+cur||1)*10000;sec=0;cur=0}else if(c==='億'){tot+=(sec+cur||1)*1e8;sec=0;cur=0}}return tot+sec+cur}
const U=['','いち','に','さん','よん','ご','ろく','なな','はち','きゅう'];
function base(n){if(n===0)return '';let s='';
 if(n>=1e8){s+=base(Math.floor(n/1e8))+'おく';n%=1e8}
 if(n>=10000){s+=base(Math.floor(n/10000))+'まん';n%=10000}
 const th=Math.floor(n/1000),h=Math.floor(n/100)%10,t=Math.floor(n/10)%10,o=n%10;
 if(th)s+=th===1?'せん':th===3?'さんぜん':th===8?'はっせん':U[th]+'せん';
 if(h)s+=h===1?'ひゃく':h===3?'さんびゃく':h===6?'ろっぴゃく':h===8?'はっぴゃく':U[h]+'ひゃく';
 if(t)s+=(t===1?'':U[t])+'じゅう';
 if(o)s+=U[o];return s}
// replace the last-digit part with a special form
function unitOf(n){const o=n%10,t=Math.floor(n/10)%10; return o?o:(t?10:0)}
function withLast(n,f){const o=n%10,t=Math.floor(n/10)%10;
 if(o){const r=f(o); return r==null?null:base(n-o)+r}
 if(t){const r=f(10); return r==null?null:base(n-t*10)+(t>1?U[t]:'')+r}
 return null}
const H={1:'いっ',6:'ろっ',8:'はっ',10:'じゅっ'};
function counter(n,c){
 const def=base(n);
 const p=(m,dflt)=>withLast(n,u=>m[u]!=null?m[u]:null)||dflt;
 switch(c){
  case 'つ': return n<=10?['','ひとつ','ふたつ','みっつ','よっつ','いつつ','むっつ','ななつ','やっつ','ここのつ','とお'][n]:def;
  case '人': return n===1?'ひとり':n===2?'ふたり':(p({4:'よ',7:'しち'},def)+'にん');
  case '時': return p({4:'よ',7:'しち',9:'く'},def)+'じ';
  case '時半': return p({4:'よ',7:'しち',9:'く'},def)+'じはん';
  case '時間': return p({4:'よ',7:'なな',9:'く'},def)+'じかん';
  case '月': return p({4:'し',7:'しち',9:'く'},def)+'がつ';
  case 'か月': return p({1:'いっ',6:'ろっ',10:'じゅっ'},def)+'かげつ';
  case '日': {const T=['','ついたち','ふつか','みっか','よっか','いつか','むいか','なのか','ようか','ここのか','とおか'];
    if(n===1)return 'いちにち'; if(n<=10)return T[n]; if(n===14)return 'じゅうよっか'; if(n===20)return 'はつか'; if(n===24)return 'にじゅうよっか'; return def+'にち'}
  case '年': return p({4:'よ',9:'きゅう'},def)+'ねん';
  case '週間': return p({1:'いっ',8:'はっ',10:'じゅっ'},def)+'しゅうかん';
  case '分': return p({1:'いっ',3:'さん',4:'よん',6:'ろっ',8:'はっ',10:'じゅっ'},def)+({1:'ぷん',3:'ぷん',4:'ぷん',6:'ぷん',8:'ぷん',10:'ぷん'}[unitOf(n)]||'ふん');
  case '本': case '匹': case '杯': {const b={本:['ほん','ぼん','ぽん'],匹:['ひき','びき','ぴき'],杯:['はい','ばい','ぱい']}[c];const u=unitOf(n);
    return p(H,def)+(u===3?b[1]:[1,6,8,10].includes(u)?b[2]:b[0])}
  case '回': case '個': case '軒': case '階': {const u=unitOf(n); let k={回:'かい',個:'こ',軒:'けん',階:'かい'}[c]; if(u===3&&c==='階')k='がい'; if(u===3&&c==='軒')k='げん'; return p(H,def)+k}
  case '歳': case '冊': return p({1:'いっ',8:'はっ',10:'じゅっ'},def)+(c==='歳'?'さい':'さつ');
  case '点': return p({1:'いっ',6:'ろく',8:'はっ',10:'じゅっ'},def)+'てん';
  case '度': case '台': case '番': case '倍': case '枚': case '円':
    return (c==='円'?p({4:'よ'},def):def)+{度:'ど',台:'だい',番:'ばん',倍:'ばい',枚:'まい',円:'えん'}[c];
  case '': return def;
 }
 return def+c;
}
module.exports={parse,base,counter};
