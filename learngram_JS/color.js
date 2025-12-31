/* ---------- Utility functions ---------- */
const $ = id => document.getElementById(id);
const colorInput = $('colorInput'), fetchColorBtn = $('fetchColorBtn'), speakColorBtn = $('speakColorBtn'), clearColorBtn = $('clearColorBtn');
const swatch = $('swatch'), colorFeedback = $('colorFeedback');
const imageContainer = $('imageContainer'), audioContainer = $('audioContainer'), videoContainer = $('videoContainer');
const examplesEl = $('examples');
const useWikimedia = $('useWikimedia'), autoSpeak = $('autoSpeak');
const gameScoreEl = $('gameScore'), gameBestEl = $('gameBest'), gameTimeEl = $('gameTime');
const startGuessBtn = $('startGuessBtn'), startTimedBtn = $('startTimedBtn'), resetScoresBtn = $('resetScores');
const gameQuestion = $('gameQuestion'), gameChoices = $('gameChoices'), gameMsg = $('gameMsg');

function showFeedback(msg, type=''){
  if(!msg){ colorFeedback.innerHTML=''; return; }
  if(type==='error') colorFeedback.innerHTML = `<div class="error">${escapeHtml(msg)}</div>`;
  else if(type==='success') colorFeedback.innerHTML = `<div class="success">${escapeHtml(msg)}</div>`;
  else colorFeedback.textContent = msg;
  setTimeout(()=>{ if(colorFeedback.innerHTML) colorFeedback.innerHTML=''; },5000);
}
function escapeHtml(s){ return String(s).replace(/[&<>"'`]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c])); }

/* number->word helper reused earlier? small helper for color names not needed */

/* ---------- color example map (editable) ---------- */
const EXAMPLES = [
  {name:'red', phrase:'red apple'},
  {name:'blue', phrase:'blue sky'},
  {name:'green', phrase:'green leaf'},
  {name:'yellow', phrase:'yellow banana'},
  {name:'orange', phrase:'orange fruit'},
  {name:'purple', phrase:'purple flower'},
  {name:'pink', phrase:'pink rose'},
  {name:'brown', phrase:'brown bear'},
  {name:'black', phrase:'black cat'},
  {name:'white', phrase:'white cloud'},
  {name:'gray', phrase:'gray elephant'},
  {name:'teal', phrase:'teal water'},
  {name:'navy', phrase:'navy suit'},
  {name:'gold', phrase:'gold coin'},
  {name:'silver', phrase:'silver spoon'},
  {name:'beige', phrase:'beige sand'},
  {name:'olive', phrase:'olive branch'},
  {name:'maroon', phrase:'maroon jacket'},
  {name:'coral', phrase:'coral reef'},
  {name:'indigo', phrase:'indigo cloth'}
];

function renderExamples(){
  examplesEl.innerHTML = '';
  EXAMPLES.forEach(e=>{
    const btn = document.createElement('div');
    btn.className = 'example-item';
    btn.innerHTML = `<div class="example-color" style="background:${e.name}"></div><div class="example-name">${e.name}</div>`;
    btn.addEventListener('click', ()=> loadColor(e.name, e.phrase));
    examplesEl.appendChild(btn);
  });
}
renderExamples();

/* ---------- input validation & swatch rendering ---------- */
function isValidColorName(name){
  if(!name) return false;
  // check via temporary element style
  const s = name.trim().toLowerCase();
  const d = document.createElement('div');
  d.style.color = '';
  d.style.color = s;
  return !!d.style.color;
}

function loadColor(name, phraseFallback){
  const raw = (name || colorInput.value || '').trim();
  if(!raw){ showFeedback('Please type a color name (e.g. red).','error'); return;    
  }
  const color = raw.toLowerCase();
  if(!isValidColorName(color)){
    showFeedback('Not a recognized color name. Try a common CSS color (e.g. "red", "teal").','error');
    swatch.style.background = '#444'; swatch.textContent = 'Unknown';
    renderMedia([] , [], [], color);
    return;
  }
  // set swatch
  swatch.style.background = color;
  // choose text color for contrast
  try{
    // compute luminance from computed color
    const tmp = document.createElement('div'); tmp.style.color = color; document.body.appendChild(tmp);
    const computed = getComputedStyle(tmp).color; document.body.removeChild(tmp);
    const rgb = computed.match(/\d+/g).map(Number);
    const luminance = (0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2])/255;
    swatch.style.color = luminance > 0.6 ? '#111' : '#fff';
  }catch(e){ swatch.style.color = '#fff'; }
  swatch.textContent = color;

  // choose search phrase
  const phrase = phraseFallback || EXAMPLES.find(x=>x.name===color)?.phrase || `${color} color`;
  showFeedback(`Searching media for "${phrase}"...`);
  imageContainer.innerHTML = '<div class="placeholder">Searching image...</div>';
  audioContainer.innerHTML = '<div class="placeholder">Searching audio...</div>';
  videoContainer.innerHTML = '<div class="placeholder">Searching video...</div>';

  if(!useWikimedia.checked){
    showFeedback('Wikimedia fetch disabled; using TTS fallback.', 'error');
    renderMedia([], [], [], phrase);
    if(autoSpeak.checked) speakText(color);
    return;
  }

  // fetch media in parallel
  Promise.all([
    searchCommons(phrase, 'image'),
    searchCommons(phrase, 'audio'),
    searchCommons(phrase, 'video')
  ]).then(([imgs, auds, vids])=>{
    renderMedia(imgs, auds, vids, phrase);
    if((!auds || auds.length===0) && autoSpeak.checked) speakText(color);
    showFeedback(`Results for "${phrase}".`, 'success');
  }).catch(err=>{
    console.error(err);
    renderMedia([], [], [], phrase);
    if(autoSpeak.checked) speakText(color);
    showFeedback('Network error or Wikimedia blocked. Fallback used.','error');
  });
}

/* ---------- Wikimedia Commons search (same technique as earlier) ---------- */
async function searchCommons(query, filetype='image'){
  const extra = filetype === 'image' ? 'filetype:bitmap' : (filetype === 'audio' ? 'filetype:audio' : 'filetype:video');
  const search = `${query} ${extra}`.trim();
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&generator=search&gsrsearch=${encodeURIComponent(search)}&gsrlimit=6&iiprop=url|mime`;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('Network not ok');
    const data = await res.json();
    if(!data.query) return [];
    const pages = Object.values(data.query.pages || {});
    const results = [];
    for(const p of pages){
      if(p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url){
        const mime = (p.imageinfo[0].mime || '').toLowerCase();
        results.push({ title: p.title, url: p.imageinfo[0].url, mime });
      }
    }
    return results;
  } catch(e){
    console.warn('commons search failed', e);
    return [];
  }
}

/* ---------- render media ---------- */
function renderMedia(imgs, auds, vids, fallback){
  // image
  imageContainer.innerHTML = '';
  if(!imgs || imgs.length===0) imageContainer.innerHTML = '<div class="placeholder">No image found.</div>';
  else {
    const img = document.createElement('img'); img.className='demo-img'; img.src = imgs[0].url; img.alt = imgs[0].title||'image'; imageContainer.appendChild(img);
  }
  // audio
  audioContainer.innerHTML = '';
  if(!auds || auds.length===0) audioContainer.innerHTML = '<div class="placeholder">No audio found.</div>';
  else { const a = document.createElement('audio'); a.controls=true; a.src=auds[0].url; audioContainer.appendChild(a); }
  // video
  videoContainer.innerHTML = '';
  if(vids && vids.length>0){ const v = document.createElement('video'); v.controls=true; v.src = vids[0].url; v.style.maxHeight='220px'; videoContainer.appendChild(v); }
  else {
    const link = document.createElement('a'); link.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(fallback)}`; link.target='_blank'; link.rel='noopener noreferrer'; link.textContent='Search example videos on YouTube';
    link.style.display='inline-block'; link.style.color='#1474e2'; link.style.fontSize='16px';
    videoContainer.appendChild(link);
  }
}

/* ---------- TTS ---------- */
function speakText(text){
  if(!('speechSynthesis' in window)){ showFeedback('SpeechSynthesis not available','error'); return; }
  try{ window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang='en-US'; window.speechSynthesis.speak(u); }catch(e){ console.warn('TTS fail', e); showFeedback('TTS failed','error'); }
}

/* ---------- UI events ---------- */
fetchColorBtn.addEventListener('click', ()=> loadColor(null));
colorInput.addEventListener('keydown', e=>{ if(e.key==='Enter') fetchColorBtn.click(); });
speakColorBtn.addEventListener('click', ()=> {
  const raw = (colorInput.value || '').trim();
  if(!raw){ showFeedback('Type a color first','error'); return; }
  if(isValidColorName(raw)) speakText(raw.trim());
  else showFeedback('Not a recognized CSS color name','error');
});
clearColorBtn.addEventListener('click', ()=>{
  colorInput.value=''; swatch.style.background='#444'; swatch.style.color='#fff'; swatch.textContent='No color';
  imageContainer.innerHTML='<div class="placeholder">No image yet</div>'; audioContainer.innerHTML='<div class="placeholder">No audio yet</div>'; videoContainer.innerHTML='<div class="placeholder">No video yet</div>';
  showFeedback('Cleared.');
});

/* ---------- Mini-game: Pick the right color ---------- */
/* Modes: Guess Game (single rounds) and Timed Quiz (60s, 10 rounds) */
const STORAGE_KEY = 'learngram_colors_game_v1';
let gameState = {played:0, correct:0, best:0};
try{ const s = localStorage.getItem(STORAGE_KEY); if(s) gameState = JSON.parse(s); }catch(e){}
function saveGame(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState)); updateGameUI(); }
function updateGameUI(){ $('gameScore').textContent = gameState.correct||0; $('gameBest').textContent = gameState.best||0; }

