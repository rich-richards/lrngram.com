/* Learngram Greetings Lesson
   - Save this file and open in a modern browser.
   - Optional: configure LLM_API_ENABLED and LLM_ENDPOINT to call your model/server.
*/

/* ---------- Configuration for optional LLM ----------
   If you want the bot to be a "powerful AI model", provide:
   - LLM_API_ENABLED = true
   - LLM_ENDPOINT = URL of your server that proxies to an LLM (must accept JSON {prompt: "..."} and return {reply: "..."})
   - LLM_AUTH_HEADER (optional) for any Authorization header required.

   NOTE: For security you should not embed API keys in client HTML. Use a server-side proxy.
*/
const LLM_API_ENABLED = false; // set to true if you wire a server
const LLM_ENDPOINT = 'https://your-server.example.com/llm'; // placeholder
const LLM_AUTH_HEADER = ''; // e.g. 'Bearer ...' (if your proxy requires it)

/* ---------- DOM shortcuts ---------- */
const $ = id => document.getElementById(id);
const chatWindow = $('chatWindow'), userInput = $('userInput'), sendBtn = $('sendBtn'), voiceBtn = $('voiceBtn');
const examplesList = $('examplesList'), imgCard = $('imgCard'), audioCard = $('audioCard'), videoCard = $('videoCard');
const statusEl = $('status'), clearHistory = $('clearHistory'), autoSpeak = $('autoSpeak');

const STORAGE_HISTORY = 'learngram:greetings:v1';
const STORAGE_NAME = 'learngram:greetings:name_v1';
const STORAGE_LASTBOT = 'learngram:greetings:lastbot_v1';

