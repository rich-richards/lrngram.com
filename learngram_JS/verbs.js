/* ---------- DOM shortcuts ---------- */
const $ = id => document.getElementById(id);
const verbInput = $('verbInput'), fetchBtn = $('fetchBtn'), speakBtn = $('speakBtn'), clearBtn = $('clearBtn');
const verbBox = $('verbBox'), presentEl = $('present'), pastEl = $('past'), futureEl = $('future');
const examplesEl = $('examples');
const statusEl = $('status');
const videoContainer = $('videoContainer'), imageContainer = $('imageContainer'), audioContainer = $('audioContainer');
const navItems = document.querySelectorAll('nav li');

/* ---------- example verbs & irregular map ---------- */
const BASIC_VERBS = ['run','walk','eat','drink','sleep','read','write','jump','swim','dance','sing','play','listen','watch','talk','drive','cook','study','paint','draw','go','come','see','speak','take','make','know','think','give','find','buy','teach'];
const IRREGULAR = {
  arise:'arose', awake:'awoke', be:'was', beat:'beat', become:'became', begin:'began', bend:'bent', bet:'bet', bid:'bid', bite:'bit', blow:'blew', break:'broke', bring:'brought', build:'built', burn:'burnt',
  buy:'bought', catch:'caught', choose:'chose', come:'came', cost:'cost', cut:'cut', dig:'dug', dive:'dove', do:'did', draw:'drew', dream:'dreamt', drive:'drove', drink:'drank', eat:'ate', fall:'fell', feel:'felt', fight:'fought',
  find:'found', fly:'flew', forget:'forgot', forgive:'forgave', freeze:'froze', get:'got', give:'gave', go:'went', grow:'grew', hang:'hung', have:'had', hear:'heard', hide:'hid', hit:'hit', hold:'held', hurt:'hurt',
  keep:'kept', know:'knew', lay:'laid', leave:'left', lend:'lent', let:'let', lie:'lay', lose: 'lost', make:'made', mean:'meant', meet:'met', pay:'paid', put:'put', read:'read',  ride:'rode', ring:'rang', rise:'rose', run:'ran',
  say:'said', see:'saw', sell:'sold', send:'sent', show:'showed', shut:'shut', sing:'sang', sit:'sat', sleep:'slept', speak:'spoke', spend:'spent', stand:'stood',
  swim:'swam', take:'took', teach:'taught', tear:'tore', tell:'told', think:'thought', throw:'threw', understand:'understood', wake:'woke', wear:'wore', win:'won', write:'wrote'
};

printBtn && printBtn.addEventListener('click', () => window.print());


/* render basic verbs list */
function renderExamples() {
  examplesEl.innerHTML = '';
  BASIC_VERBS.forEach(v=>{
    const d = document.createElement('div');
    d.className = 'example-item';
    d.textContent = v;
    d.addEventListener('click', ()=> loadVerb(v));
    examplesEl.appendChild(d);
  });
}
renderExamples();

/* ---------- conjugation helpers ---------- */
function isCVC(w){
  if(w.length < 3) return false;
  const a = w[w.length-3], b = w[w.length-2], c = w[w.length-1];
  const v = 'aeiou';
  return !v.includes(a) && v.includes(b) && !v.includes(c) && !'wxy'.includes(c);
}
/* ---------- conjugation helpers ---------- */
function conjugate(verb){
  const base = verb.toLowerCase();
  let present, past, future;

  // ✅ Special cases for "be" and "have"
  if (base === 'be') {
    present = 'is';
    past = 'was';
    future = 'will be';
  } else if (base === 'have') {
    present = 'has';
    past = 'had';
    future = 'will have';
  } else {
    // Default conjugation
    if(IRREGULAR[base]) past = IRREGULAR[base];
    else if(base.endsWith('e')) past = base + 'd';
    else if(base.endsWith('y') && !'aeiou'.includes(base.charAt(base.length-2))) past = base.slice(0,-1) + 'ied';
    else past = base + 'ed';
    present = base;
    future = 'will ' + base;
  }

  return { present, past, future };
}

/* ---------- speech ---------- */
function speakText(text){
  if(!('speechSynthesis' in window)) return;
  try{ 
    window.speechSynthesis.cancel(); 
    const u = new SpeechSynthesisUtterance(text); 
    u.lang = 'en-US'; 
    window.speechSynthesis.speak(u); 
  }catch(e){ console.warn(e); }
}

