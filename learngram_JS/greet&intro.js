
/* ---------- Configuration for optional LLM ----------
If you want the bot to be a "powerful AI model", provide:
// ... (omitted unchanged configuration) ...
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
function showVideo(list, fallback){ videoCard.innerHTML=''; if(list&&list.length){ const v=document.createElement('video'); v.controls=true; v.src=list[0].url; videoCard.appendChild(v); return;} videoCard.innerHTML=`<div class="placeholder">No video — <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(fallback)}" target="_blank" rel="noopener" class='link'>Search example videos on YouTube</a></div>`; }

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
// ... (omitted unchanged LLM logic) ...
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

/* ---------- send path (MAIN LESSON CHAT) ---------- */
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
// ... (omitted unchanged appendToUI function) ...
const div = document.createElement('div'); div.className = 'msg ' + (msg.who === 'user' ? 'user' : 'bot');
const meta = msg.t ? `<meta>${new Date(msg.t).toLocaleTimeString()}</meta>` : '';
div.innerHTML = `<div>${escapeHtml(msg.text)}</div>${meta}`;
chatWindow.appendChild(div);
chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* TTS wrapper */
function speak(text){
// ... (omitted unchanged speak function) ...
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
// ... (omitted unchanged voiceBtn listener) ...
const last = localStorage.getItem(STORAGE_LASTBOT) || lastBotText || '';
if(!last){ setStatus('No bot reply yet to speak.', 'error'); return; }
speak(last);
});

