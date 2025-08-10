'use strict';

async function loadFirebaseEvents(){
  try{
    const res = await fetch('./firebase-config.json');
    if(!res.ok) throw new Error('no cfg');
    const cfg = await res.json();
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js');
    const { getFirestore, collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js');
    const app = initializeApp(cfg);
    const db  = getFirestore(app);
    const q   = query(collection(db, 'events'), orderBy('createdAt'));
    const snap= await getDocs(q);
    return snap.docs.map(d=> d.data());
  }catch(e){
    console.log('Firestore not configured', e.message);
    return null;
  }
}

const cards = document.getElementById('cards');
const byClassBody = document.querySelector('#byClass tbody');
let ALL_EVENTS = [];

function applySchoolFilter(events){
  const code = (document.getElementById('filterSchool').value || '').trim();
  if(!code) return events;
  return events.filter(e => (e.school||'').toUpperCase() === code.toUpperCase());
}

function renderCharts(events){
  const ctx1 = document.getElementById('xpLine');
  const ctx2 = document.getElementById('errBar');
  const ctx3 = document.getElementById('classBar');

  const utter = events.filter(e=>e.type==='utterance').sort((a,b)=> (a.ts||'').localeCompare(b.ts||''));
  const labels = utter.map(u=> (u.ts? new Date(u.ts): new Date())).map(d=> d.toLocaleDateString());
  const xp = utter.map(u=> u.bonus||0);
  new Chart(ctx1, { type:'line', data:{ labels, datasets:[{ label:'XP', data: xp }] } });

  const errMap = {};
  utter.forEach(u=>{
    const sc=u.score||{};
    if(sc.grammar<3) errMap['grammar']=(errMap['grammar']||0)+1;
    if(sc.fluency<3) errMap['fluency']=(errMap['fluency']||0)+1;
    if((u.text||'').match(/\ba\s+[aeiou]/i)) errMap['a/an rule']=(errMap['a/an rule']||0)+1;
    if((u.text||'').match(/\b(he|she|it)\s+(have|like|want)\b/i)) errMap['3rd person -s']=(errMap['3rd person -s']||0)+1;
  });
  new Chart(ctx2, { type:'bar', data:{ labels:Object.keys(errMap), datasets:[{ label:'Errors', data:Object.values(errMap) }] } });

  const byClass = {};
  events.forEach(e=>{ if(e.type==='start_week'){ byClass[e.class||'Unknown']=(byClass[e.class||'Unknown']||0)+1; } });
  new Chart(ctx3, { type:'bar', data:{ labels:Object.keys(byClass), datasets:[{ label:'Sessions', data:Object.values(byClass) }] } });
}

function renderSummary(events){
  const sessions = events.filter(e=>e.type==='start_week').length;
  const utter = events.filter(e=>e.type==='utterance');
  const totalXP = utter.reduce((a,b)=> a+(b.bonus||0),0);

  cards.innerHTML='';
  [['Total sessions', sessions], ['Total utterances', utter.length], ['Total XP', totalXP]]
    .forEach(([k,v])=>{
      const c=document.createElement('div'); c.className='card';
      c.innerHTML=`<strong>${k}</strong><div>${v}</div>`; cards.appendChild(c);
    });

  const map={};
  utter.forEach(u=>{
    const key=(u.class||'Unknown')+'||'+(u.student||'Unknown');
    const m=map[key]||{cls:u.class||'Unknown', stu:u.student||'Unknown', sessions:0, xp:0};
    m.xp+=(u.bonus||0); map[key]=m;
  });
  events.filter(e=>e.type==='start_week').forEach(s=>{
    const key=(s.class||'Unknown')+'||'+(s.student||'Unknown');
    const m=map[key]||{cls:s.class||'Unknown', stu:s.student||'Unknown', sessions:0, xp:0};
    m.sessions+=1; map[key]=m;
  });

  byClassBody.innerHTML='';
  Object.values(map).forEach(m=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${m.cls}</td><td>${m.stu}</td><td>${m.sessions}</td><td>${m.xp}</td>`;
    byClassBody.appendChild(tr);
  });

  renderCharts(events);
}

document.getElementById('applyFilter').addEventListener('click', ()=>{
  const filtered = applySchoolFilter(ALL_EVENTS);
  renderSummary(filtered);
});
document.getElementById('loadLocal').addEventListener('click', ()=>{
  ALL_EVENTS = JSON.parse(localStorage.getItem('coach_queue')||'[]');
  renderSummary(applySchoolFilter(ALL_EVENTS));
});
document.getElementById('clearLocal').addEventListener('click', ()=>{
  localStorage.removeItem('coach_queue'); alert('Cleared local data.');
});
document.getElementById('fetchServer').addEventListener('click', async ()=>{
  const ev=await loadFirebaseEvents(); if(!ev) return alert('Firestore not configured or no data.');
  ALL_EVENTS = ev; renderSummary(applySchoolFilter(ALL_EVENTS));
});