updateGameUI();

let currentAnswer = null;
let gameTimer = null;
let timedQuiz = {running:false, timeLeft:0, rounds:0, maxRounds:10};

function pickRandomColors(count=4, includeName=null){
  // pick from EXAMPLES list and include random CSS colors if needed
  const pool = EXAMPLES.map(x=>x.name);
  // ensure includeName exists in pool otherwise add it
  if(includeName && !pool.includes(includeName)) pool.push(includeName);
  const choices = new Set();
  if(includeName) choices.add(includeName);
  while(choices.size < count){
    const pick = pool[Math.floor(Math.random()*pool.length)];
    choices.add(pick);
  }
  return shuffle(Array.from(choices));
}
function shuffle(arr){ return arr.sort(()=>Math.random()-0.5); }

function startGuessRound(){
  clearGameArea();
  const targetIndex = Math.floor(Math.random()*EXAMPLES.length);
  const target = EXAMPLES[targetIndex].name;
  currentAnswer = target;
  gameQuestion.textContent = `Select the color: "${target}"`; // shows letters
  // speak the color
  speakText(target);
  const choices = pickRandomColors(4, target);
  renderChoices(choices);
}

function renderChoices(choices){
  gameChoices.innerHTML = '';
  choices.forEach(c=>{
    const div = document.createElement('div');
    div.className = 'choice';
    div.style.background = c;
    div.dataset.color = c;
    div.title = c;
    div.addEventListener('click', onChoiceClick);
    gameChoices.appendChild(div);
  });
}