/* clear history */
clearHistory.addEventListener('click', ()=>{
// ... (omitted unchanged clearHistory listener) ...
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
// ... (omitted unchanged init function) ...
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
/* ---------------------- MINI-GAME (embedded) ----------------------*/
const StartBtn = document.getElementById("start_Btn");
const StartScreen = document.getElementById("start_Screen");
const ComposerArea = document.getElementById("composer_Area"); 

// Changed variable names from user's provided snippet to match updated HTML IDs
const chatBox = document.getElementById("chat_Window");
const UserInput = document.getElementById("user_Input");
const SendBtn = document.getElementById("send_Btn");
const scoreDisplay = document.getElementById("score"); 
const timerDisplay = document.getElementById("timer");
const RestartScreen = document.getElementById("restart_Screen"); 
const RestartBtn = document.getElementById("restart_Btn"); 


let score = 0;
let step = 0;
let userData = {};
let timeLeft = 30;
let timer = null; 
let gameActive = false; 

const questions = [
"What's your name?",
"Nice to meet you! How old are you?",
"Cool! What's your nationality?",
"What do you do for a living?",
"What are your hobbies?",
"Can you share your email or phone number?",
];

function addMessage(text, sender) {
const msg = document.createElement("div");
msg.classList.add("chat-message", sender);
msg.textContent = text;
chatBox.appendChild(msg);
chatBox.scrollTop = chatBox.scrollHeight;
}

function startTimer() {
// ... (omitted unchanged startTimer function) ...
timerDisplay.textContent = `${timeLeft}`;
timer = setInterval(() => {
 if (!gameActive) return;
 timeLeft--;
 timerDisplay.textContent = `${timeLeft}`;
 if (timeLeft <= 0) endGame();
}, 1000);
}

function endGame() {
// ... (omitted unchanged endGame function) ...
gameActive = false;
clearInterval(timer);
timer = null; 
UserInput.disabled = true;
SendBtn.disabled = true;
ComposerArea.style.display = 'none'; 

addMessage(`⏰ Time’s up! Your final score is ${score}.`, "bot");
 RestartScreen.style.display = 'block'; 
}

function checkGrammarAndSpelling(input) {
// ... (omitted unchanged checkGrammarAndSpelling function) ...
let points = 0;
if (input[0] === input[0].toUpperCase()) points++;
if (/[.!?]$/.test(input)) points++;
if (!/\d/.test(input)) points++; 
return points;
}

/* ---------------------- MINI-GAME REVISED AI LOGIC ----------------------*/
async function fetchAIReply(input) {
// ... (omitted unchanged fetchAIReply function) ...
 // Get the stored name for personalized replies, defaulting to 'friend'
 const name = userData.name || "friend"; 

 // This switch statement uses the 'step' variable to determine the context and reply.
 switch(step) {
  case 0:
   // User replies to "What's your name?" (e.g., "I'm Anna")
   // Key lesson phrase used: "Nice to meet you!"
   return `Nice to meet you, ${name}! I'm your Learngram Assistant.`;
  case 1:
   // User replies to "Nice to meet you! How old are you?" (e.g., "I'm twenty")
   // Key lesson phrase used: "Hello, how are you?" (adapted)
   return `Thank you for sharing, ${name}. **How's it going** otherwise today?`; 
  case 2:
   // User replies to "Cool! What's your nationality?" (e.g., "I am Spanish")
   // Focus on acknowledgement and simple greetings
   return `That's great! It’s nice to meet people from ${input}. **Hi!**`; 
  case 3:
   // User replies to "What do you do for a living?" (e.g., "I'm a teacher")
   return `A ${input.trim().split(" ")[0]}? Fascinating! **Good morning** to you!`; 
  case 4:
   // User replies to "What are your hobbies?" (e.g., "I like reading")
   // Key lesson phrase used: "How are you?" (adapted for acknowledgement)
   return `Wow, that sounds fun, ${name}! **Hello**, I'm happy to chat with you.`;
  case 5:
   // User replies to "Can you share your email or phone number?" (e.g., "My email is...")
   // Last interaction: polite closing acknowledgement
   return `Got it, thank you! It was great practicing with you, ${name}.`;
  default:
   return "**Hello!** You answered perfectly. Let's continue."; 
 }
}
/* ---------------------- END REVISED AI LOGIC ----------------------*/

function startGame() {
// ... (omitted unchanged startGame function) ...
// Reset state
score = 0;
step = 0;
timeLeft = 30;
userData = {};
clearInterval(timer); 
timer = null; 
chatBox.innerHTML = ''; 
UserInput.value = '';
UserInput.disabled = false;
SendBtn.disabled = false;
scoreDisplay.textContent = `Score: 0`;
timerDisplay.textContent = '30'; 

// Toggle visibility: Hide start/restart buttons, show input composer
StartScreen.style.display = 'none';
 RestartScreen.style.display = 'none'; 
ComposerArea.style.display = 'flex'; 
gameActive = true;

// Start the conversation
addMessage(questions[step], "bot");
}

/* ---------------------- MINI-GAME SEND FUNCTION ----------------------*/
// This new function encapsulates the logic previously in the anonymous listener
async function sendMiniGameReply() {
if (!gameActive) return;
const input = UserInput.value.trim();
if (!input) return alert("Please type something!");

// Start timer on the first message sent by the user
if (step === 0 && timer === null) startTimer();

addMessage(input, "user");
UserInput.value = "";

const points = checkGrammarAndSpelling(input);
score += points;
scoreDisplay.textContent = `Score: ${score}`;

// Store user data
if (step === 0) userData.name = input;
else if (step === 1) userData.age = input;
else if (step === 2) userData.nationality = input;
else if (step === 3) userData.occupation = input;
else if (step === 4) userData.hobby = input;
else if (step === 5) userData.contact = input;

// Fetch AI reply based on the current step
const aiReply = await fetchAIReply(input);
addMessage(aiReply, "bot");

step++;

// Check if there are more questions
if (step < questions.length && gameActive) {
 setTimeout(() => addMessage(questions[step], "bot"), 1000);
} else if (step >= questions.length && gameActive) {
 // Game finished
 addMessage(`🎉 Great job ${userData.name || "friend"}! You’ve finished the chat. Your final score is ${score}.`, "bot");
 clearInterval(timer);
 timer = null; 
 gameActive = false;
 ComposerArea.style.display = 'none'; 
 RestartScreen.style.display = 'block'; 
}
}
/* ---------------------- END MINI-GAME SEND FUNCTION ----------------------*/


// --- Event Listeners ---

// Main Lesson Chat Send Button (Calls the dedicated 'send' function)
sendBtn.addEventListener('click', send);

// Main Lesson Chat Enter Key (Calls the dedicated 'send' function)
userInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); send(); } });

// Mini-Game Start Button Listener
StartBtn.addEventListener("click", startGame);

// Mini-Game Restart Button Listener
RestartBtn.addEventListener("click", startGame); 

// Mini-Game Send Button Listener (NOW calls the dedicated 'sendMiniGameReply' function)
SendBtn.addEventListener("click", sendMiniGameReply);

// Mini-Game Enter Key Listener (Calls the dedicated 'sendMiniGameReply' function)
UserInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMiniGameReply();
    }
});


// To ensure the ComposerArea and RestartScreen are hidden on initial load
document.addEventListener('DOMContentLoaded', () => {
ComposerArea.style.display = 'none';
 RestartScreen.style.display = 'none';
});