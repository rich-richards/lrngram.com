/* Family Lesson script
   - Wikipedia REST summary
   - Wikimedia Commons search (image/audio/video)
   - Matching check + suggestions
   - TTS and play Commons audio/video
   - Save progress in localStorage
*/

const WIKI_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const COMMONS_API_BASE = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&generator=search&gsrlimit=6&iiprop=url|mime&gsrsearch=';

const FAMILY_INPUT = document.getElementById('familyInput');
const SEARCH_BTN = document.getElementById('searchBtn');
const TTS_BTN = document.getElementById('ttsBtn');
const STATUS = document.getElementById('status');
const RESULT_AREA = document.getElementById('resultArea');
const INFO_TEXT = document.getElementById('infoText');
const IMAGE_SLOT = document.getElementById('imageSlot');
const AUDIO_SLOT = document.getElementById('audioSlot');
const VIDEO_ROW = document.getElementById('videoRow');
const VIDEO_SLOT = document.getElementById('videoSlot');
const SUGGEST_BOX = document.getElementById('suggestBox');
const EXAMPLES_LIST = document.getElementById('examplesList');
const EXAMPLES_GRID = document.getElementById('examplesGrid');
const SAVE_BTN = document.getElementById('saveBtn');
const CLEAR_PROGRESS_BTN = document.getElementById('clearProgressBtn');
const PROGRESS_LIST = document.getElementById('progressList');
const PROGRESS_MSG = document.getElementById('progressMsg');

const EXAMPLES = ["Mother","Father","Brother","Sister","Son","Daughter","Grandfather","Grandmother","Uncle","Aunt","Cousin","Niece","Nephew","Husband","Wife","Parent","Sibling"];

/* small synonym map */
const SYNONYMS = { mom: 'Mother', dad: 'Father', granny: 'Grandmother', grandpa:'Grandfather', bro:'Brother', sis:'Sister' };

let lastSpokenText = '';

function renderExamples(){
  EXAMPLES_LIST.innerHTML = '';
  EXAMPLES_GRID.innerHTML = '';
  EXAMPLES.forEach(x=>{
    const e = document.createElement('div'); e.className='example-item'; e.textContent = x;
    e.addEventListener('click', ()=>{ FAMILY_INPUT.value = x; doSearch(x); });
    EXAMPLES_LIST.appendChild(e);

    const g = e.cloneNode(true);
    g.addEventListener('click', ()=>{ FAMILY_INPUT.value = x; doSearch(x); });
    EXAMPLES_GRID.appendChild(g);
  });
}
renderExamples();

/* progress */
const PROG_KEY = 'learngram:family:progress:v1';
function loadProgress(){
  try{ return JSON.parse(localStorage.getItem(PROG_KEY) || '[]'); }catch(e){return []}
}
function saveProgress(term){
  try{
    const p = loadProgress();
    if(!p.includes(term)) p.unshift(term);
    while(p.length>30) p.pop();
    localStorage.setItem(PROG_KEY, JSON.stringify(p));
    showProgress();
    PROGRESS_MSG.textContent = `Saved "${term}"`;
    setTimeout(()=> PROGRESS_MSG.textContent='',2000);
  }catch(e){ console.warn(e); }
}
function clearProgress(){
  if(!confirm('Clear saved progress?')) return;
  localStorage.removeItem(PROG_KEY);
  showProgress();
}
function showProgress(){
  const p = loadProgress();
  PROGRESS_LIST.innerHTML = '';
  if(!p.length){ PROGRESS_LIST.innerHTML = '<div class="placeholder">No saved items yet.</div>'; return;}
  p.forEach(term=>{
    const b = document.createElement('div'); b.className='example-item'; b.textContent = term;
    b.addEventListener('click', ()=>{ FAMILY_INPUT.value = term; doSearch(term); });
    PROGRESS_LIST.appendChild(b);
  });
}
showProgress();

/* UI helpers */
function setStatus(msg, cls=''){
  STATUS.textContent = msg;
  STATUS.className = cls ? ('status ' + cls) : 'status';
}
function showResults(show=true){
  RESULT_AREA.style.display = show ? 'grid' : 'none';
  VIDEO_ROW.style.display = show ? 'block' : 'none';
}
function clearSlots(){
  INFO_TEXT.innerHTML = 'No info yet.';
  IMAGE_SLOT.innerHTML = '<div class="placeholder">No image yet.</div>';
  AUDIO_SLOT.innerHTML = '<div class="placeholder">No audio yet.</div>';
  VIDEO_SLOT.innerHTML = '<div class="placeholder">No video yet.</div>';
  SUGGEST_BOX.innerHTML = ''; SUGGEST_BOX.setAttribute('aria-hidden','true');
}

