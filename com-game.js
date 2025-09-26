const per_1 = document.querySelector(".per-1");

const startBtn = document.querySelector(".start-button");
const gameResult = document.querySelector(".game-result");
const scoreEl = document.getElementById("game-score");
const gameTimer = document.querySelector(".time-game");
const gamerTime = document.querySelector(".timer-game");
const restartBtn = document.querySelector(".btn-restart");
const restart_container = document.querySelector(".restart-game");
const donateBtn = document.querySelector(".btn-donate");
const donate_container = document.querySelector(".donate-game");
const infoContainer = document.querySelector(".infos-container");
const infoContainer2 = document.querySelector(".infos-container2");


let score = 0;
let gameTimeLeft = 60;
let gametimerInterval;


const sendBtn = document.querySelector(".btn-1");
const sendBtn2 = document.querySelector(".btn-2");
const sendBtn3 = document.querySelector(".btn-3");
const sendBtn4 = document.querySelector(".btn-4");
const sendBtn5 = document.querySelector(".btn-5");
const sendBtn6 = document.querySelector(".btn-6");



const container1 = document.querySelector(".container-1");
const container2 = document.querySelector(".container-2");
const container3 = document.querySelector(".container-3");
const container4 = document.querySelector(".container-4");
const container5 = document.querySelector(".container-5");
const container6 = document.querySelector(".container-6");
const container7 = document.querySelector(".container-7");
const container8 = document.querySelector(".container-8");
const container9 = document.querySelector(".container-9");
const container10 = document.querySelector(".container-10");
const container11 = document.querySelector(".container-11");
const container12 = document.querySelector(".container-12");


let name_1 = "";
let name_2 = "";
let age_1 = "";
let age_2 = "";
let country_1 = "";
let country_2 = "";


const gameData = [
  "Hi, how are you?",
  "Hey, i am fine!",
  "What is your name?",
  `My name is ${name_1}.`,
  `Good, my name is ${name_2}.`,
  "Where are are you from?",
  `I am from ${country_2}.`,
  `Nice, i am from ${country_1}.`,
  `I am ${age_2} years old, how old are you?`,
  `I am ${age_1} years old.`,
  `Nice to meet you, ${name_1}.`,
  `Me too, ${name_2}.`
];




function startGame() {
  startBtn.style.display = "none";
  infoContainer.style.display = "none";
  infoContainer2.style.display = "none";

  function startTimer() {
    gametimerInterval = setInterval(() => {
    gameTimeLeft--;
    gameTimer.innerHTML = `<div class='time-game'>Time left <span class='timer-game green'>: ${gameTimeLeft}</span></div>`;
    if (gameTimeLeft < 10) {
       gameTimer.innerHTML = `<div class='time-game'>Time left <span class='timer-game red'>: 0${gameTimeLeft}</span></div>`;
    }

    if (gameTimeLeft >= 10) {
      gamerTime.classList.add("green");
    }

    if (gameTimeLeft <= 10) {
      gamerTime.classList.add("red");
      
    }
    endGame();

    }, 1000);
  }  
  startTimer();
    
    gameTimer.style.display = "block";
    gameTimer.innerHTML = `<div class='time-game'>Time left <span class='timer-game'>: ${gameTimeLeft}</span></div>`;

    for (let i = 0; i < gameData.length; i++) {   
      setTimeout(() => {
        container1.style.display = "block";
        container1.innerHTML = `<div class='container-1'><p class='per-1'>${gameData[0]}</p></div>`;
      }, 2000);

      setTimeout(() => {
        container2.style.display = "block";
        container2.innerHTML = "<div class='container-2'><input id='per-2' type='text' placeholder='Enter your reply'><button onclick='sendReply();' class='btn-1'>Send</button></div>";
      }, 3000);
    }   
}



