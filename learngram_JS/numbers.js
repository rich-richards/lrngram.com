  /* ---------- Utilities ---------- */
    const el = id => document.getElementById(id);
    function escapeHtml(s){ return String(s).replace(/[&<>"'`]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;', '`':'&#96;'}[c])); }
    function showFeedback(msg, type=''){
      const f = el('feedback');
      if(!msg){ f.innerHTML = ''; return; }
      if(type === 'error') f.innerHTML = `<div class="error">${escapeHtml(msg)}</div>`;
      else if(type === 'success') f.innerHTML = `<div class="success">${escapeHtml(msg)}</div>`;
      else f.textContent = msg;
      setTimeout(()=>{ if(f.innerHTML) f.innerHTML=''; }, 6000);
    }

    /* ---------- number -> words (0..100) ---------- */
    function numberToWords(n){
      const ones = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
      const tens = ['', '', 'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
      if(n < 20) return ones[n];
      if(n < 100){
        const t = Math.floor(n/10), r = n % 10;
        return r === 0 ? tens[t] : `${tens[t]} ${ones[r]}`;
      }
      if(n === 100) return 'one hundred';
      return String(n);
    }

    /* ---------- DOM references ---------- */
    const numberInput = el('numberInput');
    const numberBox = el('numberBox');
    const fetchBtn = el('fetchBtn');
    const speakBtn = el('speakBtn');
    const clearBtn = el('clearBtn');
    const imageContainer = el('imageContainer');
    const audioContainer = el('audioContainer');
    const videoContainer = el('videoContainer');
    const useWikimedia = el('useWikimedia');
    const autoSpeak = el('autoSpeak');
    const tableContainer = el('tableContainer');
    const printBtn = el('printBtn');

    // nav
    const navItems = document.querySelectorAll('nav li');

    /* ---------- create number list/table (0..100) ---------- */
    function createNumberTable(){
      // desktop/table: 10 columns x 11 rows (0..100) -> use table for wider screens
      const table = document.createElement('table');
      table.className = 'number-table';
      let row;
      let colCount = 10;
      for(let r = 0; r <= 10; r++){
        const tr = document.createElement('tr');
        for(let c = 0; c < colCount; c++){
          const n = r*colCount + c;
          if(n > 100) break;
          const td = document.createElement('td');
          td.textContent = n;
          td.dataset.num = n;
          td.addEventListener('click', () => selectNumber(n));
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }
      tableContainer.innerHTML = '';
      tableContainer.appendChild(table);
    }

    function createResponsiveGrid(){
      const grid = document.createElement('div');
      grid.className = 'grid-responsive';
      for(let n=0; n<=100; n++){
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.textContent = n;
        cell.dataset.num = n;
        cell.addEventListener('click', () => selectNumber(n));
        grid.appendChild(cell);
      }
      tableContainer.innerHTML = '';
      tableContainer.appendChild(grid);
    }

    // choose which to render based on width (table for >=760 px, grid for smaller)
    function renderNumberList(){
      if(window.innerWidth >= 760) createNumberTable(); else createResponsiveGrid();
      highlightActive();
    }

    window.addEventListener('resize', () => {
      // re-render layout on resize
      renderNumberList();
    });

    renderNumberList();

    /* ---------- input validation ---------- */
    function validateNumber(raw){
      if(raw === '' || raw === null || raw === undefined) return { ok:false, msg:'Please type a number (0–100).' };
      const n = Number(raw);
      if(Number.isNaN(n) || !Number.isInteger(n)) return { ok:false, msg:'Only whole numbers (integers) are accepted.' };
      if(n < 0 || n > 100) return { ok:false, msg:'Please enter a number between 0 and 100 (inclusive).' };
      return { ok:true, n };
    }

    /* ---------- Wikimedia search (image/audio/video) ---------- */
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

    /* ---------- render helpers ---------- */
    function renderImage(imgs){
      imageContainer.innerHTML = '';
      if(!imgs || imgs.length === 0){
        imageContainer.innerHTML = '<div class="placeholder">No image found.</div>';
        return;
      }
      const img = document.createElement('img');
      img.className = 'demo-img';
      img.src = imgs[0].url;
      img.alt = imgs[0].title || 'image';
      imageContainer.appendChild(img);
    }
    function renderAudio(auds){
      audioContainer.innerHTML = '';
      if(!auds || auds.length === 0){
        audioContainer.innerHTML = '<div class="placeholder">No audio found.</div>';
        return;
      }
      const a = document.createElement('audio');
      a.controls = true;
      a.src = auds[0].url;
      audioContainer.appendChild(a);
    }
    function renderVideo(vids, fallbackQuery){
      videoContainer.innerHTML = '';
      if(vids && vids.length > 0){
        const v = document.createElement('video');
        v.controls = true;
        v.src = vids[0].url;
        v.style.maxHeight = '220px';
        videoContainer.appendChild(v);
        return;
      }
      const link = document.createElement('a');
      link.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(fallbackQuery)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Search example videos on YouTube';
      link.style.display = 'inline-block';
      link.style.color = '#1474e2';
      link.style.fontSize = '16px';
      videoContainer.appendChild(link);
    }

    /* ---------- TTS ---------- */
    function speakText(text){
      if(!('speechSynthesis' in window)) { showFeedback('SpeechSynthesis not available.', 'error'); return; }
      try{ window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; window.speechSynthesis.speak(u); } catch(e){ console.warn('TTS fail', e); showFeedback('TTS failed', 'error'); }
    }

    /* ---------- main fetch flow ---------- */
    async function fetchForNumber(n){
      // n is integer 0..100
      numberBox.textContent = n;
      // convert to english word
      const word = numberToWords(n); // e.g., "forty five"
      showFeedback(`Searching media for "${word}" (number ${n})...`);
      imageContainer.innerHTML = '<div class="placeholder">Searching image...</div>';
      audioContainer.innerHTML = '<div class="placeholder">Searching audio...</div>';
      videoContainer.innerHTML = '<div class="placeholder">Searching video...</div>';

      if(!useWikimedia.checked){
        showFeedback('Wikimedia fetch disabled. Falling back to TTS.', 'error');
        renderImage([]); renderAudio([]); renderVideo([], word + ' ' + n);
        if(autoSpeak.checked) speakText(`${n} — ${word}`);
        return;
      }

      try{
        // parallel fetch
        const [imgs, auds, vids] = await Promise.all([
          searchCommons(word, 'image'),
          searchCommons(word, 'audio'),
          searchCommons(word, 'video')
        ]);
        const images = (imgs || []).filter(i => i.mime && i.mime.startsWith('image')) || imgs;
        const audios = (auds || []).filter(a => a.mime && a.mime.startsWith('audio')) || auds;
        const videos = (vids || []).filter(v => v.mime && v.mime.startsWith('video')) || vids;

        renderImage(images);
        renderAudio(audios);
        renderVideo(videos, word + ' ' + n);
        if((!audios || audios.length === 0) && autoSpeak.checked){
          speakText(`${n} — ${word}`);
        }
        showFeedback(`Results for "${word}" (number ${n}).`, 'success');
      } catch(err){
        console.error(err);
        showFeedback('Network error or Wikimedia blocked. Fallback used.', 'error');
        renderImage([]); renderAudio([]); renderVideo([], word + ' ' + n);
        if(autoSpeak.checked) speakText(`${n} — ${word}`);
      }
    }

    /* ---------- select number helpers ---------- */
    function selectNumber(n){
      numberInput.value = n;
      numberBox.textContent = n;
      highlightActive(n);
    }

    function highlightActive(n){
      // table cells
      document.querySelectorAll('.number-table td').forEach(td => {
        td.classList.toggle('active', Number(td.dataset.num) === Number(n));
      });
      // grid cells
      document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.toggle('active', Number(cell.dataset.num) === Number(n));
      });
    }

    /* ---------- wire events ---------- */
    fetchBtn.addEventListener('click', () => {
      const raw = numberInput.value;
      const v = validateNumber(raw);
      if(!v.ok){ showFeedback(v.msg,'error'); return; }
      fetchForNumber(v.n);
    });

    numberInput.addEventListener('input', () => {
      const raw = numberInput.value;
      const v = validateNumber(raw);
      if(v.ok){ numberBox.textContent = v.n; highlightActive(v.n); } else {
        numberBox.textContent = raw === '' ? '0' : raw;
      }
    });

    numberInput.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ fetchBtn.click(); } });

    speakBtn.addEventListener('click', () => {
      const raw = numberInput.value || '0'; const v = validateNumber(raw);
      if(!v.ok){ showFeedback(v.msg,'error'); return; }
      const n = v.n; speakText(`${n} — ${numberToWords(n)}`);
    });

    clearBtn.addEventListener('click', () => {
      numberInput.value = ''; numberBox.textContent = '0';
      imageContainer.innerHTML = '<div class="placeholder">No image yet</div>';
      audioContainer.innerHTML = '<div class="placeholder">No audio yet</div>';
      videoContainer.innerHTML = '<div class="placeholder">No video yet</div>';
      highlightActive(null);
      showFeedback('Cleared.');
    });

    printBtn && printBtn.addEventListener('click', () => window.print());

    /* ---------- input validation ---------- */
    function validateNumber(raw){
      if(raw === '' || raw === null || raw === undefined) return { ok:false, msg:'Please type a number (0–100).' };
      const n = Number(raw);
      if(Number.isNaN(n) || !Number.isInteger(n)) return { ok:false, msg:'Only whole numbers (integers) are accepted.' };
      if(n < 0 || n > 100) return { ok:false, msg:'Please enter a number between 0 and 100 (inclusive).' };
      return { ok:true, n };
    }

    /* ---------- initial placeholders & render list ---------- */
    window.addEventListener('load', () => {
      imageContainer.innerHTML = '<div class="placeholder">No image yet</div>';
      audioContainer.innerHTML = '<div class="placeholder">No audio yet</div>';
      videoContainer.innerHTML = '<div class="placeholder">No video yet</div>';
      numberInput.focus();
      renderNumberList();
    });

    function renderNumberList(){
      // choose table for wide screens, grid for small screens
      if(window.innerWidth >= 760){
        // table
        const table = document.createElement('table');
        table.className = 'number-table';
        const cols = 10;
        for(let r=0; r<=10; r++){
          const tr = document.createElement('tr');
          for(let c=0; c<cols; c++){
            const n = r*cols + c;
            if(n>100) break;
            const td = document.createElement('td');
            td.textContent = n;
            td.dataset.num = n;
            td.addEventListener('click', () => { selectNumber(n); fetchForNumber(n); });
            tr.appendChild(td);
          }
          table.appendChild(tr);
        }
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
      } else {
        // responsive grid
        const grid = document.createElement('div');
        grid.className = 'grid-responsive';
        for(let n=0; n<=100; n++){
          const cell = document.createElement('div');
          cell.className = 'grid-cell';
          cell.textContent = n;
          cell.dataset.num = n;
          cell.addEventListener('click', () => { selectNumber(n); fetchForNumber(n); });
          grid.appendChild(cell);
        }
        tableContainer.innerHTML = '';
        tableContainer.appendChild(grid);
      }
      highlightActive(null);
    }

    window.addEventListener('resize', () => {
      renderNumberList();
    });

