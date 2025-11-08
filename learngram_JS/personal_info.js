/* Learngram Personal Info lesson
   - Validates country via REST Countries
   - Fetches media from Wikimedia Commons
   - TTS and localStorage
   - Light-blue buttons, responsive
*/

/* DOM */
const chatWindow = document.getElementById('chatWindow');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const replayBtn = document.getElementById('replayBtn');
const imgCard = document.getElementById('imgCard');
const audioCard = document.getElementById('audioCard');
const videoCard = document.getElementById('videoCard');
const statusEl = document.getElementById('status');
const validationMsg = document.getElementById('validationMsg');
const autoSpeakToggle = document.getElementById('autoSpeak');
const clearBtn = document.getElementById('clearBtn');
const examplesList = document.getElementById('examplesList');

/* Examples */
const EXAMPLES = [
  "Hi! My name is Jane.",
  "I'm 25.",
  "I'm from United states.",
  "I work as a teacher.",
  "My email is jane@example.com",
  "I like reading books."
];
function renderExamples(){
  examplesList.innerHTML = '';
  EXAMPLES.forEach(t=>{
    const d = document.createElement('div');
    d.className = 'example-item';
    d.textContent = t;
    d.onclick = ()=> { userInput.value = t; sendBtn.click(); };
    examplesList.appendChild(d);
  });
}
renderExamples();

/* Storage keys */
const PROFILE_KEY = 'learngram:profile:v1';
const LASTBOT_KEY = 'learngram:lastbot:v1';

/* Helpers */
function appendMessage(text, who='bot'){
  const div = document.createElement('div');
  div.className = 'msg ' + (who === 'user' ? 'user' : 'bot');
  div.innerText = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
function setStatus(msg, cls=''){
  if(!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = cls ? cls : '';
}
function saveProfile(p){ localStorage.setItem(PROFILE_KEY, JSON.stringify(p||{})); }
function loadProfile(){ try{ return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); }catch(e){return {}; } }

/* Media: Wikimedia Commons search */
async function commonsSearch(query, filetype='image'){
  const extra = filetype==='image' ? 'filetype:bitmap' : (filetype==='audio' ? 'filetype:audio' : 'filetype:video');
  const q = `${query} ${extra}`.trim();
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=6&iiprop=url|mime`;
  try{
    const r = await fetch(url);
    if(!r.ok) return [];
    const data = await r.json();
    if(!data.query) return [];
    const pages = Object.values(data.query.pages||{});
    const out = [];
    for(const p of pages){
      const ii = p.imageinfo && p.imageinfo[0];
      if(ii && ii.url) out.push({title:p.title, url:ii.url, mime: ii.mime});
    }
    return out;
  }catch(e){
    console.warn('commons error', e);
    return [];
  }
}

/* Country validation via Rest Countries */
async function validateCountry(name){
  if(!name) return {ok:false};
  try{
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false`);
    if(!res.ok) return {ok:false};
    const data = await res.json();
    if(Array.isArray(data) && data.length>0){
      const c = data[0];
      return {ok:true, name: c.name?.common || name, flag: c.flags?.png || c.flags?.svg || null};
    }
    return {ok:false};
  }catch(e){
    console.warn('country error', e);
    return {ok:false};
  }
}

/* validators */
function isValidEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
function isValidPhone(s){ return /^[\d\+\-\s\(\)]{7,20}$/.test(s); }
function isNumeric(s){ return /^\d+$/.test(String(s).trim()); }