/* fetch wiki summary */
async function wikiSummary(term){
  const url = WIKI_SUMMARY + encodeURIComponent(term);
  const resp = await fetch(url);
  if(!resp.ok) throw new Error('No wiki');
  return resp.json();
}

/* commons search */
async function commonsSearch(term, extra='filetype:bitmap'){
  // Uses generator=search & imageinfo
  const q = encodeURIComponent(`${term} ${extra}`);
  const url = COMMONS_API_BASE + q;
  try{
    const r = await fetch(url);
    if(!r.ok) return [];
    const data = await r.json();
    if(!data.query) return [];
    const pages = Object.values(data.query.pages || {});
    const out = pages.map(p=>{
      const ii = p.imageinfo && p.imageinfo[0];
      if(ii && ii.url) return {title: p.title, url: ii.url, mime: ii.mime || ''};
      return null;
    }).filter(Boolean);
    return out;
  }catch(e){
    console.warn('commons',e);
    return [];
  }
}

/* normalize */
function norm(s){ return String(s||'').trim().toLowerCase(); }

/* build suggestion buttons */
function buildSuggestions(input){
  SUGGEST_BOX.innerHTML = '';
  const q = norm(input);
  if(!q) { SUGGEST_BOX.setAttribute('aria-hidden','true'); return; }
  const arr = [];
  if(SYNONYMS[q]) arr.push(SYNONYMS[q]);
  EXAMPLES.forEach(e=>{ if(norm(e).includes(q) && norm(e)!==q) arr.push(e); });
  if(arr.length){
    SUGGEST_BOX.setAttribute('aria-hidden','false');
    arr.slice(0,6).forEach(s=>{
      const b = document.createElement('button'); b.className='suggest-btn'; b.textContent = s;
      b.addEventListener('click', ()=>{ FAMILY_INPUT.value = s; doSearch(s); });
      SUGGEST_BOX.appendChild(b);
    });
  } else SUGGEST_BOX.setAttribute('aria-hidden','true');
}

