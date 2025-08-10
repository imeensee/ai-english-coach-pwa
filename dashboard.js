
'use strict';
const cards = document.getElementById('cards');
const errBody = document.querySelector('#errorsTable tbody');
const byClassBody = document.querySelector('#byClass tbody');
function renderSummary(events){
  const sessions = events.filter(e=>e.type==='start_week').length;
  const utter = events.filter(e=>e.type==='utterance');
  const xp = utter.reduce((a,b)=>a+(b.bonus||0),0);
  const topErrors = {};
  utter.forEach(u=>{
    if(!u.score) return;
    if(u.score.grammar<3){ topErrors['grammar']=(topErrors['grammar']||0)+1; }
    if(u.score.fluency<3){ topErrors['fluency']=(topErrors['fluency']||0)+1; }
    if((u.text||'').match(/\ba\s+[aeiou]/i)){ topErrors['a/an rule']=(topErrors['a/an rule']||0)+1; }
    if((u.text||'').match(/\b(he|she|it)\s+(have|like|want)\b/i)){ topErrors['3rd person -s']=(topErrors['3rd person -s']||0)+1; }
  });
  cards.innerHTML='';
  [['Total sessions', sessions], ['Total utterances', utter.length], ['Total XP (sum bonus)', xp]].forEach(([k,v])=>{
    const c=document.createElement('div'); c.className='card'; c.innerHTML=`<strong>${k}</strong><div>${v}</div>`; cards.appendChild(c);
  });
  errBody.innerHTML=''; Object.entries(topErrors).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([k,v])=>{
    const tr=document.createElement('tr'); tr.innerHTML=`<td>${k}</td><td>${v}</td>`; errBody.appendChild(tr);
  });
  const map = {};
  utter.forEach(u=>{ const key=(u.class||'Unknown')+'||'+(u.student||'Unknown'); const m=map[key]||{cls:u.class||'Unknown',stu:u.student||'Unknown',sessions:0,xp:0}; m.xp+=(u.bonus||0); map[key]=m; });
  events.filter(e=>e.type==='start_week').forEach(s=>{ const key=(s.class||'Unknown')+'||'+(s.student||'Unknown'); const m=map[key]||{cls:s.class||'Unknown',stu:s.student||'Unknown',sessions:0,xp:0}; m.sessions+=1; map[key]=m; });
  byClassBody.innerHTML=''; Object.values(map).forEach(m=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${m.cls}</td><td>${m.stu}</td><td>${m.sessions}</td><td>${m.xp}</td>`; byClassBody.appendChild(tr); });
}
document.getElementById('loadLocal').addEventListener('click', ()=>{
  const q = JSON.parse(localStorage.getItem('coach_queue')||'[]'); renderSummary(q);
});
document.getElementById('clearLocal').addEventListener('click', ()=>{
  localStorage.removeItem('coach_queue'); alert('Cleared local event queue.');
});
document.getElementById('fetchServer').addEventListener('click', ()=>{
  fetch('./api/summary').then(r=>r.json()).then(data=>{ renderSummary(data.events||data.items||[]); }).catch(()=>alert('Cannot fetch from server.'));
});