/* extraction heuristics */
function extractName(text){
  const m = text.match(/\bmy name is\s+([A-Za-z \-']{2,40})/i) || text.match(/\bi['’]?m\s+([A-Za-z \-']{2,40})/i) || text.match(/\bi am\s+([A-Za-z \-']{2,40})/i);
  if(m) return m[1].trim();
  // fallback: if short phrase, accept it
  if(text.trim().split(/\s+/).length <= 3 && /^[A-Za-z\-'\s]+$/.test(text.trim())) return text.trim();
  return null;
}
function extractAge(text){
  const m = text.match(/(\d{1,3})/);
  return m ? m[1] : null;
}
function extractCountry(text){
  const m = text.match(/\b(?:i am from|i'm from|i am|i'm|from|i live in|i'm in)\s+([A-Za-z \-']{2,60})/i);
  if(m) return m[1].trim();
  if(text.trim().split(/\s+/).length <= 4) return text.trim();
  return null;
}
function extractOccupation(text){
  const m = text.match(/\b(?:i am a|i'm a|i am|i'm|i work as)\s+([A-Za-z \-']{2,60})/i);
  if(m) return m[1].trim();
  if(text.trim().split(/\s+/).length <= 4) return text.trim();
  return null;
}
function extractHobby(text){
  const m = text.match(/\b(?:i like|i love|i enjoy|my hobby is)\s+([A-Za-z \-']{2,80})/i);
  if(m) return m[1].trim();
  if(text.trim().split(/\s+/).length <= 6) return text.trim();
  return null;
}
function extractContact(text){
  const em = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  if(em) return {type:'email', value:em[0]};
  const ph = text.match(/[\+\d][\d\-\s\(\)]{6,20}\d/);
  if(ph) return {type:'phone', value:ph[0].trim()};
  return null;
}

/* local reply templates */
function localReply(intent, text, profile){
  switch(intent){
    case 'ask_name': return `Nice to meet you, ${text}! How old are you?`;
    case 'ask_age': return `Thanks — ${text} years old. Where are you from?`;
    case 'ask_country': return `Great — ${text}. What's your job or occupation?`;
    case 'ask_occupation': return `Nice! ${text} sounds interesting. What hobby do you enjoy?`;
    case 'ask_hobby': return `Lovely — ${text}. Could you share an email or phone number?`;
    case 'ask_contact': return `Thanks. I've saved your contact. Summary: Name: ${profile.name||'—'}, Age: ${profile.age||'—'}, Country: ${profile.nationality||'—'}.`;
    default: return `I heard: "${text}". You can say "My name is ...", "I'm 25", "I'm from Kenya", "I work as a teacher", or "My email is ..."`;
  }
}

/* Conversation & profile */
let profile = loadProfile() || {};
let lastBotText = localStorage.getItem(LASTBOT_KEY) || "Hello! I'm Learngram. Start by telling me your name (e.g. \"My name is Jane\").";
appendMessage(lastBotText,'bot'); localStorage.setItem(LASTBOT_KEY,lastBotText);

/* fetch media helper */
async function fetchMediaFor(term){
  imgCard.innerHTML = '<div class="placeholder">Searching image...</div>';
  audioCard.innerHTML = '<div class="placeholder">Searching audio...</div>';
  videoCard.innerHTML = '<div class="placeholder">Searching video...</div>';
  try{
    const [imgs,auds,vids] = await Promise.all([
      commonsSearch(term,'image'),
      commonsSearch(term,'audio'),
      commonsSearch(term,'video')
    ]);
    if(imgs && imgs.length){ imgCard.innerHTML=''; const i=document.createElement('img'); i.src=imgs[0].url; i.alt=imgs[0].title||term; imgCard.appendChild(i); }
    else imgCard.innerHTML = '<div class="placeholder">No image found.</div>';
    if(auds && auds.length){ audioCard.innerHTML=''; const a=document.createElement('audio'); a.controls=true; a.src=auds[0].url; audioCard.appendChild(a); }
    else audioCard.innerHTML = '<div class="placeholder">No audio found.</div>';
    if(vids && vids.length){ videoCard.innerHTML=''; const v=document.createElement('video'); v.controls=true; v.src=vids[0].url; videoCard.appendChild(v); }
    else videoCard.innerHTML = `<div class="placeholder">No video — try a YouTube search:<br><a target="_blank" href="https://www.youtube.com/results?search_query=${encodeURIComponent(term)}">search on YouTube</a></div>`;
  }catch(e){
    console.warn('media error', e);
    imgCard.innerHTML = '<div class="placeholder">Media fetch error.</div>';
    audioCard.innerHTML = '<div class="placeholder">Media fetch error.</div>';
    videoCard.innerHTML = '<div class="placeholder">Media fetch error.</div>';
  }
}

/* main send handler */
async function handleSend(){
  const text = (userInput.value||'').trim();
  if(!text) return;
  appendMessage(text,'user');
  userInput.value = '';
  validationMsg.textContent = '';
  setStatus('', '');

  // contact first
  const contact = extractContact(text);
  if(contact){
    profile.contact = profile.contact || {};
    profile.contact[contact.type] = contact.value;
    saveProfile(profile);
    const reply = localReply('ask_contact', text, profile);
    appendMessage(reply,'bot'); localStorage.setItem(LASTBOT_KEY, reply);
    if(autoSpeakToggle.checked) speak(reply);
    return;
  }

  // name
  const name = extractName(text);
  if(name){
    profile.name = name; saveProfile(profile);
    const reply = localReply('ask_name', name, profile);
    appendMessage(reply,'bot'); localStorage.setItem(LASTBOT_KEY, reply);
    if(autoSpeakToggle.checked) speak(reply);
    return;
  }

  // age
  const age = extractAge(text);
  if(age){
    if(!isNumeric(age)){ appendMessage("Please provide your age as a number (e.g. 25).",'bot'); if(autoSpeakToggle.checked) speak("Please give your age as a number."); return; }
    profile.age = age; saveProfile(profile);
    const reply = localReply('ask_age', age, profile);
    appendMessage(reply,'bot'); localStorage.setItem(LASTBOT_KEY, reply);
    if(autoSpeakToggle.checked) speak(reply);
    return;
  }

  // country
  const countryGuess = extractCountry(text);
  if(countryGuess){
    setStatus('Checking country...', '');
    const v = await validateCountry(countryGuess);
    if(v.ok){
      profile.nationality = v.name; if(v.flag) profile.flag = v.flag;
      saveProfile(profile);
      setStatus('Country validated.', 'success');
      await fetchMediaFor(v.name);
      const reply = localReply('ask_country', v.name, profile);
      appendMessage(reply,'bot'); localStorage.setItem(LASTBOT_KEY, reply);
      if(autoSpeakToggle.checked) speak(reply);
    } else {
      setStatus('Country not found. Try another name (e.g., "Kenya").', 'error');
      appendMessage("I couldn't find that country. Please try a country name like 'Canada' or 'Kenya'.",'bot');
      if(autoSpeakToggle.checked) speak("I couldn't find that country. Try again.");
    }
    return;
  }

  // occupation
  const occ = extractOccupation(text);
  if(occ){
    profile.occupation = occ; saveProfile(profile);
    await fetchMediaFor(occ);
    const reply = localReply('ask_occupation', occ, profile);
    appendMessage(reply,'bot'); localStorage.setItem(LASTBOT_KEY, reply);
    if(autoSpeakToggle.checked) speak(reply);
    return;
  }

  // hobby
  const hobby = extractHobby(text);
  if(hobby){
    profile.hobby = hobby; saveProfile(profile);
    const reply = localReply('ask_hobby', hobby, profile);
    appendMessage(reply,'bot'); localStorage.setItem(LASTBOT_KEY, reply);
    if(autoSpeakToggle.checked) speak(reply);
    return;
  }

  // fallback: simple helpful reply
  const fallback = localReply('chat', text, profile);
  appendMessage(fallback,'bot'); localStorage.setItem(LASTBOT_KEY, fallback);
  if(autoSpeakToggle.checked) speak(fallback);
}

/* send click + Enter key */
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); handleSend(); } });

/* replay last bot message */
replayBtn.addEventListener('click', ()=>{
  const last = localStorage.getItem(LASTBOT_KEY);
  if(!last){ setStatus('No reply to replay yet.','error'); return; }
  speak(last);
});

/* clear saved profile */
clearBtn.addEventListener('click', ()=>{
  if(!confirm('Clear saved personal info from this device?')) return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(LASTBOT_KEY);
  profile = {};
  setStatus('Saved info cleared.','success');
  appendMessage('Profile cleared. Start again by telling me your name (e.g. "My name is Jane").','bot');
});

/* TTS speak */
function speak(text){
  if(!('speechSynthesis' in window)) return;
  try{
    window.speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = 'en-US';
    window.speechSynthesis.speak(ut);
  }catch(e){ console.warn('TTS error', e); }
}

/* bootstrap: greet if we have saved profile */
(function init(){
  profile = loadProfile() || {};
  if(profile && Object.keys(profile).length){
    const summary = `Welcome back${profile.name ? ', ' + profile.name : ''}! I have your saved info. Type "update" to change any detail.`;
    appendMessage(summary,'bot');
    localStorage.setItem(LASTBOT_KEY, summary);
    if(profile.nationality) fetchMediaFor(profile.nationality);
  } else {
    const welcome = "Hello! I'm Learngram. Start by telling me your name (e.g. \"My name is Jane\").";
    appendMessage(welcome,'bot');
    localStorage.setItem(LASTBOT_KEY, welcome);
  }
})();

/* MINI-GAME CODE */

 const chatBox = document.getElementById("chatBox");
  const UserInput = document.getElementById("UserInput");
  const SendBtn = document.getElementById("SendBtn");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const timerDisplay = document.getElementById("timer");

  let score = 0;
  let step = 0;
  let userData = {};
  let timeLeft = 30;
  let timer;
  let gameActive = true;

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
    timer = setInterval(() => {
      if (!gameActive) return;
      timeLeft--;
      timerDisplay.textContent = `Time Left: ${timeLeft}s`;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    gameActive = false;
    clearInterval(timer);
    UserInput.disabled = true;
    SendBtn.disabled = true;
    addMessage(`⏰ Time’s up! Your final score is ${score}.`, "bot");
  }

  function checkGrammarAndSpelling(input) {
    let points = 0;
    if (input[0] === input[0].toUpperCase()) points++;
    if (/[.!?]$/.test(input)) points++;
    if (!/\d/.test(input)) points++;
    return points;
  }

  async function fetchAIReply(input) {
    const responses = {
      name: `Nice to meet you, ${input.split(" ")[0]}!`,
      age: `Oh, ${input}? You seem young and energetic!`,
      nationality: `That's great! I love people from ${input}.`,
      occupation: `${input}? Sounds like a great job!`,
      hobby: `Wow, ${input} sounds fun!`,
      contact: `Got it! Thanks for sharing your contact info.`,
    };

    const keys = Object.keys(responses);
    return responses[keys[step]] || "That's interesting!";
  }

  SendBtn.addEventListener("click", async () => {
    if (!gameActive) return;
    const input = UserInput.value.trim();
    if (!input) return alert("Please type something!");
    addMessage(input, "user");
    UserInput.value = "";

    if (step === 0 && !timer) startTimer(); // Start timer on first message

    const points = checkGrammarAndSpelling(input);
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;

    const aiReply = await fetchAIReply(input);
    addMessage(aiReply, "bot");

    if (step === 0) userData.name = input;
    if (step === 1) userData.age = input;
    if (step === 2) userData.nationality = input;
    if (step === 3) userData.occupation = input;
    if (step === 4) userData.hobby = input;
    if (step === 5) userData.contact = input;

    step++;
    if (step < questions.length && gameActive) {
      setTimeout(() => addMessage(questions[step], "bot"), 1000);
    } else if (step >= questions.length && gameActive) {
      addMessage(`🎉 Great job ${userData.name || "friend"}! You’ve finished the chat. Your final score is ${score}.`, "bot");
      clearInterval(timer);
      gameActive = false;
    }
  });