function onChoiceClick(e){
  const chosen = e.currentTarget.dataset.color;
  const correct = chosen === currentAnswer;
  // visual feedback
  Array.from(gameChoices.children).forEach(ch=>{
    const c = ch.dataset.color;
    if(c === currentAnswer) ch.classList.add('correct');
    if(c === chosen && !correct) ch.classList.add('wrong');
    ch.removeEventListener('click', onChoiceClick);
  });
  if(correct){
    gameMsg.textContent = '✅ Correct!';
    gameState.played = (gameState.played||0)+1;
    gameState.correct = (gameState.correct||0)+1;
    if(gameState.correct > (gameState.best||0)) gameState.best = gameState.correct;
  } else {
    gameMsg.textContent = `❌ Wrong — correct was "${currentAnswer}"`;
    gameState.played = (gameState.played||0)+1;
  }
  saveGame();
  // if timed quiz running, continue rounds automatically
  if(timedQuiz.running){
    timedQuiz.rounds++;
    if(timedQuiz.rounds >= timedQuiz.maxRounds){ endTimedQuiz(); return; }
    // short delay then next round
    setTimeout(()=> startGuessRound(), 900);
  }
}

function clearGameArea(){
  gameChoices.innerHTML = '';
  gameMsg.textContent = '';
  gameQuestion.textContent = '';
  currentAnswer = null;
}