/* ---------- main speaking button ---------- */
speakBtn.addEventListener('click', ()=>{
  const v = (verbInput.value || verbBox.textContent || '').trim().toLowerCase();
  if(!v){ setStatus('Type or select a verb first.', 'error'); return; }

  let sentence = '';
  if(v === 'be') sentence = 'She is';
  else if(v === 'have') sentence = 'He has';
  else sentence = `She ${make3rdPerson(v)}.`;

  speakText(sentence);
});


function make3rdPerson(verb){
  if(verb.endsWith('y') && !'aeiou'.includes(verb.charAt(verb.length-2))) return verb.slice(0,-1) + 'ies';
  if(/(s|x|z|ch|sh)$/.test(verb)) return verb + 'es';
  return verb + 's';
}
function makeIng(verb){
  const b = verb.toLowerCase();
  if(b.endsWith('ie')) return b.slice(0,-2) + 'ying';
  if(b.endsWith('e') && b !== 'be') return b.slice(0,-1) + 'ing';
  if(isCVC(b)) return b + b.slice(-1) + 'ing';
  return b + 'ing';
}

/* ---------- status helper ---------- */
function setStatus(msg, type='') {
  statusEl.textContent = msg;
  statusEl.className = type ? `status ${type}` : 'status';
}

/* ---------- validate verb (dictionary API fallback) ---------- */
async function validateVerb(raw){
  if(!raw) return {ok:false,msg:'Please type a verb.'};
  const v = String(raw).trim().toLowerCase();
  if(!/^[a-z]+$/.test(v)) return {ok:false,msg:'Only single-word alphabetic verbs allowed.'};
  // quick local check
  if(BASIC_VERBS.includes(v) || IRREGULAR[v]) return {ok:true,verb:v};
  // try dictionary API to ensure word exists and is a verb
  setStatus('Checking dictionary...', '');
  try{
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(v)}`);
    if(!res.ok) throw new Error('not found');
    const data = await res.json();
    const meanings = data[0]?.meanings || [];
    const isVerb = meanings.some(m => m.partOfSpeech === 'verb' || m.partOfSpeech === 'verb phrase');
    if(isVerb) { setStatus('Word validated as verb.', ''); return {ok:true,verb:v}; }
    return {ok:false,msg:'That word exists but is not listed as a verb.'};
  }catch(e){
    return {ok:false,msg:'Verb not found. Try another verb.'};
  }
}

/* ---------- Wikimedia Commons search ---------- */
async function searchCommons(query, filetype='image'){
  const extra = filetype === 'image' ? 'filetype:bitmap' : (filetype === 'audio' ? 'filetype:audio' : 'filetype:video');
  const search = `${query} ${extra}`.trim();
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&generator=search&gsrsearch=${encodeURIComponent(search)}&gsrlimit=6&iiprop=url|mime`;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('network');
    const data = await res.json();
    if(!data.query) return [];
    const pages = Object.values(data.query.pages || {});
    const results = [];
    for(const p of pages){
      if(p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url){
        const mime = (p.imageinfo[0].mime || '').toLowerCase();
        results.push({title: p.title, url: p.imageinfo[0].url, mime});
      }
    }
    return results;
  }catch(err){
    console.warn('commons',err);
    return [];
  }
}

/* ---------- render media helpers ---------- */
function setPlaceholders(){
  videoContainer.innerHTML = '<div class="placeholder">No video yet</div>';
  imageContainer.innerHTML = '<div class="placeholder">No image yet</div>';
  audioContainer.innerHTML = '<div class="placeholder">No audio yet</div>';
}
setPlaceholders();

function renderImage(list){
  imageContainer.innerHTML = '';
  if(!list || list.length === 0){ imageContainer.innerHTML = '<div class="placeholder">No image found.</div>'; return; }
  const img = document.createElement('img'); img.className='demo-img'; img.src = list[0].url; img.alt = list[0].title || 'image';
  imageContainer.appendChild(img);
}
function renderAudio(list){
  audioContainer.innerHTML = '';
  if(!list || list.length === 0){ audioContainer.innerHTML = '<div class="placeholder">No audio found.</div>'; return; }
  const a = document.createElement('audio'); a.controls = true; a.src = list[0].url;
  audioContainer.appendChild(a);
}
function renderVideo(list, fallback){
  videoContainer.innerHTML = '';
  if(list && list.length > 0){
    const v = document.createElement('video');
    v.controls = true;
    v.src = list[0].url;
    v.playsInline = true;
    v.style.maxHeight = '320px';
    videoContainer.appendChild(v);
    return;
  }
  videoContainer.innerHTML = `<div class="placeholder">No video found — <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(fallback)}" target="_blank" rel="noopener">search on YouTube</a></div>`;
}

