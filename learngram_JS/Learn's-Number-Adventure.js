// Test Game JS - Number Match Adventure
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('block-container');
const imgLearn = document.getElementById('img-learn');
const imgBg = document.getElementById('img-bg');
const menuOverlay = document.getElementById('menu-overlay');
const menuTitle = document.getElementById('menu-title');
const menuDesc = document.getElementById('menu-desc');
const menuButtons = document.getElementById('menu-buttons');
const restartBtn = document.getElementById('restart-btn');
const nextStageBtn = document.getElementById('next-stage-btn');
const music = document.getElementById('music');
const targetDisplay = document.getElementById('target-display');
const targetNumberEl = document.getElementById('target-number');
const selectedWordEl = document.getElementById('selected-word');
const carriedLetterEl = document.getElementById('carried-letter');

let audioContext = null;
function initAudioContext(){ if(!audioContext){ audioContext = new (window.AudioContext||window.webkitAudioContext)(); } if(audioContext.state==='suspended') audioContext.resume(); }
document.addEventListener('click', initAudioContext, {once:true});
document.addEventListener('touchstart', initAudioContext, {once:true});

function playTone(freq, type='sine', dur=0.12, delay=0, vol=0.08){ if(!audioContext) initAudioContext(); if(!audioContext) return; const o = audioContext.createOscillator(); const g = audioContext.createGain(); o.connect(g); g.connect(audioContext.destination); o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(0, audioContext.currentTime+delay); g.gain.linearRampToValueAtTime(vol, audioContext.currentTime+delay+0.01); g.gain.linearRampToValueAtTime(0, audioContext.currentTime+delay+dur); o.start(audioContext.currentTime+delay); o.stop(audioContext.currentTime+delay+dur); }
const sounds = {
 correct: ()=>{ playTone(523, 'sine', 0.1); playTone(660, 'sine', 0.12, 0.06); },
 wrong: ()=>{ playTone(200,'sawtooth',0.15); playTone(160,'sawtooth',0.12,0.06); },
 reshuffle: ()=>{ playTone(300,'square',0.05); playTone(250,'square',0.05,0.05); },
 win: ()=>{ // short ascending victory chime
   playTone(523, 'triangle', 0.18, 0, 0.12);
   playTone(659, 'triangle', 0.2, 0.08, 0.14);
   playTone(784, 'triangle', 0.22, 0.16, 0.16);
 },
 lose: ()=>{ // short descending sad tone
   playTone(440, 'sawtooth', 0.18, 0, 0.12);
   playTone(330, 'sawtooth', 0.2, 0.08, 0.1);
   playTone(220, 'sawtooth', 0.22, 0.16, 0.08);
 }
}
function playSound(name){ if(name && sounds[name]) sounds[name](); else if(name && name.tagName==='AUDIO'){ try { name.currentTime=0; name.play().catch(()=>{}); } catch(e){} } }
function stopMusic(){ if(music){ music.pause(); music.currentTime=0; } }