/* Timed quiz */
function startTimedQuiz(){
  if(timedQuiz.running) return;
  timedQuiz.running = true; timedQuiz.timeLeft = 60; timedQuiz.rounds = 0;
  gameTimeEl.textContent = `${timedQuiz.timeLeft}s`;
  gameMsg.textContent = 'Timed quiz started — 60s, 10 rounds';
  // reset current session score counters (not global saved score)
  // we will use gameState.correct as running score (for simplicity)
  gameState.correct = 0;
  saveGame();
  startGuessRound();
  gameTimer = setInterval(()=>{
    timedQuiz.timeLeft--;
    gameTimeEl.textContent = `${timedQuiz.timeLeft}s`;
    if(timedQuiz.timeLeft <= 0){
      endTimedQuiz();
    }
  },1000);
}

function endTimedQuiz(){
  clearInterval(gameTimer);
  timedQuiz.running = false;
  gameMsg.textContent = `Quiz finished — correct: ${gameState.correct} / ${timedQuiz.rounds}`;
  gameTimeEl.textContent = '—';
  // update best already handled by saveGame when answers recorded
}

/* controls */
startGuessBtn.addEventListener('click', ()=>{
  // single round mode (not timed)
  timedQuiz.running = false; clearInterval(gameTimer); gameTimeEl.textContent = '—';
  startGuessRound();
});
startTimedBtn.addEventListener('click', ()=> startTimedQuiz());
resetScoresBtn.addEventListener('click', ()=>{
  if(!confirm('Reset game stats?')) return;
  gameState = {played:0, correct:0, best:0}; saveGame(); gameMsg.textContent='Scores reset';
});

/* ---------- helpers ---------- */
function shuffleArray(arr){ return arr.sort(()=>Math.random()-0.5); }

/* ---------- initial state ---------- */
window.addEventListener('load', ()=>{
  imageContainer.innerHTML = '<div class="placeholder">No image yet</div>';
  audioContainer.innerHTML = '<div class="placeholder">No audio yet</div>';
  videoContainer.innerHTML = '<div class="placeholder">No video yet</div>';
  renderExamples();
  updateGameUI();
});

/* ---------- small safety: ensure functions available to console use ---------- */
window.loadColor = loadColor;
window.searchCommons = searchCommons;

printBtn && printBtn.addEventListener('click', () => window.print());

const navItems = document.querySelectorAll('nav li');


     // nav
    navItems.forEach(li => {
      li.addEventListener('click', () => {
        navItems.forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        const section = li.dataset.section;
        document.querySelectorAll('main.content section.card').forEach(s => s.style.display = 'none');
        const target = document.getElementById(section);
        if(target) target.style.display = 'block';
      });
    });