/* ---------- TTS ---------- */
function speakText(text){
  if(!('speechSynthesis' in window)) return;
  try{ window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; window.speechSynthesis.speak(u); }catch(e){ console.warn(e); }
}

/* ---------- main flow: load verb ---------- */
async function loadVerb(rawOrVerb){
  setStatus('', '');
  const raw = (typeof rawOrVerb === 'string') ? rawOrVerb : verbInput.value;
  const validation = await validateVerb(raw || '');
  if(!validation.ok){ setStatus(validation.msg, 'error'); return; }
  const verb = validation.verb;
  setStatus('Verb validated. Building search forms...', ''); 

  const conj = conjugate(verb);
  verbBox.textContent = verb;
  presentEl.textContent = 'Present: ' + conj.present;
  pastEl.textContent = 'Past: ' + conj.past;
  futureEl.textContent = 'Future: ' + conj.future;

  setPlaceholders();
  imageContainer.innerHTML = '<div class="placeholder">Searching image...</div>';
  audioContainer.innerHTML = '<div class="placeholder">Searching audio...</div>';
  videoContainer.innerHTML = '<div class="placeholder">Searching video...</div>';

  // forms to try (prioritize most relevant for actions)
  const forms = [
    makeIng(verb),           // running
    conj.past,               // ran (helps when media labeled with past form)
    `${verb} action`,        // "run action"
    verb,                    // base
    `${makeIng(verb)} action`
  ];

  try{
    setStatus('Searching videos...', '');
    let vids = [];
    for(const q of forms){ vids = await searchCommons(q, 'video'); if(vids.length) break; }
    renderVideo(vids, `${verb} action`);
    setStatus('Searching images...', '');
    let imgs = [];
    for(const q of forms){ imgs = await searchCommons(q, 'image'); if(imgs.length) break; }
    renderImage(imgs);
    setStatus('Searching audio...', '');
    let auds = [];
    for(const q of forms){ auds = await searchCommons(q, 'audio'); if(auds.length) break; }
    renderAudio(auds);

    // speak fallback if no audio found
    if(!auds || auds.length === 0){
      const sentence = `She ${make3rdPerson(conj.present)}.`;
      speakText(sentence);
    }
    setStatus('Done — media shown (if found).', 'success');
  }catch(err){
    console.error(err);
    setStatus('Network or remote error. Try again later.', 'error');
  }
}

/* ---------- events ---------- */
fetchBtn.addEventListener('click', ()=> loadVerb());
verbInput.addEventListener('keydown', e => { if(e.key === 'Enter') loadVerb(); });
speakBtn.addEventListener('click', ()=>{
  const v = (verbInput.value || verbBox.textContent || '').trim();
  if(!v) { setStatus('Type or select a verb first.', 'error'); return; }
  if(!/^[a-z]+$/.test(v)){ setStatus('Invalid verb input.', 'error'); return; }
  speakText(`She ${make3rdPerson(v)}.`);
});
clearBtn.addEventListener('click', ()=> {
  verbInput.value = '';
  verbBox.textContent = 'run';
  presentEl.textContent = 'Present: —';
  pastEl.textContent = 'Past: —';
  futureEl.textContent = 'Future: —';
  setPlaceholders();
  setStatus('', '');
});

/* nav */
navItems.forEach(li=>{
  li.addEventListener('click', ()=>{
    navItems.forEach(x=>x.classList.remove('active'));
    li.classList.add('active');
    const section = li.dataset.section;
    document.querySelectorAll('main > section').forEach(s=>s.style.display='none');
    const el = document.getElementById(section);
    if(el) el.style.display = 'block';
    // show lesson card if nothing selected
    if(section === 'lesson') document.getElementById('lesson').style.display = 'block';
  });
});

/* initial state */
window.addEventListener('load', ()=>{
  verbInput.value = '';
  verbBox.textContent = 'run';
  presentEl.textContent = 'Present: —';
  pastEl.textContent = 'Past: —';
  futureEl.textContent = 'Future: —';
  setPlaceholders();
  setStatus('', '');
});


// Mini-game

