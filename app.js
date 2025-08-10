
'use strict';
const DATA = {"innovation_title": "AI English Coach for Primary Students", "authors": ["ดร. นทีธร นาคพรหม", "นางสาวสิรินาถ สีนวน"], "version": "1.0", "date_created": "2025-08-10", "description": "ชุดบทเรียนภาษาอังกฤษ 12 บท สำหรับใช้กับ AI Chatbot เพื่อพัฒนาทักษะการสื่อสารของนักเรียนประถมศึกษา", "weeks": [{"week": 1, "theme": "Me & My Classroom", "mission": "Introduce yourself (name + age) and 2 classroom objects", "vocab": ["name", "age", "book", "pen", "bag", "chair", "red", "blue"], "target_language": ["My name is …", "This is a …", "It is red/blue."], "dialog": [{"bot": "What is your name?", "choices": ["My name is Tom.", "I am Tom."], "model": "My name is Tom."}, {"bot": "What is this? (book/pen)", "choices": ["It is a book.", "It is a pen."], "model": "It is a book."}]}, {"week": 2, "theme": "Family & Friends", "mission": "Make 3 sentences about your family", "vocab": ["mother", "father", "brother", "sister", "friend", "like", "love"], "target_language": ["This is my …", "I have …", "She has …"], "dialog": [{"bot": "Who is she?", "choices": ["She is my mother.", "He is my brother."], "model": "She is my mother."}]}, {"week": 3, "theme": "Numbers & Time", "mission": "Say 3 daily activities with time", "vocab": ["1-20", "o’clock", "morning", "afternoon", "evening"], "target_language": ["It is two o’clock.", "I get up at …"], "dialog": [{"bot": "What time is it?", "choices": ["It is two o’clock.", "It is five o’clock."], "model": "It is two o’clock."}]}, {"week": 4, "theme": "Food & Drinks", "mission": "Order 1 food + 1 drink in English", "vocab": ["rice", "noodles", "bread", "milk", "juice", "water", "like", "don’t like"], "target_language": ["I like …", "I don’t like …", "I’d like …, please."], "dialog": [{"bot": "What would you like to eat?", "choices": ["I’d like rice, please.", "I’d like noodles, please."], "model": "I’d like rice, please."}]}, {"week": 5, "theme": "Animals", "mission": "Describe your favorite animal", "vocab": ["cat", "dog", "fish", "bird", "big", "small", "fast", "slow"], "target_language": ["It is a cat.", "It is small and fast."], "dialog": [{"bot": "What is your favorite animal?", "choices": ["My favorite animal is a cat.", "My favorite animal is a dog."], "model": "My favorite animal is a cat."}]}, {"week": 6, "theme": "My House", "mission": "Say 3 sentences about your house", "vocab": ["kitchen", "bedroom", "bed", "table", "chair", "in", "on", "under"], "target_language": ["The bed is in the bedroom.", "The book is on the table."], "dialog": [{"bot": "Where is the bed?", "choices": ["The bed is in the bedroom.", "The bed is on the table."], "model": "The bed is in the bedroom."}]}, {"week": 7, "theme": "Hobbies", "mission": "Tell 3 hobbies you like/love", "vocab": ["play football", "draw", "read", "sing", "dance", "swimming"], "target_language": ["I like drawing.", "I love swimming."], "dialog": [{"bot": "What do you like to do?", "choices": ["I like drawing.", "I like swimming."], "model": "I like drawing."}]}, {"week": 8, "theme": "Weather & Clothes", "mission": "Choose clothes for today’s weather", "vocab": ["sunny", "rainy", "cold", "hot", "T-shirt", "jacket", "shoes"], "target_language": ["It is rainy.", "I wear a jacket."], "dialog": [{"bot": "What is the weather today?", "choices": ["It is sunny.", "It is rainy."], "model": "It is rainy."}]}, {"week": 9, "theme": "Places in Town", "mission": "Give directions to 2 places", "vocab": ["school", "park", "shop", "hospital", "left", "right", "straight"], "target_language": ["Go left/right.", "The park is next to the school."], "dialog": [{"bot": "Where is the park?", "choices": ["The park is next to the school.", "The park is on the school."], "model": "The park is next to the school."}]}, {"week": 10, "theme": "Transport", "mission": "Say how you go to 3 places", "vocab": ["bus", "car", "train", "bike", "go", "ride", "take"], "target_language": ["I go to school by bus.", "How do you go …?"], "dialog": [{"bot": "How do you go to school?", "choices": ["I go to school by bus.", "I go to school by car."], "model": "I go to school by bus."}]}, {"week": 11, "theme": "Health & Feelings", "mission": "Make 3 sentences about your feelings today", "vocab": ["happy", "sad", "tired", "sick", "headache", "hungry", "thirsty"], "target_language": ["I am happy.", "I have a headache."], "dialog": [{"bot": "How are you today?", "choices": ["I am happy.", "I am sad."], "model": "I am happy."}]}, {"week": 12, "theme": "Review & Show & Tell", "mission": "Give a 5-sentence self-introduction", "vocab": [], "target_language": ["My name is … I am … I like …"], "dialog": [{"bot": "Can you introduce yourself?", "model": "My name is Tom. I am ten years old. I like football. I have one sister. I am happy."}]}]};

const el = {
  weekSel: document.getElementById('weekSel'),
  startBtn: document.getElementById('start'),
  chat: document.getElementById('chat'),
  choices: document.getElementById('choices'),
  readBtn: document.getElementById('speak'),
  micBtn: document.getElementById('mic'),
  xpEl: document.getElementById('xp'),
  streakEl: document.getElementById('streak'),
  author: document.getElementById('author'),
  version: document.getElementById('version'),
  className: document.getElementById('className'),
  studentName: document.getElementById('studentName'),
  exportBtn: document.getElementById('export'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),
};

