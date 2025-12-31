    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('block-container');
    const imgLearn = document.getElementById('img-learn');
    const imgBg = document.getElementById('img-bg');
    
    // Menu Elements
    const menuOverlay = document.getElementById('menu-overlay');
    const menuTitle = document.getElementById('menu-title');
    const menuDesc = document.getElementById('menu-desc');
    const menuButtons = document.getElementById('menu-buttons');
    const nextStageBtn = document.getElementById('next-stage-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    // --- Audio Elements ---
    const music = document.getElementById('music');
    
    // Web Audio API Context for sound effects
    let audioContext = null;
    
    // Initialize audio context (requires user interaction)
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
    
    // Initialize audio on first user interaction
    document.addEventListener('click', initAudioContext, { once: true });
    document.addEventListener('touchstart', initAudioContext, { once: true });
    
    // Helper function to play a tone
    function playTone(frequency, type, duration, delay = 0, volume = 0.1) {
        if (!audioContext) {
            initAudioContext();
            if (!audioContext) return;
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + delay + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + delay + duration);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + duration);
    }
    
    // Sound effect functions
    const soundEffects = {
        success: () => {
            // Pleasant ascending chime
            playTone(523.25, 'sine', 0.1, 0, 0.15); // C5
            playTone(659.25, 'sine', 0.15, 0.05, 0.15); // E5
            playTone(783.99, 'sine', 0.2, 0.1, 0.15); // G5
        },
        wrong: () => {
            // Harsh descending buzz
            playTone(220, 'sawtooth', 0.15, 0, 0.12);
            playTone(180, 'sawtooth', 0.2, 0.05, 0.1);
        },
        reshuffle: () => {
            // Quick shuffle sound
            playTone(300, 'square', 0.05, 0, 0.1);
            playTone(250, 'square', 0.05, 0.05, 0.1);
            playTone(200, 'square', 0.05, 0.1, 0.1);
        },
        win: () => {
            // Victory fanfare
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, i) => {
                playTone(freq, 'triangle', 0.3, i * 0.1, 0.15);
            });
        },
        loss: () => {
            // Sad descending tone
            if (!audioContext) {
                initAudioContext();
                if (!audioContext) return;
            }
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.6);
            
            gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.6);
        },
        swapCorrect: () => {
            // Pleasant "whoosh" sound with ascending tones for correct swap
            playTone(400, 'sine', 0.15, 0, 0.1);
            playTone(500, 'sine', 0.15, 0.05, 0.12);
            playTone(600, 'sine', 0.2, 0.1, 0.1);
        },
        swapWrong: () => {
            // Harsh "thud" sound with descending tones for wrong swap
            playTone(250, 'sawtooth', 0.2, 0, 0.12);
            playTone(200, 'sawtooth', 0.25, 0.05, 0.1);
        }
    };
    
    // Helper function to play a sound effect
    function playSound(soundName) {
        if (typeof soundName === 'string' && soundEffects[soundName]) {
            soundEffects[soundName]();
        } else if (soundName && soundName.tagName === 'AUDIO') {
            // Fallback for background music (HTML audio element)
            try {
                soundName.currentTime = 0;
                soundName.play().catch(e => {
                    // Silently fail if audio file doesn't exist
                    console.log("Background music not available");
                });
            } catch (e) {
                console.log("Audio playback failed:", e);
            }
        }
    }
    
    // Helper function to stop music
    function stopMusic() {
        if (music) {
            music.pause();
            music.currentTime = 0;
        }
    }

    // RAINBOW COLORS
    const rainbowColors = [
        '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', 
        '#1abc9c', '#f39c12', '#95a5a6', '#c0392b'
    ];
    let isAnimating = false;

    let gameState = {
        isPlaying: false, 
        score: 0, 
        time: 0, 
        level: 'easy',
        hardStage: 1, // 1 or 2
        letters: [], 
        target: [], 
        selectedIdx: null, 
        timerInterval: null
    };

    // --- CHARACTER PHYSICS (Tall Dimensions) ---
    const learnChar = {
        x: 100,
        y: 400,
        targetX: 100,
        targetY: 400,
        speed: 0.1, 
        width: 190, 
        height: 250, 
        state: 'idle'
    };

    

    function resize() {
        const wrapper = document.getElementById('game-wrapper');
        canvas.width = wrapper.offsetWidth;
        canvas.height = wrapper.offsetHeight;
        
        // Responsive character sizing based on canvas dimensions
        // Base dimensions: 190x250 for 1100px width
        const baseWidth = 1100;
        const scaleFactor = Math.min(canvas.width / baseWidth, 1);
        
        // Scale character size, but ensure minimum size for very small screens
        learnChar.width = Math.max(190 * scaleFactor, 120);
        learnChar.height = Math.max(250 * scaleFactor, 160);
        
        // Adjust character position if it's off-screen
        if (learnChar.x + learnChar.width > canvas.width) {
            learnChar.x = Math.max(0, canvas.width - learnChar.width);
            learnChar.targetX = learnChar.x;
        }
        
        // Feet position
        const groundLevelY = canvas.height - learnChar.height - 50; 
        learnChar.y = groundLevelY;
        learnChar.targetY = groundLevelY;
    }
    window.addEventListener('resize', resize);
    setTimeout(resize, 100); 

    function returnToMenu() {
        gameState.isPlaying = false;
        clearInterval(gameState.timerInterval);
        stopMusic(); // Stop music on returning to menu
        
        // Reset Visuals
        menuOverlay.classList.remove('hidden');
        menuTitle.innerText = "Garden Sort";
        menuTitle.style.color = "var(--blue-dark)";
        menuDesc.innerText = "Help Learn organize the alphabet blocks! Sort them into A-Z order.";
        menuButtons.classList.remove('hidden');
        nextStageBtn.classList.add('hidden');
        restartBtn.classList.add('hidden');
        
        // Remove blocks
        container.innerHTML = '';
        // Remove Learn from DOM if appended
        if(imgLearn.parentElement === document.getElementById('game-wrapper')) {
            imgLearn.style.display = 'none';
        }
    }

    function startGame(difficulty) {
        menuOverlay.classList.add('hidden');
        restartBtn.classList.remove('hidden');
        gameState.isPlaying = true;
        gameState.score = 0;
        gameState.level = difficulty;
        gameState.hardStage = 1; // Always start at stage 1
        updateScore(0);
        
        // Start background music
        playSound(music); // Try to play background music (if file exists) 

        setupLevel(difficulty, 1);
        
        startTimer();
        gameLoop();
    }

    function setupLevel(difficulty, stage) {
        let charCount = 6;
        let timeLimit = 30;

        if (difficulty === 'easy') { 
            timeLimit = 30; charCount = 6; 
        } else if (difficulty === 'medium') { 
            timeLimit = 45; charCount = 14;
        } else if (difficulty === 'hard') {
            if (stage === 1) {
                timeLimit = 60; charCount = 14; // A-N (60s as requested)
            } else {
                timeLimit = 60; charCount = 26; // A-Z (60s as requested)
            }
        }

        gameState.time = timeLimit;

        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        gameState.target = alphabet.slice(0, charCount);
        gameState.letters = [...gameState.target];

        shuffleArray(gameState.letters);
        while(JSON.stringify(gameState.letters) === JSON.stringify(gameState.target)){
            shuffleArray(gameState.letters);
        }
        renderButtons();
    }

    function startStage2() {
        gameState.hardStage = 2;
        menuOverlay.classList.add('hidden');
        gameState.isPlaying = true;
        
        // Resume music
        playSound(music); // Try to play background music (if file exists)
        
        setupLevel('hard', 2);
        startTimer();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // ⭐️ NEW: Helper function to format time with leading zero
    function formatTime(time) {
        return time < 10 ? '0' + time : time;
    }

    function startTimer() {
        // Use the new formatTime function immediately
        document.getElementById('timer').innerText = formatTime(gameState.time);
        if(gameState.timerInterval) clearInterval(gameState.timerInterval);
        gameState.timerInterval = setInterval(() => {
            if(!gameState.isPlaying) return;
            gameState.time--;
            // Use the new formatTime function inside the interval
            document.getElementById('timer').innerText = formatTime(gameState.time);
            if (gameState.time <= 0) endGame(false);
        }, 1000);
    }

    function endGame(win) {
        gameState.isPlaying = false;
        clearInterval(gameState.timerInterval);
        stopMusic(); // Stop music
        
        if (win) {
            playSound('win'); // Play win sound
        } else {
            playSound('loss'); // Play loss sound
        }
        
        menuOverlay.classList.remove('hidden');
        menuButtons.classList.remove('hidden'); // Show difficulty buttons again
        nextStageBtn.classList.add('hidden');
        restartBtn.classList.add('hidden');

        if(win) {
            menuTitle.innerText = "YOU WON!"; 
            menuTitle.style.color = "var(--correct)";
            menuDesc.innerText = `Great job sorting! Final Score: ${gameState.score}`;
        } else {
            menuTitle.innerText = "GAME OVER"; 
            menuTitle.style.color = "var(--wrong)";
            menuDesc.innerText = "Time ran out! Try again.";
        }
    }

    function triggerStage2Screen() {
        gameState.isPlaying = false;
        clearInterval(gameState.timerInterval);
        stopMusic(); // Pause music for transition
        
        menuOverlay.classList.remove('hidden');
        menuButtons.classList.add('hidden'); // Hide difficulty select
        nextStageBtn.classList.remove('hidden'); // Show Stage 2 button
        
        menuTitle.innerText = "STAGE 1 COMPLETE!";
        menuTitle.style.color = "var(--blue)";
        menuDesc.innerText = "Get ready for the ultimate challenge: Sort the entire Alphabet!";
    }

    function updateScore(points) {
        gameState.score += points;
        document.getElementById('score').innerText = gameState.score;
    }
    
    // 🎯 UPDATED: Apply a time penalty and visually update the timer
    function applyTimePenalty(seconds) {
        gameState.time = Math.max(0, gameState.time - seconds);
        // Use the new formatTime function for the penalty update
        document.getElementById('timer').innerText = formatTime(gameState.time);
        
        // Flash and shake the timer red for feedback
        const timerElement = document.getElementById('timer');
        gsap.to(timerElement, { 
            color: 'red', 
            scale: 1.5, 
            x: 5, // Shake
            duration: 0.1, 
            repeat: 3, 
            yoyo: true, 
            onComplete: () => gsap.set(timerElement, { color: 'var(--blue-dark)', scale: 1, x: 0 })
        });
    }


    function renderButtons() {
        container.innerHTML = '';
        
        // 🎯 Determine layout based on number of letters (2-ROW TABLE LAYOUT)
        const numLetters = gameState.letters.length;
        container.classList.remove('layout-13', 'layout-14', 'layout-26'); // Clear previous layouts

        if (numLetters === 13) {
            // For 13 letters (Medium) -> 7 columns × 2 rows
            container.classList.add('layout-13');
        } else if (numLetters === 14) {
            // For 14 letters (Hard Stage 1) -> 7 columns × 2 rows
            container.classList.add('layout-14');
        } else if (numLetters === 26) {
            // For 26 letters (Hard Stage 2) -> 13 columns × 2 rows
            container.classList.add('layout-26');
        }
        // If 6 letters (Easy mode), it defaults to 3 columns × 2 rows based on base CSS

        gameState.letters.forEach((letter, index) => {
            const btn = document.createElement('button');
            btn.className = 'letter-btn';
            btn.innerText = letter;
            btn.dataset.index = index;
            
            // Dynamic sizing is now handled by the CSS classes (e.g., #block-container.layout-26 .letter-btn)

            const color = rainbowColors[index % rainbowColors.length];
            btn.style.backgroundColor = color;
            
            btn.onclick = (e) => handleBlockClick(index, e.target);
            container.appendChild(btn);
        });
    }

    function getBlockCenter(index) {
        const total = gameState.letters.length;
        const containerWidth = container.offsetWidth;
        
        const btn = document.querySelectorAll('.letter-btn')[index];
        const rect = btn.getBoundingClientRect();
        
        // Calculate X relative to the game wrapper for Learn
        const wrapperRect = document.getElementById('game-wrapper').getBoundingClientRect();
        
        // X position where Learn's center aligns with the block's center
        const relativeX = rect.left - wrapperRect.left + (rect.width/2) - (learnChar.width/2);
        
        // Y position of the block's top edge (useful for lifting blocks)
        const blockTopY = rect.top - wrapperRect.top; 

        return {
            charX: relativeX, 
            blockTopY: blockTopY,
            blockHeight: rect.height
        };
    }

    // ⭐ UPDATED: Learn moves to the FIRST clicked block (idx1) to pick it up.
    function handleBlockClick(index, btnElement) {
        if (!gameState.isPlaying || isAnimating) return;

        if (gameState.selectedIdx === index) {
            gameState.selectedIdx = null;
            gsap.to(btnElement, { y: 0, scale: 1, duration: 0.2 });
            btnElement.classList.remove('selected');
            return;
        }

        const pos = getBlockCenter(index);
        
        if (gameState.selectedIdx === null) {
            // First click: Select block and move Learn to it.
            gameState.selectedIdx = index;
            btnElement.classList.add('selected');
            gsap.to(btnElement, { y: -10, scale: 1.1, duration: 0.2 });
            moveLearnToBlock(pos.charX);
        } else {
            // Second click: Initiate swap. 
            const idx1 = gameState.selectedIdx;
            const idx2 = index;
            
            // Get the position of the FIRST clicked block (idx1) for the character to pick it up
            const pos1 = getBlockCenter(idx1);

            // Move Learn to the position of the FIRST block (idx1) before swapping
            moveLearnToBlock(pos1.charX, () => {
                performSwap(idx1, idx2);
            });
            
            gameState.selectedIdx = null; // Clear selection immediately
        }
    }

    // 🏆 HYPER-REALISTIC performSwap for "Pick Up, Carry, Drop" Animation 🏆
    function performSwap(idx1, idx2) {
        isAnimating = true;
        
        const btns = document.querySelectorAll('.letter-btn');
        const btn1 = btns[idx1]; // Block to be picked up
        const btn2 = btns[idx2]; // Block to slide

        btn1.classList.remove('selected'); 
        
        // Get visual positions to calculate relative movement
        const btn1Rect = btn1.getBoundingClientRect();
        const btn2Rect = btn2.getBoundingClientRect();
        
        // --- Calculate movements relative to the DOM positions ---
        const visualDistX = btn2Rect.left - btn1Rect.left; // Distance between the two blocks
        
        // Lift height: Ensure the block lifts far above the character's head
        const liftY = -(learnChar.height + 20); 
        
        // Character target positions
        const charX1 = learnChar.targetX; // Where Learn currently is (idx1 position)
        const charX2 = getBlockCenter(idx2).charX; // Where Learn needs to end (idx2 position)

        // GSAP Timeline
        const tl = gsap.timeline({
            defaults: { duration: 0.4, ease: "power2.inOut" },
            onStart: () => {
                imgLearn.classList.add('char-carry-anim');
                // Ensure Learn is precisely over the first block for pick-up
                learnChar.x = charX1; 
            },
            onComplete: () => finishSwap(idx1, idx2)
        });

        const carryDuration = 0.8; // Duration of the walk/carry phase

        // 1. Lift Block 1 up quickly (Picks up)
        tl.to(btn1, { y: liftY, scale: 1.1, zIndex: 100, rotation: 5, duration: 0.25, ease: "power3.out" }, 0)
        
        // 2. Simultaneous Movement (The "Carry" phase)
        // A. Learn moves to the destination (idx2)
          .to(learnChar, { targetX: charX2, duration: carryDuration, ease: "power2.inOut" }, 0.25) 
        
        // B. Block 1 moves with Learn (It's offset by the distance Learn moves)
          .to(btn1, { x: visualDistX, rotation: -5, duration: carryDuration, ease: "power2.inOut" }, 0.25)
          
        // C. Block 2 slides to the origin (idx1)
          .to(btn2, { x: -visualDistX, duration: carryDuration, ease: "power2.inOut" }, 0.25)
          
        // 3. Drop Block 1 into Block 2's spot (Drops it)
          .to(btn1, { y: 0, scale: 1, rotation: 0, duration: 0.35, ease: "bounce.out" }, carryDuration + 0.25) 

        // 4. Cleanup and Reset
          .set(imgLearn, { onComplete: () => imgLearn.classList.remove('char-carry-anim') }, carryDuration + 0.6)
          .set(btn1, { clearProps: "x,y,scale,rotation,zIndex" }, carryDuration + 0.6)
          .set(btn2, { clearProps: "x,y,scale,rotation" }, carryDuration + 0.6);
    }


    function moveLearnToBlock(targetX, onCompleteCallback) {
        gsap.killTweensOf(learnChar);
        const distance = Math.abs(learnChar.x - targetX);
        const duration = distance / (canvas.width * 0.8); 

        gsap.to(learnChar, { 
            targetX: targetX, 
            duration: duration, 
            ease: "power1.inOut",
            onStart: () => imgLearn.classList.add('char-move-anim'),
            onComplete: () => {
                imgLearn.classList.remove('char-move-anim');
                if (onCompleteCallback) onCompleteCallback();
            }
        });
    }

    function finishSwap(idx1, idx2) {
        // Data Swap
        [gameState.letters[idx1], gameState.letters[idx2]] = [gameState.letters[idx2], gameState.letters[idx1]];
        
        // Re-render immediately after data swap to reflect new state
        renderButtons();
        
        const correct1 = gameState.letters[idx1] === gameState.target[idx1];
        const correct2 = gameState.letters[idx2] === gameState.target[idx2];

        if (correct1 || correct2) {
            updateScore(10); 
            playSound('swapCorrect'); // Play correct swap sound
        } else {
            // Wrong move feedback
            playSound('swapWrong'); // Play wrong swap sound
            const btns = document.querySelectorAll('.letter-btn');
            // Animate shake on wrong move (re-query elements after renderButtons)
            gsap.fromTo([btns[idx1], btns[idx2]], {x:-5}, {x:5, duration:0.1, repeat:3, yoyo:true, overwrite: true});
        }

        // 🎯 HARD MODE PENALTY: Deduct 5 seconds and reshuffle on a fully incorrect swap
        if (gameState.level === 'hard' && !correct1 && !correct2) {
            // Apply time penalty (Minus 5 seconds)
            applyTimePenalty(5); 

            // Hop penalty and shuffle
            learnChar.targetY -= 30;
            playSound('reshuffle'); // Play reshuffle sound
            setTimeout(() => { 
                learnChar.targetY += 30; 
                shuffleArray(gameState.letters);
                renderButtons();
            }, 500);
        }

        isAnimating = false;
        checkWin();
    }

    function checkWin() {
        if (gameState.letters.join('') === gameState.target.join('')) {
            // Win Condition Met
            if (gameState.level === 'hard' && gameState.hardStage === 1) {
                setTimeout(triggerStage2Screen, 500);
            } else {
                // Final win condition
                setTimeout(() => endGame(true), 500);
            }
        }
    }

    function gameLoop() {
        if (!gameState.isPlaying) {
             // Keep drawing background and Learn in the menu screen
             ctx.clearRect(0, 0, canvas.width, canvas.height);
             if (imgBg.complete && imgBg.naturalHeight !== 0) {
                 ctx.drawImage(imgBg, 0, 0, canvas.width, canvas.height);
             } else {
                 ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, canvas.width, canvas.height);
                 ctx.fillStyle = "#27ae60"; ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
             }
             if (imgLearn.style.display !== 'none') {
                 // Update Learn's position only for display purposes in menu/game end
                 imgLearn.style.position = 'absolute';
                 imgLearn.style.left = learnChar.x + 'px';
                 imgLearn.style.top = learnChar.y + 'px';
                 imgLearn.style.width = learnChar.width + 'px';
                 imgLearn.style.height = learnChar.height + 'px';
             }
             requestAnimationFrame(gameLoop);
             return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // BG
        if (imgBg.complete && imgBg.naturalHeight !== 0) {
            ctx.drawImage(imgBg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#27ae60"; ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
        }

        // Physics
        learnChar.x += (learnChar.targetX - learnChar.x) * learnChar.speed;
        learnChar.y += (learnChar.targetY - learnChar.y) * learnChar.speed;

        // Draw Learn (using the image element placed in the DOM for easy GSAP animation)
        if (imgLearn.complete && imgLearn.naturalHeight !== 0) {
            imgLearn.style.position = 'absolute';
            imgLearn.style.left = learnChar.x + 'px';
            imgLearn.style.top = learnChar.y + 'px';
            imgLearn.style.width = learnChar.width + 'px';
            imgLearn.style.height = learnChar.height + 'px';
            
            if (!imgLearn.parentElement || imgLearn.parentElement.id !== 'game-wrapper') {
                document.getElementById('game-wrapper').appendChild(imgLearn);
            }
            imgLearn.style.display = 'block';
        } else {
            // Fallback
            ctx.fillStyle = "#e67e22";
            ctx.fillRect(learnChar.x, learnChar.y, learnChar.width, learnChar.height);
        }

        requestAnimationFrame(gameLoop);
    }
    
    // Start the game loop once to handle background and character movement
    gameLoop(); 