// nav (MODIFIED to keep #numberGames visible)
navItems.forEach(li => {
  li.addEventListener('click', () => {
  navItems.forEach(x => x.classList.remove('active'));
  li.classList.add('active');
  const section = li.dataset.section;
  // Hide all section.card elements EXCEPT the one with id 'numberGames'
  document.querySelectorAll('main.content section.card').forEach(s => {
   if (s.id !== 'numberGames') { // Check if the section is NOT the game section
    s.style.display = 'none';
   }
  });

  const target = document.getElementById(section);
  if(target) target.style.display = 'block';
        
        // Ensure the game section is visible if it was hidden by some other initial logic
        const gameSection = document.getElementById('numberGames');
        if (gameSection) gameSection.style.display = 'block';
  });
});

  const startGameBtn = el('startGameBtn');
  const resetGameBtn = el('resetGameBtn');
  const gameQuestion = el('gameQuestion');
  const gameChoices = el('gameChoices');
  const gameScoreEl = el('gameScore');
  const gameTimerEl = el('gameTimer');
  const gameFeedback = el('gameFeedback');

  let score = 0, timer = 30, timerInterval, currentNumber = 0;

  function startGame(){
    score = 0; timer=30; gameScoreEl.textContent=score; gameTimerEl.textContent=timer;
    gameFeedback.textContent=''; startGameBtn.disabled=true; resetGameBtn.disabled=false;
    nextQuestion();
    timerInterval = setInterval(() => { timer--; gameTimerEl.textContent=timer; if(timer<=0) endGame(); },1000);
  }

  function endGame(){
    clearInterval(timerInterval);
    gameFeedback.textContent = `Time's up! Your score: ${score}`;
    gameQuestion.textContent=''; gameChoices.innerHTML='';
    startGameBtn.disabled=false; resetGameBtn.disabled=true;
  }



  function nextQuestion(){
    gameChoices.innerHTML='';
    currentNumber = Math.floor(Math.random()*101);
    const type = Math.random()<0.5 ? 'guess':'sound';

    if(type==='guess'){
    // show number in letters instead of digits
    const numberWord = numberToWords(currentNumber); // use your existing numberToWords()
    gameQuestion.textContent=`Click the correct number for: "${numberWord}"`;
  } else {
    gameQuestion.textContent=`Listen and click the number spoken!`;
    speakText(currentNumber);
  }

    generateOptions(currentNumber).forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent=opt;
      btn.addEventListener('click', ()=>checkAnswer(opt));
      gameChoices.appendChild(btn);
    });
  }

  function generateOptions(correct){
    const options=new Set(); options.add(correct);
    while(options.size<4){ options.add(Math.floor(Math.random()*101)); }
    return Array.from(options).sort(()=>Math.random()-0.5);
  }

  function checkAnswer(selected){
    const buttons = gameChoices.querySelectorAll('button');
    buttons.forEach(b=>b.disabled=true);
    if(selected===currentNumber){
      gameFeedback.textContent='✅ Correct!'; score++; gameScoreEl.textContent=score;
      buttons.forEach(b=>{ if(Number(b.textContent)===currentNumber) b.classList.add('correct'); });
    } else {
      gameFeedback.textContent=`❌ Wrong! Correct number was ${currentNumber}`;
      buttons.forEach(b=>{ if(Number(b.textContent)===currentNumber) b.classList.add('correct'); if(Number(b.textContent)===selected) b.classList.add('wrong'); });
    }
    setTimeout(nextQuestion,1200);
  }

  startGameBtn.addEventListener('click',startGame);
  resetGameBtn.addEventListener('click',endGame);
  resetGameBtn.disabled=true;