// Number -> words up to 100
const smallNums = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const tens = ['', '', 'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function numberToWords(n){ if(n===100) return 'one hundred'; if(n<20) return smallNums[n]; if(n<100){ const t = Math.floor(n/10); const u = n%10; return u===0 ? tens[t] : tens[t] + ' ' + smallNums[u]; } return String(n); }

let gameState = { isPlaying:false, score:0, time:0, level:'easy', hardStage:1, numbers:[], index:0, targetWord:'', pool:[], selected:[], timerInterval:null, isAnimating:false };

const learnChar = { x:100, y:400, targetX:100, targetY:400, speed:0.1, width:230, height:300 }

function resize(){ const wrapper = document.getElementById('game-wrapper'); canvas.width = wrapper.offsetWidth; canvas.height = wrapper.offsetHeight; const baseWidth = 1100; const scale = Math.min(canvas.width/baseWidth,1); const isMobile = window.innerWidth <= 480; // keep Learn at reasonable size on mobile (shrink further on small screens)
 // On very small screens, allow Learn to shrink more so he fits better with the background image
 const minW = isMobile ? 90 : 160; const minH = isMobile ? 150 : 230;
 learnChar.width = Math.max(160*scale, minW);
 learnChar.height = Math.max(230*scale, minH);
 // additionally cap height so Learn never exceeds ~45% of canvas height on mobile
 if(isMobile){ const maxH = canvas.height * 0.45; if(learnChar.height > maxH) learnChar.height = maxH; }
 const groundY = canvas.height - learnChar.height - 40; learnChar.y = groundY; learnChar.targetY = groundY; // update grid sizing on resize for small screens
 const btnSize = isMobile ? 28 : 48; const cols = Math.min(8, Math.max(3, Math.ceil(gameState.pool.length/2))); container.style.gridTemplateColumns = `repeat(${cols}, ${btnSize}px)`; container.style.width = `${cols * btnSize}px`; container.style.gap = '0'; // emphasize target number on mobile
 if(targetNumberEl){ targetNumberEl.style.fontSize = isMobile ? '72px' : '48px'; targetNumberEl.style.fontWeight = '900'; } }
window.addEventListener('resize', resize); setTimeout(resize, 50);

function returnToMenu(){ gameState.isPlaying=false; clearInterval(gameState.timerInterval); stopMusic(); menuOverlay.classList.remove('hidden'); menuButtons.classList.remove('hidden'); restartBtn.classList.add('hidden'); if(nextStageBtn) nextStageBtn.classList.add('hidden'); container.innerHTML=''; targetDisplay.classList.add('hidden'); carriedLetterEl.classList.add('hidden'); document.getElementById('score').innerText = gameState.score; gameState.hardStage = 1; }

function startGame(difficulty){ menuOverlay.classList.add('hidden'); restartBtn.classList.remove('hidden'); targetDisplay.classList.remove('hidden'); gameState.isPlaying=true; gameState.score=0; gameState.level=difficulty; gameState.hardStage = 1; updateScore(0); playSound(music); setupNumbers(difficulty, 1); startTimer(); showNextNumber(); gameLoop(); }

function formatTime(time){ return time < 10 ? '0' + time : String(time); }
function setupNumbers(level, stage){ let arr=[]; if(level==='easy'){ gameState.time=60; if(stage===1){ for(let i=1;i<=10;i++) arr.push(i); }
else if(stage===2){ for(let i=10;i<=20;i++) arr.push(i); }
}
else if(level==='medium'){ gameState.time=100; if(stage===1){ for(let i=20;i<=30;i++) arr.push(i); }
else if(stage===2){ for(let i=30;i<=40;i++) arr.push(i); }
else if(stage===3){ for(let i=40;i<=50;i++) arr.push(i); }
}
else if(level==='hard'){ gameState.time=200;
  if(stage===1){ for(let i=50;i<=60;i++) arr.push(i); }
  else if(stage===2){ for(let i=60;i<=70;i++) arr.push(i); }
  else if(stage===3){ for(let i=70;i<=80;i++) arr.push(i); }
  else if(stage===4){ for(let i=80;i<=90;i++) arr.push(i); }
  else if(stage===5){ for(let i=90;i<=100;i++) arr.push(i); }
}
// present in random order (no repeats)
shuffleArray(arr);
gameState.numbers = arr; gameState.index=0; document.getElementById('timer').innerText = formatTime(gameState.time); }

function startTimer(){ if(gameState.timerInterval) clearInterval(gameState.timerInterval); document.getElementById('timer').innerText = formatTime(gameState.time); gameState.timerInterval = setInterval(()=>{ if(!gameState.isPlaying) return; gameState.time--; document.getElementById('timer').innerText = formatTime(gameState.time); if(gameState.time<=0) endGame(false); },1000); }

function endGame(win){ gameState.isPlaying=false; clearInterval(gameState.timerInterval); stopMusic(); if(win){ sounds.win(); menuTitle.innerText='YOU WON!'; menuTitle.style.color = "#00ff00ff"; } else { sounds.lose(); menuTitle.innerText='GAME OVER'; menuTitle.style.color = 'red'; } menuOverlay.classList.remove('hidden'); menuButtons.classList.remove('hidden'); restartBtn.classList.add('hidden'); if(nextStageBtn) nextStageBtn.classList.add('hidden'); }

function showNextNumber(){ if(gameState.index >= gameState.numbers.length){ 
  // Check if there's a next stage
  let nextStage = gameState.hardStage + 1;
  let hasNextStage = false;
  let nextMsg = '';
  
  if(gameState.level==='easy' && gameState.hardStage===1){ nextStage = 2; hasNextStage = true; nextMsg = "Get ready for Stage 2: Numbers 10-20!"; }
  else if(gameState.level==='medium' && gameState.hardStage===1){ nextStage = 2; hasNextStage = true; nextMsg = "Get ready for Stage 2: Numbers 30-40!"; }
  else if(gameState.level==='medium' && gameState.hardStage===2){ nextStage = 3; hasNextStage = true; nextMsg = "Get ready for Stage 3: Numbers 40-50!"; }
  else if(gameState.level==='hard' && gameState.hardStage<5){ nextStage = gameState.hardStage + 1; hasNextStage = true; 
    const ranges = ['', '50-60', '60-70', '70-80', '80-90', '90-100'];
    nextMsg = `Get ready for Stage ${nextStage}: Numbers ${ranges[nextStage]}!`;
  }
  
  if(hasNextStage){ triggerStageScreen(nextStage, nextMsg); return; }
  endGame(true); return; 
} const n = gameState.numbers[gameState.index]; const word = numberToWords(n).toUpperCase().replace(/\s+/g,''); gameState.currentNumber = n; gameState.targetWord = word; gameState.selected = []; // show digit in target display
    targetNumberEl.innerText = n; selectedWordEl.innerText = ''; if(targetNumberEl){ const isMobile = window.innerWidth <= 480; targetNumberEl.style.fontSize = isMobile ? '72px' : '48px'; targetNumberEl.style.fontWeight = '900'; }
    renderTarget(); buildPoolFor(word); renderButtons(); }

function renderTarget(){ targetNumberEl.innerText = (gameState.currentNumber !== undefined) ? gameState.currentNumber : gameState.targetWord; selectedWordEl.innerText = gameState.selected.join(''); }

function buildPoolFor(word){ // include the needed letters with counts
 const required = {}; for(const ch of word){ required[ch] = (required[ch]||0)+1; }
 let pool = [];
 Object.keys(required).forEach(ch => { for(let i=0;i<required[ch];i++) pool.push(ch); });
 // add filler letters until target pool size depends on level
 const poolSize = (gameState.level==='easy')?8:(gameState.level==='medium')?16:18;
 const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 while(pool.length < poolSize){ const r = letters[Math.floor(Math.random()*letters.length)]; // avoid adding more of a letter than some limit
 pool.push(r); }
 shuffleArray(pool); gameState.pool = pool; }

function renderButtons(){ container.innerHTML=''; // grid columns adapt with pool length
 const cols = Math.min(8, Math.max(3, Math.ceil(gameState.pool.length/2)));
 const isMobile = window.innerWidth <= 480;
 const btnSize = isMobile ? 28 : 48; // very small on phones
 container.style.gridTemplateColumns = `repeat(${cols}, ${btnSize}px)`;
 container.style.width = `${cols * btnSize}px`;
 container.style.gap = '0';
 container.style.gridAutoFlow = 'column';
 container.style.gridTemplateRows = 'repeat(2, auto)';
 gameState.pool.forEach((letter, i)=>{ const btn = document.createElement('button'); btn.className='letter-btn'; btn.innerText=letter; btn.dataset.index=i; btn.style.margin='0'; btn.style.boxSizing='border-box'; btn.style.width = `${btnSize}px`; btn.style.height = `${btnSize}px`; btn.style.fontSize = isMobile ? '14px' : '18px'; // ensure handler receives the actual button element
    btn.addEventListener('click', (e)=> handleLetterClick(i, e.currentTarget)); container.appendChild(btn); }); }

function handleLetterClick(index, btnEl){ if(!gameState.isPlaying || gameState.isAnimating) return; const letter = gameState.pool[index]; // resolve the actual button element (robust if a child node was clicked)
 const btn = (btnEl && btnEl.tagName && btnEl.tagName.toUpperCase()==='BUTTON') ? btnEl : document.querySelector(`.letter-btn[data-index="${index}"]`);
 const pos = getBlockCenter(index);
 gameState.isAnimating = true;
 // lift button (guard in case btn is missing)
 if(btn) gsap.to(btn, { y:-12, scale:1.05, duration:0.12 });
 // move Learn to block
 moveLearnToBlock(pos.charX, ()=>{
 // show carried letter at learn position
 carryLetter(letter);
 // mark button as used (hide)
 if(btn){ btn.classList.add('selected'); btn.disabled=true; gsap.to(btn, { opacity:0.2, duration:0.15 }); }
 gameState.selected.push(letter);
 selectedWordEl.innerText = gameState.selected.join('');
 gameState.isAnimating = false;
 // Check progress
 checkSelection();
 }); }

function carryLetter(letter){ carriedLetterEl.classList.remove('hidden'); carriedLetterEl.innerText = letter; // position over Learn
 const left = learnChar.x + learnChar.width/2 - 20; const top = learnChar.y - 38; carriedLetterEl.style.left = left + 'px'; carriedLetterEl.style.top = top + 'px'; // small bob animation
 gsap.fromTo(carriedLetterEl, { y: top+4 }, { y: top-4, duration:0.6, repeat:-1, yoyo:true, ease:'sine.inOut' }); }

function clearCarried(){ carriedLetterEl.classList.add('hidden'); carriedLetterEl.innerText=''; gsap.killTweensOf(carriedLetterEl); }

function checkSelection(){ const current = gameState.selected.join(''); const target = gameState.targetWord; if(current === target){ // correct!
 updateScore(10); sounds.correct(); // show a quick animation and advance
 gsap.fromTo(targetNumberEl, {scale:1}, {scale:1.15, duration:0.2, yoyo:true, repeat:1, onComplete:()=>{ gameState.index++; clearCarried(); showNextNumber(); }});
 } else if(!target.startsWith(current)){
 // wrong letter chosen
 sounds.wrong(); // in hard mode -5s and reshuffle
 if(gameState.level==='hard'){ gameState.time = Math.max(0, gameState.time-5); document.getElementById('timer').innerText = formatTime(gameState.time); sounds.reshuffle(); shuffleArray(gameState.pool); renderButtons(); clearCarried(); gameState.selected = []; selectedWordEl.innerText=''; }
 else { // easy/medium just reset selected so player can try again
 // re-enable used buttons and put them back
 const btns = document.querySelectorAll('.letter-btn'); btns.forEach(b=>{ b.disabled=false; b.classList.remove('selected'); gsap.to(b, { opacity:1, duration:0.15 }); }); gameState.selected=[]; selectedWordEl.innerText=''; clearCarried(); }
 }
}

function triggerStageScreen(nextStage, msg){ gameState.isPlaying=false; clearInterval(gameState.timerInterval); stopMusic(); menuOverlay.classList.remove('hidden'); menuButtons.classList.add('hidden'); restartBtn.classList.add('hidden'); if(nextStageBtn) nextStageBtn.classList.remove('hidden'); menuTitle.innerText=`STAGE ${gameState.hardStage} COMPLETE!`; menuTitle.style.color = "var(--blue)"; menuDesc.innerText = msg; gameState.nextStageNum = nextStage; }
function startNextStage(){ gameState.hardStage = gameState.nextStageNum; menuOverlay.classList.add('hidden'); if(nextStageBtn) nextStageBtn.classList.add('hidden'); restartBtn.classList.remove('hidden'); gameState.isPlaying=true; playSound(music); setupNumbers(gameState.level, gameState.hardStage); startTimer(); showNextNumber(); }
function updateScore(points){ gameState.score += points; document.getElementById('score').innerText = gameState.score; }

function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

function getBlockCenter(index){ const btn = document.querySelectorAll('.letter-btn')[index]; if(!btn){ // fallback to current Learn position if button not found
    return { charX: learnChar.x, blockTopY: learnChar.y, blockHeight: 0 };
 }
 const rect = btn.getBoundingClientRect(); const wrapperRect = document.getElementById('game-wrapper').getBoundingClientRect(); const relativeX = rect.left - wrapperRect.left + (rect.width/2) - (learnChar.width/2); const blockTopY = rect.top - wrapperRect.top; return { charX: relativeX, blockTopY, blockHeight: rect.height }; }

function moveLearnToBlock(targetX, cb){ gsap.killTweensOf(learnChar); const distance = Math.abs(learnChar.x - targetX); const duration = Math.max(0.15, distance / (canvas.width * 0.6)); gsap.to(learnChar, { targetX: targetX, duration: duration, ease: 'power1.inOut', onStart: ()=> imgLearn.classList.add('char-move-anim'), onComplete: ()=>{ imgLearn.classList.remove('char-move-anim'); if(cb) cb(); } }); }

function gameLoop(){ if(!gameState.isPlaying){ // draw background for menu
 ctx.clearRect(0,0,canvas.width,canvas.height); if(imgBg.complete && imgBg.naturalHeight!==0) ctx.drawImage(imgBg,0,0,canvas.width,canvas.height); else { ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#27ae60'; ctx.fillRect(0,canvas.height-100,canvas.width,100);} if(imgLearn.style.display!=='none'){ imgLearn.style.position='absolute'; imgLearn.style.left = learnChar.x + 'px'; imgLearn.style.top = learnChar.y + 'px'; imgLearn.style.width = learnChar.width + 'px'; imgLearn.style.height = learnChar.height + 'px'; if(!imgLearn.parentElement || imgLearn.parentElement.id!=='game-wrapper') document.getElementById('game-wrapper').appendChild(imgLearn); imgLearn.style.display='block'; } requestAnimationFrame(gameLoop); return; }

 ctx.clearRect(0,0,canvas.width,canvas.height);
 if(imgBg.complete && imgBg.naturalHeight!==0) ctx.drawImage(imgBg,0,0,canvas.width,canvas.height); else { ctx.fillStyle='#87CEEB'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#27ae60'; ctx.fillRect(0,canvas.height-100,canvas.width,100);} learnChar.x += (learnChar.targetX - learnChar.x) * learnChar.speed; learnChar.y += (learnChar.targetY - learnChar.y) * learnChar.speed; if(imgLearn.complete && imgLearn.naturalHeight!==0){ imgLearn.style.position='absolute'; imgLearn.style.left = learnChar.x + 'px'; imgLearn.style.top = learnChar.y + 'px'; imgLearn.style.width = learnChar.width + 'px'; imgLearn.style.height = learnChar.height + 'px'; if(!imgLearn.parentElement || imgLearn.parentElement.id!=='game-wrapper') document.getElementById('game-wrapper').appendChild(imgLearn); imgLearn.style.display='block'; // also update carried letter position if visible
 if(!carriedLetterEl.classList.contains('hidden')){ const left = learnChar.x + learnChar.width/2 - 20; const top = learnChar.y - 38; carriedLetterEl.style.left = left + 'px'; carriedLetterEl.style.top = top + 'px'; } }
 requestAnimationFrame(gameLoop); }

gameLoop();

// Expose some functions for buttons
window.startGame = startGame;
window.returnToMenu = returnToMenu;
window.startNextStage = startNextStage;