el.author.textContent = DATA.authors.join(' & ');
el.version.textContent = 'v' + DATA.version;

let state = JSON.parse(localStorage.getItem('coach_state') || '{"xp":0,"streak":0}');
let queue = JSON.parse(localStorage.getItem('coach_queue') || '[]');
function save(){ localStorage.setItem('coach_state', JSON.stringify(state)); el.xpEl.textContent = state.xp; el.streakEl.textContent = state.streak; }
function saveQueue(){ localStorage.setItem('coach_queue', JSON.stringify(queue)); }
save();

function addBubble(who, text){
  const d=document.createElement('div'); d.className='bubble ' + (who==='me'?'me':'bot');
  d.textContent=(who==='me'?'👧 ':'🟡 ')+text; el.chat.appendChild(d); el.chat.scrollTop=el.chat.scrollHeight;
}
function praise(){ const msgs=['Great job! ⭐️','Nice try! 👍','Well done! 😊']; return msgs[Math.floor(Math.random()*msgs.length)]; }
function assess(text){
  let score = {grammar:3, vocab:3, fluency:3}; let tips=[];
  if(/\b(he|she|it)\s+(have|like|want)\b/i.test(text)){ score.grammar=2; tips.push("For he/she/it, use has/likes/wants."); }
  if(/\ba\s+[aeiou]/i.test(text)){ score.grammar=Math.min(score.grammar,2); tips.push("Use 'an' before vowel sounds."); }
  if(text.trim().split(/\s+/).length < 5){ score.fluency=2; tips.push("Try a longer sentence. Add because/and."); }
  const fb = praise() + ' ' + (tips.length? tips.join(' ') : 'Well-formed sentence!');
  return {score, feedback: fb, hint:"Add one more detail with 'because'."};
}
function tts(text){ try{ const u=new SpeechSynthesisUtterance(text); u.lang='en-US'; speechSynthesis.speak(u);}catch(e){} }
function startMic(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert('SpeechRecognition not supported on this device/browser.'); return; }
  const rec = new SR(); rec.lang='en-US'; rec.interimResults=false; rec.maxAlternatives=1;
  rec.onresult = (e)=>{ const t=e.results[0][0].transcript; handleUser(t); };
  rec.onerror = (e)=> addBubble('bot','Mic error: '+e.error); rec.start();
}
function logEvent(payload){
  const evt = Object.assign({ ts:new Date().toISOString(), week: parseInt(el.weekSel.value), class: el.className.value||'Unknown', student: el.studentName.value||'Unknown' }, payload);
  queue.push(evt); saveQueue();
  fetch('./api/ingest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(evt)})
    .then(r=>{ if(!r.ok) throw new Error('HTTP '+r.status); queue=[]; saveQueue(); })
    .catch(()=>{});
}
function handleUser(text){
  addBubble('me', text);
  const result = assess(text);
  addBubble('bot', result.feedback); tts(result.feedback);
  const bonus = (result.score.grammar===3 && result.score.fluency===3)?10:5;
  state.xp += bonus; state.streak += 1; save();
  logEvent({type:'utterance', text, score: result.score, bonus});
}
function clearUI(){ el.choices.innerHTML=''; el.chat.innerHTML=''; }
function startWeek(n){
  clearUI();
  const week = DATA.weeks.find(w=>w.week===n);
  if(!week){ addBubble('bot','Week not found'); return; }
  addBubble('bot', `Week ${n}: ${week.theme}`);
  if(week.mission) addBubble('bot','Mission: '+week.mission);
  const first = (week.dialog && week.dialog[0]) || null;
  if(first){
    addBubble('bot', first.bot || 'Say something!');
    (first.choices||[]).forEach(c=>{ const b=document.createElement('button'); b.textContent=c; b.onclick=()=>handleUser(c); el.choices.appendChild(b); });
  }else{ addBubble('bot','Start with your own sentence!'); }
  logEvent({type:'start_week'});
}
// Export/Import
function exportData(){
  const blob = new Blob([JSON.stringify({state, queue, dataVersion: DATA.version}, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='ai-coach-export.json'; a.click(); URL.revokeObjectURL(url);
}
function importData(file){
  const reader = new FileReader(); reader.onload = ()=>{ try{ const obj=JSON.parse(reader.result);
    if(obj.state){ state=obj.state; save(); } if(Array.isArray(obj.queue)){ queue=obj.queue; saveQueue(); } alert('Imported successfully.'); }catch(e){ alert('Import failed: '+e.message); }};
  reader.readAsText(file);
}
(function init(){
  DATA.weeks.forEach(w=>{ const o=document.createElement('option'); o.value=w.week; o.textContent='Week '+w.week+' — '+w.theme; el.weekSel.appendChild(o); });
  addBubble('bot',"Welcome! Enter Class/Student, choose a week, then tap Start. You can also use the 🎤 mic.");
})();
el.readBtn.addEventListener('click', ()=>{ const bubbles=[...document.querySelectorAll('.bot')].map(b=>b.textContent.replace(/^🟡\s*/,'')); tts(bubbles.slice(-1)[0] || "Hello! Let's practice English."); });
el.micBtn.addEventListener('click', startMic);
el.startBtn.addEventListener('click', ()=> startWeek(parseInt(el.weekSel.value)));
el.exportBtn.addEventListener('click', exportData);
el.importBtn.addEventListener('click', ()=> el.importFile.click());
el.importFile.addEventListener('change', (e)=> e.target.files[0] && importData(e.target.files[0]));
if ('serviceWorker' in navigator){ window.addEventListener('load', ()=>{ navigator.serviceWorker.register('./sw.js').catch(()=>{}); }); }
