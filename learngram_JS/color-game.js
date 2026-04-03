(() => {
  const el = (id) => document.getElementById(id);
  const worldEl = document.getElementById('world');
  const rowsEl = document.getElementById('rows');
  const playerEl = document.getElementById('player');
  const mamaEl = document.getElementById('mama');
  const menu = document.getElementById('menu-overlay');
  const startBtn = document.getElementById('start-btn');
  const modeButtons = document.querySelectorAll('.difficulty-select .btn-main');
  const scoreEl = el('score');
  const timerEl = el('timer');
  const collectedEl = el('collected');
  const requiredEl = el('required');
  const targetLabel = el('target-label');
  const gameOverEl = document.getElementById('game-over');
  const endDesc = document.getElementById('end-desc');
  const retryBtn = document.getElementById('retry');
  const viewportEl = document.getElementById('viewport');

  // Sound effects
  const sounds = {
    correct: el('sfx-pick-correct'),
    wrong: el('sfx-pick-wrong'),
    success: el('sfx-success'),
    music: el('music')
  };

  // Mute errors gracefully
  Object.values(sounds).forEach(s => {
    if (!s) return;
    s.onerror = () => console.warn('Audio failed to load');
  });

  // Mapping color→fruit
  const colorToFruit = {
    RED: 'APPLE',
    GREEN: 'AVOCADO',
    CONCORD: 'CONCORD_GRAPE',
    ORANGE: 'ORANGE',
    YELLOW: 'BANANA',
    PURPLE: 'PURPLE_GRAPES',
    PINK: 'GRAPEFRUIT',
    BROWN: 'LONGAN',
    BLACK: 'BLACK_RADISH',
    WHITE: 'WHITE_PEACH',
    TEAL: 'HUCKLEBERRIES',
    GOLD: 'QUINCE',
    BEIGE: 'BEIGE_CAULIFLOWER',
    OLIVE: 'OLIVES',
    MAROON: 'PLUM',
    CORAL: 'PERSIMMON',
    INDIGO: 'EGGPLANT'
  };

  const fruitAssets = Object.fromEntries(
    Object.values(colorToFruit).map(name => [name, `images/fruits/${name.toLowerCase()}.svg`])
  );

  let state = {
    mode: 'easy',
    required: 5,
    time: 45,
    score: 0,
    collected: 0,
    timerId: null,
    playerX: 40,
    worldWidth: 3000,
    viewportWidth: null,
    rows: [],
    currentTarget: null,
    targetsQueue: [],
    running: false,
    viewportOffsetX: 0
  };

  // ===== Sound management =====
  function playSound(type) {
    if (!sounds[type]) return;
    try {
      sounds[type].currentTime = 0;
      sounds[type].play().catch(() => {});
    } catch (e) {}
  }

  // ===== Animation helpers =====
  function animateScorePop(x, y) {
    const pop = document.createElement('div');
    pop.textContent = '+10';
    pop.className = 'score-pop';
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    viewportEl.appendChild(pop);

    gsap.to(pop, {
      y: -60,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      onComplete: () => pop.remove()
    });
  }

  function animatePlayerPickup() {
    gsap.to(playerEl, {
      scale: 1.1,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  }

  function animateTargetChange() {
    const label = targetLabel;
    gsap.to(label, {
      scale: 1.15,
      duration: 0.3,
      ease: 'back.out',
      onComplete: () => {
        gsap.to(label, { scale: 1, duration: 0.2 });
      }
    });
  }

  function animateMamaFadeOut() {
    gsap.to(mamaEl, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut'
    });
  }

  function wobblePlayer() {
    gsap.to(playerEl, {
      rotation: -3,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut'
    });
  }

  // ===== Game state =====
  function chooseMode(mode) {
    if (mode === 'easy') {
      state.required = 5;
      state.time = 45;
    }
    if (mode === 'medium') {
      state.required = 7;
      state.time = 60;
    }
    if (mode === 'hard') {
      state.required = 10;
      state.time = 120;
    }
    state.mode = mode;
    requiredEl.textContent = state.required;
    document.getElementById('start-btn').classList.remove('hidden');
  }

  modeButtons.forEach(b => {
    b.addEventListener('click', (e) => {
      modeButtons.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      chooseMode(b.dataset.mode);
    });
  });

  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', () => location.reload());

  // Keyboard movement
  const keys = { left: false, right: false };
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  });

  // ===== Main game flow =====
  function startGame() {
    menu.classList.add('hidden');
    state.running = true;
    state.score = 0;
    state.collected = 0;
    scoreEl.textContent = '0';
    collectedEl.textContent = '0';
    state.viewportWidth = viewportEl.clientWidth;
    state.worldWidth = 3000;

    // Reset player position
    state.playerX = 40;
    state.viewportOffsetX = 0;
    playerEl.style.left = state.playerX + 'px';
    worldEl.style.transform = 'translateX(0)';

    // Fade mama back in for visibility
    mamaEl.style.opacity = '1';

    buildTargetsQueue();
    generateRows(state.required + 6);
    setTargetFromQueue();
    startTimer();
    requestAnimationFrame(gameLoop);

    // Play music
    try {
      sounds.music.play().catch(() => {});
    } catch (e) {}
  }

  function buildTargetsQueue() {
    const fruits = Object.values(colorToFruit);
    const pool = [...fruits];
    state.targetsQueue = [];

    while (state.targetsQueue.length < state.required) {
      const idx = Math.floor(Math.random() * pool.length);
      state.targetsQueue.push(pool.splice(idx, 1)[0]);
      if (pool.length === 0) pool.push(...fruits);
    }
  }

  function setTargetFromQueue() {
    state.currentTarget = state.targetsQueue.shift() || null;
    const displayName = state.currentTarget
      ? state.currentTarget.replace(/_/g, ' ')
      : '-';
    targetLabel.textContent = displayName;
    if (state.running) animateTargetChange();
  }

  function generateRows(count) {
    rowsEl.innerHTML = '';
    state.rows = [];
    const spacing = Math.floor((state.worldWidth - 600) / Math.max(1, count));

    for (let i = 0; i < count; i++) {
      const x = 300 + i * spacing + (Math.random() * 80 - 40);
      const row = document.createElement('div');
      row.className = 'row';
      row.style.left = x + 'px';
      row.dataset.x = x;

      const options = chooseRowFruits();
      options.forEach((f, idx) => {
        const img = document.createElement('img');
        img.src = fruitAssets[f] || 'images/fruits/placeholder.svg';
        img.dataset.fruit = f;
        img.addEventListener('click', () => tryPick(row, idx));
        row.appendChild(img);
      });

      rowsEl.appendChild(row);
      state.rows.push({ el: row, x, picked: false, fruits: options });
    }
  }

  function chooseRowFruits() {
    const fruits = Object.values(colorToFruit);
    let options = [];
    const target =
      state.currentTarget || fruits[Math.floor(Math.random() * fruits.length)];

    options.push(target);
    while (options.length < 3) {
      const candidate = fruits[Math.floor(Math.random() * fruits.length)];
      if (!options.includes(candidate)) options.push(candidate);
    }

    // Shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
  }

  function tryPick(rowEl, idx) {
    const row = state.rows.find(r => r.el === rowEl);
    if (!row || row.picked) return;

    const fruitEls = Array.from(row.el.querySelectorAll('img'));
    const fruitEl = fruitEls[idx];
    const rowX = parseFloat(row.el.dataset.x);
    const itemOffset = (idx - 1) * 90;
    const fruitWorldX = rowX + itemOffset;

    // Check proximity
    if (Math.abs(state.playerX - fruitWorldX) > 180) {
      return;
    }

    row.picked = true;
    fruitEls.forEach(i => i.classList.add('disabled'));
    const pickedFruit = fruitEl.dataset.fruit;

    animatePlayerPickup();

    if (pickedFruit === state.currentTarget) {
      // Correct pick!
      state.score += 10;
      state.collected += 1;
      scoreEl.textContent = state.score;
      collectedEl.textContent = state.collected;

      playSound('correct');

      // Animate the fruit
      fruitEl.classList.add('correct');
      gsap.to(fruitEl, {
        scale: 0.7,
        y: -60,
        opacity: 0,
        duration: 0.5,
        ease: 'back.in',
        onComplete: () => {
          fruitEl.style.opacity = '0';
        }
      });

      // Score pop
      const rect = fruitEl.getBoundingClientRect();
      const viewRect = viewportEl.getBoundingClientRect();
      animateScorePop(rect.left - viewRect.left, rect.top - viewRect.top);

      setTargetFromQueue();

      if (state.collected >= state.required) {
        return finishGame(true);
      }
    } else {
      // Wrong pick!
      playSound('wrong');
      wobblePlayer();

      if (state.mode === 'hard') {
        state.time = Math.max(0, state.time - 5);
        timerEl.textContent = state.time;

        // Reshuffle
        const newFruits = chooseRowFruits();
        row.fruits = newFruits;
        const imgs = row.el.querySelectorAll('img');
        imgs.forEach((im, i) => {
          im.src = fruitAssets[newFruits[i]] || im.src;
          im.dataset.fruit = newFruits[i];
        });
        row.picked = false;
        imgs.forEach(i => i.classList.remove('disabled'));
      }
    }
  }

  function startTimer() {
    timerEl.textContent = state.time;
    if (state.timerId) clearInterval(state.timerId);

    state.timerId = setInterval(() => {
      if (!state.running) return;
      state.time -= 1;
      timerEl.textContent = state.time;

      if (state.time <= 0) {
        clearInterval(state.timerId);
        finishGame(false);
      }
    }, 1000);
  }

  function finishGame(success) {
    state.running = false;
    try {
      sounds.music.pause();
    } catch (e) {}

    if (success) {
      playSound('success');
      document.getElementById('end-title').textContent = '🎉 You did it!';
      endDesc.textContent = `You fetched ${state.collected} fruits and scored ${state.score}! Nice work!`;
    } else {
      document.getElementById('end-title').textContent = '⏰ Time!';
      endDesc.textContent = `You fetched ${state.collected} fruits and scored ${state.score}. Try again!`;
    }

    gsap.to(gameOverEl, {
      opacity: 1,
      duration: 0.3,
      onStart: () => gameOverEl.classList.remove('hidden')
    });
  }

  function updateWorldPosition() {
    const center = state.viewportWidth / 2;
    state.playerX = Math.max(40, Math.min(state.worldWidth - 60, state.playerX));

    let shift = 0;
    if (state.playerX > center) {
      shift = Math.min(state.playerX - center, state.worldWidth - state.viewportWidth);
    }

    state.viewportOffsetX = -shift;
    worldEl.style.transform = `translateX(${state.viewportOffsetX}px)`;
    playerEl.style.left = state.playerX + 'px';

    // Mama disappears when player moves past x=250
    if (state.playerX > 250 && mamaEl.style.opacity !== '0') {
      animateMamaFadeOut();
    } else if (state.playerX <= 250 && mamaEl.style.opacity === '0') {
      gsap.to(mamaEl, { opacity: 1, duration: 0.4 });
    }
  }

  function gameLoop() {
    if (!state.running) return;

    const speed = 6;
    if (keys.left) state.playerX -= speed;
    if (keys.right) state.playerX += speed;

    updateWorldPosition();
    requestAnimationFrame(gameLoop);
  }

  // Debug helper
  window.__learnColorGame = { state, playSound, animateScorePop };

  // UI wiring
  chooseMode('easy');
  modeButtons.forEach(b =>
    b.addEventListener('click', () => startBtn.classList.remove('hidden'))
  );
})();