function endGame() {
  let timeoutId;

  if (gameTimeLeft <= 0) {
    clearInterval(gametimerInterval);
    timeoutId = setTimeout(() => {
      container1.innerHTML = "";
      container2.innerHTML = "";
      container3.innerHTML = "";
      container4.innerHTML = "";
      container5.innerHTML = "";
      container6.innerHTML = "";
      container7.innerHTML = "";
      container8.innerHTML = "";
      container9.innerHTML = "";
      container10.innerHTML = "";
      container11.innerHTML = "";
      container12.innerHTML = "";
      gameResult.style.display ="block";
      gameResult.innerHTML = `<div class='game-result'>Your score<span class='game-score'> : ${score}/6</span></div>`;
      restart_container.style.display = "block";
      restart_container.innerHTML = `<div class='restart-game'><button class='btn-restart' onclick='restartGame();'>Restart game</button></div>`;
   
      donate_container.style.display = "block";
      donate_container.innerHTML = `
        <div class="donate-game"><button class="btn-donate"><a href="Donate.html" class="text-donate">Donate</a></button></div>
      `;
      
      
      infoContainer.style.display = "block";
      infoContainer.innerHTML =  `<div class='infos-container'>
            <div><p class='infos-text'>Enter your name:<br><input class='name-put' placeholder='Your name'><button class='send-btn' onclick='sendName_1();'>Send</button></p><p class='js-infos'></p></div>

            <div><p class='infos-text'>Enter the name of your friend:<br><input class='name-friend-put' placeholder="Your friend's name"><button class='send-btn' onclick='sendName_2();'>Send</button></p><p class='js-infos2'></p></div>

            <div><p class='infos-text'>Enter the country of your friend:<br><input class='country-friend-put' placeholder="Your friend's country"><button class='send-btn' onclick='sendCountry_2();'>Send</button></p><p class='js-infos3'></p></div>

            <div><p class='infos-text'>Enter your country:<br><input class='country-put' placeholder='Your country'><button class='send-btn' onclick='sendCountry_1();'>Send</button></p><p class='js-infos4'></p></div>
      </div>`;

      infoContainer2.style.display = "block";
      infoContainer2.innerHTML = ` <div class='infos-container2'>
          <div><p class='infos-text'>Enter your age:<br><input class='age-put' placeholder='Your age'><button class='send-btn' onclick='sendAge_1();'>Send</button></p><p class='js-infos5'></p></div>
      
          <div><p class='infos-text'>Enter the age of your friend:<br><input class='age-friend-put' placeholder="Your friend's age"><button class='send-btn' onclick='sendAge_2();'>Send</button></p><p class='js-infos6'></p></div>
      </div>`;
    }, 2000);  
  }
}


function restartGame() {
      gameResult.style.display = "none";
      gameTimeLeft = 60;
      score = 0;
      name_1 = "";
      name_2 = "";
      age_1 = "";
      age_2 = "";
      country_1 = "";
      country_2 = "";
      restart_container.style.display = "none";
      donate_container.style.display = "none";
      startGame(); 
      sendName_1();
      sendName_2();
      sendCountry_2();
      sendCountry_1();
      sendAge_2();
      sendAge_1();
     
}



function sendName_1() {
  let name_1Put = document.querySelector(".name-put").value;
  const info_p = document.querySelector(".js-infos");
  name_1 = name_1Put;
  gameData[3] = `My name is ${name_1}.`;
  gameData[10] = `Nice to meet you, ${name_1}.`;
  info_p.textContent = name_1 + " was added!";
}


function sendName_2() {
  const name_2Put = document.querySelector(".name-friend-put").value;
  const info_p2 = document.querySelector(".js-infos2");
  name_2 = name_2Put;
  gameData[4] = `Good, my name is ${name_2}.`;
  gameData[11] = `Me too, ${name_2}.`;
  info_p2.textContent = name_2 + " was added!";  
}

function sendCountry_2() {
  const country_2Put = document.querySelector(".country-friend-put").value;
  const info_p3 = document.querySelector(".js-infos3");
  country_2 = country_2Put;
  gameData[6] = `I am from ${country_2}.`;
  info_p3.textContent = country_2 + " was added!";
  
}

function sendCountry_1() {
  const country_1Put = document.querySelector(".country-put").value;
  const info_p4 = document.querySelector(".js-infos4");
  country_1 = country_1Put;
  gameData[7] = `Nice, i am from ${country_1}.`;
  info_p4.textContent = country_1 + " was added!";
}


function sendAge_2() {
  const age_2Put = document.querySelector(".age-friend-put").value;
  const info_p6 = document.querySelector(".js-infos6");
  age_2 = age_2Put;
  gameData[8] = `I am ${age_2} years old, how old are you?`;
  info_p6.textContent = age_2 + " was added!";

}