/* ---------- small helpers ---------- */
function escapeHtml(s){ return String(s).replace(/[&<>"'`]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c])); }
function setStatus(msg, cls=''){ statusEl.textContent = msg; statusEl.className = cls ? `status ${cls}` : 'status'; }

/* ---------- history persistence ---------- */
function loadHistory(){ try{ return JSON.parse(localStorage.getItem(STORAGE_HISTORY)||'[]'); }catch(e){return[];} }
function saveHistory(arr){ try{ localStorage.setItem(STORAGE_HISTORY, JSON.stringify(arr)); }catch(e){} }
function pushHistory(entry){
  const h = loadHistory(); h.push(entry); if(h.length>300) h.splice(0,h.length-300); saveHistory(h);
}

/* ---------- render history to UI ---------- */
function renderHistory(){
  const h = loadHistory();
  chatWindow.innerHTML = '';
  h.forEach(m=>{
    const div = document.createElement('div');
    div.className = 'msg ' + (m.who === 'user' ? 'user' : 'bot');
    const meta = m.t ? `<meta>${new Date(m.t).toLocaleTimeString()}</meta>` : '';
    div.innerHTML = `<div>${escapeHtml(m.text)}</div>${meta}`;
    chatWindow.appendChild(div);
  });
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* ---------- examples ---------- */
const EXAMPLES = [
  'Hi!',
  "Hello, how are you?",
  "Good morning!",
  "I'm Anna",
  "My name is David",
  "Nice to meet you!",
  "How's it going?"
];
function renderExamples(){ examplesList.innerHTML=''; EXAMPLES.forEach(s=>{ const d=document.createElement('div'); d.className='example-item'; d.textContent=s; d.onclick=()=>{ userInput.value=s; send(); }; examplesList.appendChild(d); }); }
renderExamples();

/* ---------- simple NLP (fallback) ---------- */
function capitalize(s){ return s? s[0].toUpperCase()+s.slice(1):s; }
function detectIntent(text){
  const s = (text||'').trim();
  if(!s) return {intent:'empty'};
  const lc = s.toLowerCase();

  if(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(lc)){
    if(/\bhow are you\b|\bhow's it going\b|\bhow you doing\b/.test(lc)) return {intent:'greeting_howareyou'};
    return {intent:'greeting'};
  }
  if(/\bhow are you\b|\bhow's it going\b|\bhow you doing\b/.test(lc)) return {intent:'greeting_howareyou'};

  // introduce: I'm <Name>, I am <Name>, My name is <Name>
  let m = s.match(/\b(?:i am|i'm|im|my name is|this is)\s+([A-Za-z]{2,30})\b/i);
  if(m) return {intent:'introduce', name:capitalize(m[1])};

  if(/\bwhat is your name\b|\bwho are you\b|\bwhat's your name\b/.test(lc)) return {intent:'ask_bot_name'};
  if(/\b(thank|thanks|thx)\b/.test(lc)) return {intent:'thanks'};
  if(/\b(bye|goodbye|see you|see ya)\b/.test(lc)) return {intent:'farewell'};
  if(/\bnice to meet you\b|\bpleased to meet you\b/.test(lc)) return {intent:'nice_meet'};

  // fallback small chat
  return {intent:'chat'};
}

/* ---------- name memory ---------- */
function saveName(n){ try{ localStorage.setItem(STORAGE_NAME, n); }catch(e){} }
function loadName(){ try{ return localStorage.getItem(STORAGE_NAME) || null; }catch(e){return null;} }

/* ---------- Wikimedia Commons helpers ---------- */
async function commonsSearch(query, filetype='image'){
  const extra = (filetype==='image') ? 'filetype:bitmap' : (filetype==='audio' ? 'filetype:audio' : 'filetype:video');
  const q = `${query} ${extra}`.trim();
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=6&iiprop=url|mime`;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('network');
    const data = await res.json();
    if(!data.query) return [];
    const pages = Object.values(data.query.pages||{});
    return pages.map(p=>({title:p.title, url:p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url ? p.imageinfo[0].url : '', mime: (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].mime) || ''})).filter(x=>x.url);
  }catch(e){ console.warn('commons',e); return []; }
}

/* ---------- media render helpers ---------- */
function showImage(list){ imgCard.innerHTML=''; if(!list||!list.length){ imgCard.innerHTML='<div class="placeholder">No image found.</div>'; return;} const img=document.createElement('img'); img.src=list[0].url; img.alt=list[0].title||'image'; imgCard.appendChild(img); }
function showAudio(list){ audioCard.innerHTML=''; if(!list||!list.length){ audioCard.innerHTML='<div class="placeholder">No audio found.</div>'; return;} const a=document.createElement('audio'); a.controls=true; a.src=list[0].url; audioCard.appendChild(a); }
function showVideo(list, fallback){ videoCard.innerHTML=''; if(list&&list.length){ const v=document.createElement('video'); v.controls=true; v.src=list[0].url; videoCard.appendChild(v); return;} videoCard.innerHTML=`<div class="placeholder">No video — <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(fallback)}" target="_blank" rel="noopener">search on YouTube</a></div>`; }

/* ---------- simple fallback reply generator ---------- */
function localReply(intentObj, userText){
  const nameMem = loadName();
  switch(intentObj.intent){
    case 'empty': return "Please say something — try 'Hi' or 'Hello, I'm Sam.'";
    case 'greeting_howareyou': return "Hey! I'm fine, thanks. How are you?";
    case 'greeting': return "Hello! Nice to see you. How are you today?";
    case 'introduce':
      if(intentObj.name){ saveName(intentObj.name); return `Nice to meet you, ${intentObj.name}! I'm Learngram — your practice buddy.`; }
      return "Nice to meet you!";
    case 'ask_bot_name': return "I'm Learngram — your practice assistant for greetings.";
    case 'thanks': return "You're welcome!";
    case 'farewell': return "Goodbye! Have a nice day.";
    case 'nice_meet': return nameMem ? `Nice to meet you too, ${nameMem}!` : "Nice to meet you too!";
    case 'chat':
    default:
      // try to extract a name if present even if intent missed
      const m = userText.match(/\b(?:i am|i'm|my name is|this is)\s+([A-Za-z]{2,30})\b/i);
      if(m){ const nm = capitalize(m[1]); saveName(nm); return `Got it — nice to meet you, ${nm}!`; }
      return `I hear you: "${userText.trim()}" — can you try "I'm <name>" or "Hi, how are you?"?`;
  }
}

/* ---------- optional LLM call (server-side proxy recommended) ---------- */
async function callLLM(prompt){
  if(!LLM_API_ENABLED) throw new Error('LLM disabled');
  // Example API contract: POST { prompt } -> { reply: "..." }
  const body = JSON.stringify({prompt});
  const headers = {'Content-Type':'application/json'};
  if(LLM_AUTH_HEADER) headers['Authorization'] = LLM_AUTH_HEADER;
  const resp = await fetch(LLM_ENDPOINT, {method:'POST', headers, body, mode:'cors'});
  if(!resp.ok) throw new Error('LLM request failed');
  const data = await resp.json();
  if(data.reply) return data.reply;
  if(data.choices && data.choices[0] && data.choices[0].text) return data.choices[0].text;
  throw new Error('LLM returned unexpected response');
}

/* ---------- send path ---------- */
let lastBotText = '';
async function send(){
  const text = (userInput.value||'').trim();
  if(!text){ setStatus('Please type a message.', 'error'); return; }
  // show user message
  const userMsg = {who:'user', text, t: Date.now()};
  pushHistory(userMsg); appendToUI(userMsg);

  userInput.value = '';
  setStatus('Thinking...', '');

  // detect intent & pick media search terms
  const intentObj = detectIntent(text);
  // build media search term priority
  let mediaTerm = '';
  if(intentObj.intent==='greeting' || intentObj.intent==='greeting_howareyou') mediaTerm = 'greeting smile people';
  else if(intentObj.intent==='introduce') mediaTerm = 'introduction handshake';
  else mediaTerm = text.split(/\s+/).slice(0,3).join(' ');

  // fetch media asynchronously (do not wait long)
  (async ()=>{
    try{
      const [imgs,auds,vids] = await Promise.all([
        commonsSearch(mediaTerm,'image'),
        commonsSearch(mediaTerm,'audio'),
        commonsSearch(mediaTerm,'video')
      ]);
      showImage(imgs); showAudio(auds); showVideo(vids, mediaTerm);
    }catch(e){
      console.warn('media fetch error', e);
    }
  })();

  // Get bot reply: prefer LLM if enabled
  try{
    let replyText = '';
    if(LLM_API_ENABLED){
      // build a contextual prompt: include name memory and last messages for context
      const name = loadName();
      let prompt = `You are Learngram, a friendly English practice assistant specialized in greetings and introductions. Reply naturally, politely, and with punctuation. Keep replies short (1-3 sentences).`;
      if(name) prompt += ` The user's name is ${name}.`;
      prompt += `\n\nUser: ${text}\nAssistant:`;
      // call LLM
      replyText = await callLLM(prompt);
      if(!replyText) throw new Error('empty llm reply');
    }else{
      // local fallback
      replyText = localReply(intentObj, text);
    }
    // store and show bot reply (simulate slight delay)
    setTimeout(()=>{
      const botMsg = {who:'bot', text:replyText, t: Date.now()};
      pushHistory(botMsg); appendToUI(botMsg);
      lastBotText = replyText;
      localStorage.setItem(STORAGE_LASTBOT, replyText);
      setStatus('','success');
      if(autoSpeak.checked) speak(replyText);
    }, 450);
  }catch(err){
    // LLM failed or disabled fallback to localReply
    console.warn('LLM or reply error', err);
    const fallback = localReply(intentObj, text);
    const botMsg = {who:'bot', text:fallback, t: Date.now()};
    pushHistory(botMsg); appendToUI(botMsg);
    lastBotText = fallback;
    localStorage.setItem(STORAGE_LASTBOT, fallback);
    setStatus('Offline reply used','error');
    if(autoSpeak.checked) speak(fallback);
  }
}

/* append to UI and scroll */
function appendToUI(msg){
  const div = document.createElement('div'); div.className = 'msg ' + (msg.who === 'user' ? 'user' : 'bot');
  const meta = msg.t ? `<meta>${new Date(msg.t).toLocaleTimeString()}</meta>` : '';
  div.innerHTML = `<div>${escapeHtml(msg.text)}</div>${meta}`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* TTS wrapper */
function speak(text){
  if(!('speechSynthesis' in window)) return;
  try{
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  }catch(e){ console.warn('TTS', e); }
}

/* voice replay */
voiceBtn.addEventListener('click', ()=> {
  const last = localStorage.getItem(STORAGE_LASTBOT) || lastBotText || '';
  if(!last){ setStatus('No bot reply yet to speak.', 'error'); return; }
  speak(last);
});

/* clear history */
clearHistory.addEventListener('click', ()=>{
  if(!confirm('Clear chat history and forget saved name?')) return;
  localStorage.removeItem(STORAGE_HISTORY);
  localStorage.removeItem(STORAGE_NAME);
  localStorage.removeItem(STORAGE_LASTBOT);
  chatWindow.innerHTML=''; setStatus('History cleared','');
});

/* keyboard send */
userInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); send(); } });

/* bootstrap: render saved history or welcome */
(function init(){
  renderHistory();
  if(chatWindow.children.length===0){
    const welcome = "Welcome to Learngram! Try: 'Hi', 'Hi, I'm Anna', or 'How are you?'.";
    const m={who:'bot',text:welcome,t:Date.now()};
    pushHistory(m); appendToUI(m);
    localStorage.setItem(STORAGE_LASTBOT, welcome); lastBotText = welcome;
  }
  setStatus('', '');
})();

/* expose send for example items */
window.sendFromExample = function(text){ userInput.value = text; send(); };


/* ---------------------- MINI-GAME (embedded) ----------------------*/
 const chat_Window = document.getElementById("chat_Window");
const user_Input = document.getElementById("user_Input");
const send_Btn = document.getElementById("send_Btn");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");

let score = 0;
let timeLeft = 30;
let timer;
let gameActive = true;

const botGreetings = [
  "Hi there! How are you today?",
  "Hello! Nice to meet you. What's your name?",
  "Good morning! How are you doing?",
  "Hey! Great to see you again!"
];

// Start conversation
function botSay(text) {
  const div = document.createElement("div");
  div.className = "msg Bot";
  div.textContent = text;
  chat_Window.appendChild(div);
  chat_Window.scrollTop = chatWindow.scrollHeight;
}

function userSay(text) {
  const div = document.createElement("div");
  div.className = "msg User";
  div.textContent = text;
  chat_Window.appendChild(div);
  chat_Window.scrollTop = chat_Window.scrollHeight;
}

// Timer logic
function startTimer(){
  timer = setInterval(()=>{
    if(timeLeft<=0){
      clearInterval(timer);
      gameActive=false;
      botSay(`⏰ Time's up! Final score: ${score}`);
      user_Input.disabled=true;
      send_Btn.disabled=true;
    }else{
      timeLeft--;
      timerEl.textContent = timeLeft;
    }
  },1000);
}

// Simple AI + scoring system
function analyzeInput(text){
  const clean = text.trim();
  let feedback="";
  let pts=0;
  // punctuation
  if(/[.!?]$/.test(clean)) pts+=1; else feedback+="Add punctuation. ";
  // greeting keyword
  if(/\b(hi|hello|hey|morning|evening|afternoon)\b/i.test(clean)) pts+=2;
  // introduction
  if(/\b(i'?m|i am|my name is)\b/i.test(clean)) pts+=2;
  // politeness
  if(/\b(thank|nice|meet)\b/i.test(clean)) pts+=1;
  // spelling check (simplified)
  if(/\b(u|thx|tnx)\b/i.test(clean)) feedback+="Avoid abbreviations. "; else pts+=1;
  // capital letter start
  if(/^[A-Z]/.test(clean)) pts+=1; else feedback+="Start with a capital letter. ";
  if(pts>0) feedback += "Good!";
  score += pts;
  return {pts,feedback};
}

// handle send
send_Btn.addEventListener("click",()=>{
  if(!gameActive) return;
  const text = user_Input.value.trim();
  if(!text) return;
  userSay(text);
  const {pts,feedback} = analyzeInput(text);
  scoreEl.textContent = `Score: ${score}`;
  setTimeout(()=>{
    botSay(feedback);
    if(Math.random()>0.5)
      botSay(["That's interesting!","Tell me more about you.","How's your day?"][Math.floor(Math.random()*3)]);
  },500);
  user_Input.value="";
});

// start game
botSay(botGreetings[Math.floor(Math.random()*botGreetings.length)]);
startTimer();