/* search flow */
async function doSearch(termArg){
  const raw = (termArg || FAMILY_INPUT.value || '').trim();
  if(!raw){ setStatus('Please type a family member (e.g. "Mother").','error'); return; }
  const input = raw;
  clearSlots(); showResults(false);
  setStatus('Searching Wikipedia and Commons...','');

  buildSuggestions(input);

  // Try synonyms first
  const tryTerm = SYNONYMS[norm(input)] || input;

  try{
    const wiki = await wikiSummary(tryTerm);
    // check match: title includes input or input is in our vocabulary
    const title = wiki.title || '';
    const match = norm(title).includes(norm(input)) || EXAMPLES.map(e=>norm(e)).includes(norm(input));
    // set info
    INFO_TEXT.innerHTML = `<strong>${escapeHtml(title)}</strong>
      <div style="margin-top:8px;color:var(--muted)">${escapeHtml(wiki.extract || 'No summary available.')}</div>
      <div style="margin-top:8px;font-size:13px"><a href="${wiki.content_urls?.desktop?.page||'#'}" target="_blank">Read more on Wikipedia</a></div>`;
    lastSpokenText = (title + '. ' + (wiki.extract || '')).replace(/<\/?[^>]+(>|$)/g,"");
    // thumbnail
    if(wiki.thumbnail && wiki.thumbnail.source){
      IMAGE_SLOT.innerHTML = `<img src="${wiki.thumbnail.source}" alt="${escapeHtml(title)}" />`;
    } else {
      // fallback: search commons images
      const imgs = await commonsSearch(tryTerm,'filetype:bitmap');
      if(imgs.length) IMAGE_SLOT.innerHTML = `<img src="${imgs[0].url}" alt="${escapeHtml(imgs[0].title||tryTerm)}" />`;
      else IMAGE_SLOT.innerHTML = '<div class="placeholder">No image found.</div>';
    }

    // audio: try commons audio for term
    const auds = await commonsSearch(tryTerm,'filetype:audio');
    if(auds.length){
      AUDIO_SLOT.innerHTML = '';
      const a = document.createElement('audio');
      a.controls = true;
      a.src = auds[0].url;
      AUDIO_SLOT.appendChild(a);
    } else {
      AUDIO_SLOT.innerHTML = '<div class="placeholder">No Commons audio. Use 🔊 to TTS.</div>';
    }

    // video: try commons video
    const vids = await commonsSearch(tryTerm,'filetype:video');
    if(vids.length){
      VIDEO_SLOT.innerHTML = `<video controls src="${vids[0].url}"></video>`;
    } else {
      const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(tryTerm + ' family')}`;
      VIDEO_SLOT.innerHTML = `<div class="placeholder">No Commons video. <a href="${yt}" target="_blank" rel="noopener">Search YouTube</a></div>`;
    }

    // status message about match
    if(match){
      setStatus(`Found: ${title}`, 'success');
    } else {
      setStatus(`Found "${title}" but it may not match "${input}". Try a suggestion.`, 'error');
    }

    showResults(true);
    // Save last searched
    try{ localStorage.setItem('learngram:family:last', input); }catch(e){}
  }catch(err){
    console.warn(err);
    setStatus('No matching Wikipedia summary found. Try example or check spelling.', 'error');
    clearSlots(); showResults(false);
    buildSuggestions(input);
  }
}

/* TTS */
function speakText(){
  const text = lastSpokenText || INFO_TEXT.textContent || '';
  if(!text){ setStatus('Nothing to speak yet.', 'error'); return; }
  if('speechSynthesis' in window){
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
    setStatus('Speaking...', '');
  } else {
    setStatus('TTS not supported in this browser.', 'error');
  }
}

/* small utilities */
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* events */
SEARCH_BTN.addEventListener('click', ()=>doSearch());
FAMILY_INPUT.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); doSearch(); } });
TTS_BTN.addEventListener('click', speakText);
SAVE_BTN.addEventListener('click', ()=>{ const t = (FAMILY_INPUT.value||'').trim(); if(t) saveProgress(t); else setStatus('Nothing to save.','error'); });
CLEAR_PROGRESS_BTN.addEventListener('click', clearProgress);

/* suggestions while typing */
FAMILY_INPUT.addEventListener('input', (e)=> buildSuggestions(e.target.value||''));

/* init: restore last */
(function init(){
  const last = localStorage.getItem('learngram:family:last');
  if(last) FAMILY_INPUT.value = last;
  clearSlots();
  setStatus('Ready — type a family member (e.g., "Mother") and press Search.');
  showResults(false);
  renderExamples();
  showProgress();
})();


/* mini-game */
 const familyData = [
      { name: "Father", img: "images/dad.png" },
      { name: "Mother", img: "images/mom.png" },
      { name: "Brother", img: "images/boy.png" },
      { name: "Sister", img: "images/sister.png" },
      { name: "Grandfather", img: "images/grandfather.png" },
      { name: "Grandmother", img: "images/old-woman.png" },
      { name: "Uncle", img: "images/man.png" },
      { name: "Aunt", img: "images/aunt.png" },
      { name: "Cousin", img: "images/cousin.png" },
      { name: "Baby", img: "images/baby-girl.png" },
      { name: "Parents", img: "images/parents.png" },
      { name: "nephew", img: "images/nephew.png" },
      { name: "niece", img: "images/niece.png" }
    ];

    const startBtn = document.getElementById("startBtn");
    const gameArea = document.getElementById("gameArea");
    const familyImage = document.getElementById("familyImage");
    const options = document.getElementById("options");
    const result = document.getElementById("result");
    const timeEl = document.getElementById("time");
    const progress = document.getElementById("progress");
    const restart = document.getElementById("restart");

    let score = 0;
    let timeLeft = 30;
    let timer;
    let currentMember;

    function startGame() {
      startBtn.classList.add("hidden");
      gameArea.classList.remove("hidden");
      score = 0;
      timeLeft = 30;
      restart.style.display = "none";
      result.textContent = "";
      nextQuestion();
      timer = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
      timeLeft--;
      timeEl.textContent = timeLeft;
      progress.style.width = (timeLeft / 30) * 100 + "%";
      if (timeLeft <= 0) endGame();
    }

  function nextQuestion() {
    options.innerHTML = "";
    currentMember = familyData[Math.floor(Math.random() * familyData.length)];
    familyImage.src = currentMember.img;

    // Pick 3 other random incorrect answers
    const incorrectOptions = familyData
      .filter(item => item.name !== currentMember.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // Combine correct + incorrect answers
    const questionOptions = [...incorrectOptions, currentMember].sort(() => 0.5 - Math.random());

    questionOptions.forEach(item => {
      const btn = document.createElement("button");
      btn.textContent = item.name;
      btn.onclick = () => checkAnswer(item.name);
      options.appendChild(btn);
    });
  }

    function checkAnswer(selected) {
      if (selected === currentMember.name) {
        score++;
        result.textContent = "✅ Correct!";
      } else {
        result.textContent = "❌ Try again!";
      }
      setTimeout(() => {
        result.textContent = "";
        nextQuestion();
      }, 800);
    }

    function endGame() {
      clearInterval(timer);
      options.innerHTML = "";
      familyImage.src = "";
      result.textContent = `🏁 Time's up! You scored ${score} points!`;
      restart.style.display = "inline-block";
    }

    restart.onclick = startGame;
    startBtn.onclick = startGame;