function sendAge_1() {
  const age_1Put = document.querySelector(".age-put").value;
  const info_p5 = document.querySelector(".js-infos5");
  age_1 = age_1Put;
  gameData[9] = `I am ${age_1} years old.`;
  info_p5.textContent = age_1 + " was added!";

}



function sendReply() {
  const per_2 = document.getElementById("per-2").value;

  container2.innerHTML = "<div class='container-2'><input id='per-2' type='text' placeholder='Enter your reply'><button onclick='sendReply();' class='btn-1'>Send</button></div>";
  container2.innerHTML = `<div class='container-2'><p class='per2'>${per_2}</p></div>`; 

  setTimeout(() => {
    container3.style.display = "block";
    container3.innerHTML = `<div class='container-3'><p class='per-1'>What is your name?</p></div>`;
  }, 1000);


  setTimeout(() => {
    container4.style.display = "block";
    container4.innerHTML = "<div class='container-4'><input id='per-3' placeholder='Enter your reply'><button onclick='sendSecondReply();' class='btn-2'>Send</button></div>";
  }, 2000);

  
  if (per_2 === "Hey, i am fine!") {
    score++
    scoreEl.textContent = ": " + score;
    
  } else {
    scoreEl.textContent = ": " + score;
  }

  
}


function sendSecondReply() {
  const per_3 = document.getElementById("per-3").value; 
  
  container4.innerHTML = "<div class='container-4'><input id='per-3' type='text' placeholder='Enter your reply'><button onclick='sendSecondReply();' class='btn-2'>Send</button></div>";
  container4.innerHTML = `<div class='container-4'><p class='per3'>${per_3}</p></div>`;
  
  setTimeout(() => {
    container5.style.display = "block";
    container5.innerHTML = `<div class='container-5'><p class='per-1'>Good, my name is <span class='text-change'>${name_2}</span>.</p></div>`;
  }, 1000);


  setTimeout(() => {
    container6.style.display = "block";
    container6.innerHTML = "<div class='container-6'><input id='per-4' placeholder='Enter your reply'><button onclick='sendThirdReply();' class='btn-3'>Send</button></div>";
  }, 2000);

  if (per_3 === `My name is ${name_1}.`) {
    score++
    scoreEl.textContent = ": " + score;
    
  } else {
    scoreEl.textContent = ": " + score;
  }



}

function sendThirdReply() {
  const per_4 = document.getElementById("per-4").value; 
  
  container6.innerHTML = "<div class='container-6'><input id='per-4' type='text' placeholder='Enter your reply'><button onclick='sendThirdReply();' class='btn-3'>Send</button></div>";
  container6.innerHTML = `<div class='container-6'><p class='per4'>${per_4}</p></div>`;  
  
    setTimeout(() => {
      container7.style.display = "block";
      container7.innerHTML = `<div class='container-7'><p class='per-1'>I am from <span class='text-change'>${country_2}</span>.</p></div>`;
    }, 1000)

    setTimeout(() => {
      container8.style.display = "block";
      container8.innerHTML = "<div class='container-8'><input id='per-5' placeholder='Enter your reply'><button onclick='sendFourthReply();' class='btn-4'>Send</button></div>";
    }, 2000);


  if (per_4 === "Where are you from?") {
    score++
    scoreEl.textContent = ": " + score;
    
  } else {
    scoreEl.textContent = ": " + score;
  }
}

function sendFourthReply() {
  const per_5 = document.getElementById("per-5").value;

  container8.innerHTML = "<div class='container-8'><input id='per-5' type='text' placeholder='Enter your reply'><button onclick='sendFourthReply();' class='btn-4'></button>Send</div>";
  container8.innerHTML = `<div class='container-8'><p class='per5'>${per_5}</p></div>`;

  setTimeout(() => {
    container9.style.display = "block";
    container9.innerHTML = `<div class='container-9'><p class='per-1'>I am <span class='text-change'>${age_2}</span> years old, how old are you?</span></p></div>`;
  }, 1000)

  setTimeout(() => {
    container10.style.display = "block";
    container10.innerHTML = "<div class='container-10'><input id='per-6' placeholder='Enter your reply'><button onclick='sendFifthReply();' class='btn-5'>Send</button></div>";
  }, 2000);


  if (per_5 === `Nice, i am from ${country_1}.`) {
    score++
    scoreEl.textContent = ": " + score;
    
  } else {
    scoreEl.textContent = ": " + score;
  }

 
}

