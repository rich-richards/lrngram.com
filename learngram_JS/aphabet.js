 /******************************************************************
     * Learngram Chapter 1 — Alphabet with:
     *  - localStorage progress (visited letters, game score)
     *  - curatedMedia map (offline/local fallback)
     *  - Wikimedia fetch as online source
     *  - mini-game: match the sound to the letter
     *  - strong validation & error handling
     ******************************************************************/

    // ---------------- Example map
    const EXAMPLE_MAP = {
      A:['apple','ant','airplane'], B:['ball','banana','boat'], C:['cat','car','cup'],
      D:['dog','door','drum'], E:['elephant','egg','engine'], F:['fish','frog','flower'],
      G:['guitar','goat','grapes'], H:['hat','horse','house'], I:['ice cream','island','igloo'],
      J:['juice','jacket','jungle'], K:['kite','kangaroo','key'], L:['lion','lamp','lemon'],
      M:['monkey','moon','mouse'], N:['nest','nose','notebook'], O:['octopus','orange','owl'],
      P:['pizza','pen','piano'], Q:['queen','quilt','quail'], R:['rabbit','robot','rain'],
      S:['sun','snake','sandwich'], T:['table','tree','tiger'], U:['umbrella','unicorn','uniform'],
      V:['violin','vase','van'], W:['whale','window','watch'], X:['xylophone','x-ray','xmas'],
      Y:['yacht','yogurt','yak'], Z:['zebra','zoo','zipper']
    };

    // ---------------- Curated media map
    // Replace values with hosted URLs or local relative paths when packaging.
    // Example structure: { A: { image: 'media/a.jpg', audio: 'media/a.mp3', video: 'media/a.mp4' }, ... }
    // For demo, some entries are empty; update with your own files for offline use.
    const curatedMedia = {
      A: { image: '', audio: '', video: '' },
      B: { image: '', audio: '', video: '' },
      C: { image: '', audio: '', video: '' },
      // ... fill the rest if you package media
      // Example:
      // A: { image: 'media/apple.jpg', audio: 'media/apple.mp3', video: 'media/apple.mp4' }
    };

    // ---------------- DOM
    const letterInput = document.getElementById('letterInput');
    const letterBox = document.getElementById('letterBox');
    const fetchBtn = document.getElementById('fetchBtn');
    const speakBtn = document.getElementById('speakBtn');
    const clearBtn = document.getElementById('clearBtn');
    const feedback = document.getElementById('feedback');
    const imageContainer = document.getElementById('imageContainer');
    const audioContainer = document.getElementById('audioContainer');
    const videoContainer = document.getElementById('videoContainer');
    const exampleMapEl = document.getElementById('exampleMap');
    const useWikimedia = document.getElementById('useWikimedia');
    const useCurated = document.getElementById('useCurated');
    const autoSpeak = document.getElementById('autoSpeak');
    const printBtn = document.getElementById('printBtn');
    const resetProgressBtn = document.getElementById('resetProgress');
    const resetGameBtn = document.getElementById('resetGame');
    const visitedListEl = document.getElementById('visitedList');
    const gameScoreEl = document.getElementById('gameScore');

    // game elements
    const startRoundBtn = document.getElementById('startRound');
    const playAgainBtn = document.getElementById('playAgain');
    const gameOptionsEl = document.getElementById('gameOptions');
    const roundFeedback = document.getElementById('roundFeedback');

    // nav
    const navItems = document.querySelectorAll('nav li');

    // show example map
    exampleMapEl.textContent = JSON.stringify(EXAMPLE_MAP, null, 2);

    // ---------------- localStorage keys and helpers
    const STORAGE_KEY = 'learngram_alphabet_v1';

    function loadProgress(){
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return { visited: [], game: { played:0, correct:0 } };
        return JSON.parse(raw);
      } catch(e) { console.warn('loadProgress failed', e); return { visited: [], game: { played:0, correct:0 } }; }
    }
    function saveProgress(state){
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) { console.warn('saveProgress failed', e); }
    }
    // initialize
    let state = loadProgress();

    function updateVisited(letter){
      if(!letter) return;
      if(!state.visited.includes(letter)){
        state.visited.push(letter);
        saveProgress(state);
      }
      renderVisited();
    }

    function renderVisited(){
      if(state.visited.length === 0) visitedListEl.textContent = '—';
      else visitedListEl.textContent = state.visited.join(', ');
    }

    function updateGameStats(correct){
      state.game.played = (state.game.played || 0) + 1;
      if(correct) state.game.correct = (state.game.correct || 0) + 1;
      saveProgress(state);
      renderGame();
    }

    function renderGame(){
      const p = state.game.played || 0;
      const c = state.game.correct || 0;
      gameScoreEl.textContent = `Played: ${p} • Correct: ${c}`;
    }

    resetProgressBtn.addEventListener('click', () => {
      if(!confirm('Reset visited letters?')) return;
      state.visited = []; saveProgress(state); renderVisited(); showFeedback('Progress cleared.');
    });
    resetGameBtn.addEventListener('click', () => {
      if(!confirm('Reset game stats?')) return;
      state.game = { played:0, correct:0 }; saveProgress(state); renderGame(); showFeedback('Game stats cleared.');
    });

    // render initial progress
    renderVisited(); renderGame();

    // ---------------- utilities
    function escapeHtml(s){ return String(s).replace(/[&<>"'`]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;', '`':'&#96;'}[c])); }
    function showFeedback(msg, type=''){
      if(!msg){ feedback.innerHTML=''; return; }
      if(type === 'error') feedback.innerHTML = `<div class="error">${escapeHtml(msg)}</div>`;
      else if(type === 'success') feedback.innerHTML = `<div class="success">${escapeHtml(msg)}</div>`;
      else feedback.textContent = msg;
      setTimeout(()=>{ if(feedback.innerHTML) feedback.innerHTML = '' }, 6000);
    }

    function validateLetter(raw){
      if(!raw) return { ok:false, msg:'Please type a letter (A–Z).' };
      const letter = raw.trim().toUpperCase();
      if(letter.length !== 1 || letter < 'A' || letter > 'Z') return { ok:false, msg:'Only a single letter A–Z is accepted.' };
      return { ok:true, letter };
    }

    // ---------------- Wikimedia search (images/audio/video)
    async function searchCommons(query, filetype='image'){
      const extra = filetype === 'image' ? 'filetype:bitmap' : (filetype === 'audio' ? 'filetype:audio' : 'filetype:video');
      const search = `${query} ${extra}`.trim();
      const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&generator=search&gsrsearch=${encodeURIComponent(search)}&gsrlimit=5&iiprop=url|mime`;
      try {
        const res = await fetch(url);
        if(!res.ok) throw new Error('Network not ok');
        const data = await res.json();
        if(!data.query) return [];
        const pages = Object.values(data.query.pages || {});
        const results = [];
        for(const p of pages){
          if(p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url){
            const mime = (p.imageinfo[0].mime || '').toLowerCase();
            results.push({title:p.title, url:p.imageinfo[0].url, mime});
          }
        }
        return results;
      } catch(e){
        console.warn('commons search failed', e);
        return [];
      }
    }

    // ---------------- renderers
    function renderImage(images){
      imageContainer.innerHTML = '';
      if(!images || images.length === 0){
        imageContainer.innerHTML = '<div class="placeholder">No image found.</div>'; return;
      }
      const img = document.createElement('img');
      img.className = 'demo-img';
      img.alt = images[0].title || 'example';
      img.src = images[0].url;
      imageContainer.appendChild(img);
    }
    function renderAudio(audios){
      audioContainer.innerHTML = '';
      if(!audios || audios.length === 0){
        audioContainer.innerHTML = '<div class="placeholder">No audio found.</div>'; return;
      }
      const a = document.createElement('audio');
      a.controls = true;
      a.src = audios[0].url;
      audioContainer.appendChild(a);
    }
    function renderVideo(videos, fallbackQuery){
      videoContainer.innerHTML = '';
      if(videos && videos.length > 0){
        const v = document.createElement('video');
        v.controls = true; v.src = videos[0].url; v.style.maxHeight = '220px';
        videoContainer.appendChild(v); return;
      }
      const link = document.createElement('a');
      link.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(fallbackQuery)}`;
      link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Search example videos on YouTube';
      link.style.display='inline-block';
      link.style.color='#1474e2';
      videoContainer.appendChild(link);
    }

    // ---------------- TTS
    function speakText(text){
      if(!('speechSynthesis' in window)) { showFeedback('SpeechSynthesis API not available.', 'error'); return; }
      try{ window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang='en-US'; window.speechSynthesis.speak(u); } catch(e){ console.warn('TTS failed', e); showFeedback('TTS failed', 'error'); }
    }

    // ---------------- fetch flow with curated fallback
    async function handleFetch(){
      showFeedback('', '');
      const raw = letterInput.value;
      const v = validateLetter(raw);
      if(!v.ok){ showFeedback(v.msg, 'error'); return; }
      const letter = v.letter;
      letterBox.textContent = letter;
      updateVisited(letter);

      const examples = EXAMPLE_MAP[letter] || [];
      if(examples.length === 0){ showFeedback('No example words configured for this letter.', 'error'); return; }
      const example = examples[0];
      showFeedback(`Searching media for "${example}" (letter ${letter})...`);

      imageContainer.innerHTML = '<div class="placeholder">Searching image...</div>';
      audioContainer.innerHTML = '<div class="placeholder">Searching audio...</div>';
      videoContainer.innerHTML = '<div class="placeholder">Searching video...</div>';

      // curated media preference
      const curated = useCurated.checked && curatedMedia[letter] && (curatedMedia[letter].image || curatedMedia[letter].audio || curatedMedia[letter].video);
      if(curated){
        // use curated media when provided
        const cm = curatedMedia[letter];
        if(cm.image){ renderImage([{title: letter, url: cm.image, mime:'image/*'}]); } else renderImage([]);
        if(cm.audio){ renderAudio([{title: letter, url: cm.audio, mime:'audio/*'}]); } else renderAudio([]);
        if(cm.video){ renderVideo([{title: letter, url: cm.video, mime:'video/*'}], example + ' ' + letter); } else renderVideo([], example + ' ' + letter);
        if(autoSpeak.checked && !cm.audio){ speakText(letter + ', as in ' + example); }
        showFeedback(`Shown curated media for "${example}" (letter ${letter}).`, 'success');
        return;
      }

      // If online fetch disabled, fallback to empty + TTS
      if(!useWikimedia.checked){
        showFeedback('Wikimedia fetch disabled. Showing fallback (TTS).');
        renderImage([]); renderAudio([]); renderVideo([], example + ' ' + letter);
        if(autoSpeak.checked) speakText(letter + ', as in ' + example);
        return;
      }

      // Normal online fetch
      try {
        const [imgs, auds, vids] = await Promise.all([
          searchCommons(example, 'image'),
          searchCommons(example, 'audio'),
          searchCommons(example, 'video')
        ]);
        const images = (imgs || []).filter(i => i.mime && i.mime.startsWith('image')) || imgs;
        const audios = (auds || []).filter(a => a.mime && a.mime.startsWith('audio')) || auds;
        const videos = (vids || []).filter(v => v.mime && v.mime.startsWith('video')) || vids;

        renderImage(images);
        renderAudio(audios);
        renderVideo(videos, example + ' ' + letter + ' pronunciation');

        if((!audios || audios.length === 0) && autoSpeak.checked){
          speakText(letter + ', as in ' + example);
        }
        showFeedback(`Results for "${example}" (letter ${letter}).`, 'success');
      } catch(err){
        console.error(err);
        showFeedback('Network error or Wikimedia blocked. Showing fallback.', 'error');
        renderImage([]); renderAudio([]); renderVideo([], example + ' ' + letter);
        if(autoSpeak.checked) speakText(letter + ', as in ' + example);
      }
    }

    // ---------------- real-time display
    letterInput.addEventListener('input', () => {
      const raw = letterInput.value;
      if(!raw){ letterBox.textContent = 'A'; return; }
      const ch = raw.trim().toUpperCase().slice(0,1);
      if(ch >= 'A' && ch <= 'Z'){ letterBox.textContent = ch; } else { letterBox.textContent = ch; }
    });
    letterInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') handleFetch(); });

    fetchBtn.addEventListener('click', handleFetch);
    speakBtn.addEventListener('click', () => {
      const raw = letterInput.value || 'A'; const v = validateLetter(raw);
      if(!v.ok){ showFeedback(v.msg,'error'); return; }
      const letter = v.letter; const example = (EXAMPLE_MAP[letter] && EXAMPLE_MAP[letter][0]) || '';
      // prefer curated audio if enabled & available
      if(useCurated.checked && curatedMedia[letter] && curatedMedia[letter].audio){
        const audioUrl = curatedMedia[letter].audio;
        const a = new Audio(audioUrl); a.play().catch(()=> speakText(letter + (example ? (', as in ' + example) : '')) );
      } else {
        // no curated audio — try TTS
        speakText(letter + (example ? (', as in ' + example) : ''));
      }
    });

    clearBtn.addEventListener('click', () => {
      letterInput.value = ''; letterBox.textContent = 'A';
      imageContainer.innerHTML = '<div class="placeholder">No image yet</div>';
      audioContainer.innerHTML = '<div class="placeholder">No audio yet</div>';
      videoContainer.innerHTML = '<div class="placeholder">No video yet</div>';
      showFeedback('Cleared.');
    });

    // print
    printBtn && printBtn.addEventListener('click', () => window.print());

    // nav
 // Original nav logic to modify
navItems.forEach(li => {
  li.addEventListener('click', () => {
    // 1. Remove 'active' class from all nav items
    navItems.forEach(x => x.classList.remove('active'));
    
    // 2. Add 'active' class to the clicked item
    li.classList.add('active');
    
    const section = li.dataset.section;

    // 3. HIDE ALL sections, *EXCEPT* the mini-game section ('#game')
    document.querySelectorAll('main.content section.card').forEach(s => {
        // Only hide the section if its ID is NOT 'game'
        if (s.id !== 'game') { 
            s.style.display = 'none';
        }
    });

    // 4. SHOW the target section (which could be the 'lesson' or 'how', etc.)
    const target = document.getElementById(section);
    if(target) target.style.display = 'block';

    // 5. Ensure the Mini-Game section is always visible
    const gameSection = document.getElementById('game');
    if (gameSection) {
        gameSection.style.display = 'block';
    }
  });
});

// We also need to fix the initial load of sections.
// When the page loads, only the active section and the game should be visible.

// Add this function call at the end of the script to ensure correct initial state
document.addEventListener('DOMContentLoaded', () => {
    // Hide all sections initially (except the one marked 'active' in HTML/CSS)
    document.querySelectorAll('main.content section.card').forEach(s => {
        // Assuming 'lesson' is the default active section
        if (s.id !== 'lesson' && s.id !== 'game') {
            s.style.display = 'none';
        } else {
            s.style.display = 'block';
        }
    });
});

    // ---------------- MINI-GAME: Match the sound to the letter
    // Game state
    let currentRound = { target: null, choices: [], audioUrl: null, ttsOnly: false };

    function pickRandomLetters(count = 4){
      const letters = Object.keys(EXAMPLE_MAP);
      const chosen = [];
      while(chosen.length < count){
        const c = letters[Math.floor(Math.random()*letters.length)];
        if(!chosen.includes(c)) chosen.push(c);
      }
      return chosen;
    }

    async function playLetterSound(letter){
      // Preference: curated audio -> Wikimedia fetched audio (if currently displayed) -> TTS
      // curated
      if(useCurated.checked && curatedMedia[letter] && curatedMedia[letter].audio){
        try { const a = new Audio(curatedMedia[letter].audio); await a.play(); return {source:'curated'}; } catch(e){ console.warn('curated play failed', e); }
      }
      // if audio currently loaded in audioContainer (from previous fetch), try to play it
      const audioEl = audioContainer.querySelector('audio');
      if(audioEl && audioEl.src && audioEl.src.length > 0 && audioEl.src.includes(letter.toLowerCase())) {
        try { await audioEl.play(); return {source:'fetched'}; } catch(e){ /* ignore */ }
      }
      // else TTS
      try { speakText(letter); return {source:'tts'}; } catch(e){ console.warn('tts failed', e); return {source:'none'}; }
    }

    function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] } return arr; }

    async function startRound(){
      roundFeedback.textContent = '';
      gameOptionsEl.innerHTML = '';
      playAgainBtn.disabled = true;

      // pick target letter and other choices
      const choices = pickRandomLetters(4);
      const target = choices[Math.floor(Math.random()*choices.length)];
      currentRound.target = target;
      currentRound.choices = shuffle(choices.slice());

      // render option buttons
      currentRound.choices.forEach(ch => {
        const b = document.createElement('button');
        b.textContent = ch;
        b.dataset.letter = ch;
        b.addEventListener('click', onGameChoice);
        gameOptionsEl.appendChild(b);
      });

      // play sound
      const result = await playLetterSound(target);
      currentRound.ttsOnly = (result.source === 'tts');
      playAgainBtn.disabled = false;
      // store last played letter in case user presses Play Again
      currentRound.audioUrl = null;
      // mark round started
      roundFeedback.textContent = 'Round started — listen and choose the correct letter!';
    }

    async function onGameChoice(e){
      const chosen = e.currentTarget.dataset.letter;
      const correct = chosen === currentRound.target;
      // visual feedback
      Array.from(gameOptionsEl.children).forEach(btn=>{
        btn.disabled = true;
        if(btn.dataset.letter === currentRound.target) btn.classList.add('correct');
        if(btn.dataset.letter === chosen && !correct) btn.classList.add('wrong');
      });
      // update stats
      updateGameStats(correct);
      // message
      if(correct) roundFeedback.innerHTML = '<div class="success">Correct! Well done 🎉</div>';
      else roundFeedback.innerHTML = `<div class="error">Wrong — the right letter was ${currentRound.target}.</div>`;
    }

    startRoundBtn.addEventListener('click', startRound);
    playAgainBtn.addEventListener('click', async () => {
      if(!currentRound.target){ showFeedback('Start a round first.'); return; }
      await playLetterSound(currentRound.target);
    });

    // ---------------- accessibility / focus
    window.addEventListener('load', () => {
      letterInput.focus();
      imageContainer.innerHTML = '<div class="placeholder">No image yet</div>';
      audioContainer.innerHTML = '<div class="placeholder">No audio yet</div>';
      videoContainer.innerHTML = '<div class="placeholder">No video yet</div>';
    });

    // expose for debugging
    window.EXAMPLE_MAP = EXAMPLE_MAP;
    window.curatedMedia = curatedMedia;
    window.learngramState = state;
