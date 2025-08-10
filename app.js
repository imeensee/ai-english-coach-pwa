'use strict';

// ---------- อ้างอิง element ในหน้าเรียน ----------
const el = {
  weekSel: document.getElementById('weekSel'),
  startBtn: document.getElementById('start'),
  chat: document.getElementById('chat'),
  choices: document.getElementById('choices'),
  readBtn: document.getElementById('read'),
  micBtn: document.getElementById('speak'),
  xpEl: document.getElementById('xp'),
  streakEl: document.getElementById('streak'),
  className: document.getElementById('className'),
  studentName: document.getElementById('studentName'),
  exportBtn: document.getElementById('export'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),
  syncBtn: document.getElementById('sync')
};

// ---------- state + queue (เก็บในเครื่อง) ----------
let state = JSON.parse(localStorage.getItem('coach_state') || '{"xp":0,"streak":0}');
let queue = JSON.parse(localStorage.getItem('coach_queue') || '[]');
function save(){ localStorage.setItem('coach_state', JSON.stringify(state)); el.xpEl.textContent = state.xp; el.streakEl.textContent = state.streak; }
function saveQueue(){ localStorage.setItem('coach_queue', JSON.stringify(queue)); }
save();

// ---------- Firebase: อ่าน config แล้วเชื่อม Firestore ----------
let fb = null;
async function initFirebase(){
  try{
    const res = await fetch('./firebase-config.json');
    if(!res.ok) throw new Error('no cfg');
    const cfg = await res.json();

    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js');
    const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js');

    const app = initializeApp(cfg);
    const db  = getFirestore(app);
    fb = {
      add: (evt) => addDoc(collection(db, 'events'), {
        ...evt,
        ts: new Date().toISOString(),
        createdAt: serverTimestamp()
      })
    };
    console.log('Firebase ready');
  }catch(e){
    console.log('Offline mode only (no Firestore).', e.message);
  }
}
initFirebase();

// ---------- helper ----------
function addBubble(who, text){
  const d = document.createElement('div');
  d.className = 'bubble ' + (who==='me' ? 'me' : 'bot');
  d.textContent = (who==='me' ? '👧 ' : '🟡 ') + text;
  el.chat.appendChild(d); el.chat.scrollTop = el.chat.scrollHeight;
}
function tts(text){ try{ const u=new SpeechSynthesisUtterance(text); u.lang='en-US'; speechSynthesis.speak(u);}catch(e){} }
function praise(){ return ['Great job! ⭐️','Nice try! 👍','Well done! 😊'][Math.floor(Math.random()*3)]; }
function assess(text){
  let score={grammar:3,vocab:3,fluency:3}; let tips=[];
  if(/\b(he|she|it)\s+(have|like|want)\b/i.test(text)){ score.grammar=2; tips.push("For he/she/it, use has/likes/wants."); }
  if(/\ba\s+[aeiou]/i.test(text)){ score.grammar=Math.min(score.grammar,2); tips.push("Use 'an' before vowel sounds."); }
  if(text.trim().split(/\s+/).length<5){ score.fluency=2; tips.push("Try a longer sentence. Add because/and."); }
  return {score, feedback: praise() + ' ' + (tips[0]||'Well-formed sentence!')};
}

async function pushEvent(evt){
  if(fb){ try{ await fb.add(evt); return true; }catch(e){ console.log('FB add failed', e); } }
  return false;
}
async function syncQueue(){
  if(!queue.length){ alert('Nothing to sync.'); return; }
  let ok=0;
  for(const evt of [...queue]){
    if(await pushEvent(evt)){ ok++; queue.shift(); }
  }
  saveQueue(); alert('Synced '+ok+' events.');
}
function logEvent(payload){
  const evt = {
    week: parseInt(el.weekSel.value),
    class: el.className.value || 'Unknown',
    student: el.studentName.value || 'Unknown',
    ...payload
  };
  queue.push(evt); saveQueue();
  pushEvent(evt).then(done=>{ if(done){ queue.pop(); saveQueue(); } });
}

function handleUser(text){
  addBubble('me', text);
  const res = assess(text);
  addBubble('bot', res.feedback); tts(res.feedback);
  const bonus = (res.score.grammar===3 && res.score.fluency===3) ? 10 : 5;
  state.xp += bonus; state.streak += 1; save();
  logEvent({type:'utterance', text, score: res.score, bonus});
}

function clearUI(){ el.choices.innerHTML=''; el.chat.innerHTML=''; }
function startWeek(n){
  clearUI();
  const week = (window.DATA && window.DATA.weeks || []).find(w=>w.week===n);
  if(!week){ addBubble('bot','Week not found'); return; }
  addBubble('bot', `Week ${n}: ${week.theme}`);
  if(week.mission) addBubble('bot', 'Mission: '+week.mission);
  const first=(week.dialog||[])[0];
  if(first){
    addBubble('bot', first.bot||'Say something!');
    (first.choices||[]).forEach(c=>{
      const b=document.createElement('button'); b.textContent=c; b.onclick=()=>handleUser(c); el.choices.appendChild(b);
    });
  } else {
    addBubble('bot','Start with your own sentence!');
  }
  logEvent({type:'start_week'});
}

// export/import
function exportData(){
  const blob=new Blob([JSON.stringify({state,queue},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download='ai-coach-export.json'; a.click(); URL.revokeObjectURL(url);
}
function importData(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const obj=JSON.parse(r.result);
      if(obj.state){ state=obj.state; save(); }
      if(Array.isArray(obj.queue)){ queue=obj.queue; saveQueue(); }
      alert('Imported successfully.');
    }catch(e){ alert('Import failed: '+e.message); }
  };
  r.readAsText(file);
}

// init UI
(function init(){
  if(window.DATA && window.DATA.weeks){
    window.DATA.weeks.forEach(w=>{
      const o=document.createElement('option');
      o.value=w.week; o.textContent=`Week ${w.week} — ${w.theme}`;
      el.weekSel.appendChild(o);
    });
  }
  addBubble('bot', "Welcome! Enter Class/Student, choose a week, then tap Start. You can also use the 🎤 mic.");
})();
el.readBtn?.addEventListener('click', ()=>{
  const bubbles=[...document.querySelectorAll('.bot')].map(b=>b.textContent.replace(/^🟡\s*/,''));
  tts(bubbles.slice(-1)[0]||"Hello! Let's practice English.");
});
el.micBtn?.addEventListener('click', ()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ alert('Mic not supported in this browser.'); return; }
  const rec=new SR(); rec.lang='en-US'; rec.interimResults=false; rec.maxAlternatives=1;
  rec.onresult=(e)=>handleUser(e.results[0][0].transcript);
  rec.onerror=(e)=>addBubble('bot','Mic error: '+e.error);
  rec.start();
});
el.startBtn?.addEventListener('click', ()=> startWeek(parseInt(el.weekSel.value)));
el.exportBtn?.addEventListener('click', exportData);
el.importBtn?.addEventListener('click', ()=> el.importFile.click());
el.importFile?.addEventListener('change', e=> e.target.files[0] && importData(e.target.files[0]));
el.syncBtn?.addEventListener('click', syncQueue);

// PWA
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}