function sendFifthReply() {
  const per_6 = document.getElementById("per-6").value;

  container10.innerHTML = "<div class='container-10'><input id='per-6' type='text' placeholder='Enter your reply'><button onclick='sendFifthReply();' class='btn-5'></button>Send</div>";
  container10.innerHTML = `<div class='container-10'><p class='per6'>${per_6}</p></div>`;

   setTimeout(() => {
      container11.style.display = "block";
      container11.innerHTML = `<div class='container-11'><p class='per-1'>Nice to meet you, <span class='text-change'>${name_1}</span>.</p></div>`;
    }, 1000)

  
    setTimeout(() => {
      container12.style.display = "block";
      container12.innerHTML = "<div class='container-12'><input id='per-7' placeholder='Enter your reply'><button onclick='sendSixthReply();' class='btn-6'>Send</button></div>";
    }, 2000); 

  if (per_6 === `I am ${age_1} years old.`) {
    score++
    scoreEl.textContent = ": " + score;
    
  } else {
    scoreEl.textContent = ": " + score;
  }

 
}

function sendSixthReply() {
  const per_7 = document.getElementById("per-7").value;

  container12.innerHTML = "<div class='container-12'><input id='per-7' type='text' placeholder='Enter your reply'><button onclick='sendSixthReply();' class='btn-6'></button>Send</div>";
  container12.innerHTML = `<div class='container-12'><p class='per7'>${per_7}</p></div>`; 
  if (gameData.length >= gameData.length) {
   clearInterval(gametimerInterval);
   let timeoutId;

    timeoutId = setTimeout(() => {
      container1.innerHTML = "";
      container2.innerHTML = "";
      container3.innerHTML = "";
      container4.innerHTML = "";
      container5.innerHTML = "";
      container6.innerHTML = "";
      container7.innerHTML = "";
      container8.innerHTML = "";
      container9.innerHTML = "";
      container10.innerHTML = "";
      container11.innerHTML = "";
      container12.innerHTML = "";
      gameResult.style.display = "block";
      gameResult.innerHTML = `<div class='game-result'>Your score<span class='game-score'>: ${score}/6</span></div>`;
      restart_container.style.display = "block";
      restart_container.innerHTML = `<div class='restart-game'><button class='btn-restart' onclick='restartGame();'>Restart game</button></div>`;
      donate_container.style.display = "block";
      donate_container.innerHTML = `
          <div class="donate-game"><button class="btn-donate"><a href="Donate.html" class="text-donate">Donate</a></button></div>
      `;
      
      infoContainer.style.display = "block";
      infoContainer.innerHTML = `<div class='infos-container'>
          <div><p class='infos-text'>Enter your name:<br><input class='name-put' placeholder='Your name'><button class='send-btn' onclick='sendName_1();'>Send</button></p><p class='js-infos'></p></div>

          <div><p class='infos-text'>Enter the name of your friend:<br><input class='name-friend-put' placeholder="Your friend's name"><button class='send-btn' onclick='sendName_2();'>Send</button></p><p class='js-infos2'></p></div>

          <div><p class='infos-text'>Enter the country of your friend:<br><input class='country-friend-put' placeholder="Your friend's country"><button class='send-btn' onclick='sendCountry_2();'>Send</button></p><p class='js-infos3'></p></div>

          <div><p class='infos-text'>Enter your country:<br><input class='country-put' placeholder='Your country'><button class='send-btn' onclick='sendCountry_1();'>Send</button></p><p class='js-infos4'></p></div>
     </div>`;
    
      infoContainer2.style.display = "block";
      infoContainer2.innerHTML = ` <div class='infos-container2'>
          <div><p class='infos-text'>Enter your age:<br><input class='age-put' placeholder='Your age'><button class='send-btn' onclick='sendAge_1();'>Send</button></p><p class='js-infos5'></p></div>
      
          <div><p class='infos-text'>Enter the age of your friend:<br><input class='age-friend-put' placeholder="Your friend's age"><button class='send-btn' onclick='sendAge_2();'>Send</button></p><p class='js-infos6'></p></div>
      </div>`;
    }, 2000); 
  }

  if (per_7 === `Me too, ${name_2}.`) {
    score++
    scoreEl.textContent = ": " + score;
    
  } else {
    scoreEl.textContent = ": " + score;
  }
}

   


































