const quizData = [
  {
    question: "Which letter of the alphabet is it when you listen the audio?",
    audio: "<audio class='alp-sound' controls><source src='Audio/H-audio.m4a'></audio>",
    options: ["A", "H", "G", "R"],
    answer: "H"
  },
  {
    question: "Which letter of the alphabet is it when you listen the audio?",
    audio: "<audio class='alp-sound' controls><source src='Audio/S-audio.m4a'></audio>",
    options: ["B", "O", "Y", "S"],
    answer: "S"
  },
  {
    question: "Which letter of the alphabet is it when you listen the audio?",
    audio: "<audio class='alp-sound' controls><source src='Audio/K-audio.m4a'></audio>",
    options: ["N", "W", "K", "T",],
    answer: "K"
  },
  {
    question: "Which letter of the alphabet is it when you listen the audio?",
    audio: "<audio class='alp-sound' controls><source src='Audio/Z-audio.m4a'></audio>",
    options: ["Z", "F", "U", "Q",],
    answer: "Z"
  },
  {
    question: "Which letter of the alphabet is it when you listen the audio?",
    audio: "<audio class='alp-sound' controls><source src='Audio/R-audio.m4a'></audio>",
    options: ["V", "R", "O", "J",],
    answer: "R"
  },
  {
    question: "Which letter of the alphabet is it when you listen the audio?",
    audio: "<audio class='alp-sound' controls><source src='Audio/G-audio.m4a'></audio>",
    options: ["Y", "Q", "I", "G",],
    answer: "G"
  },
  {
    question: "Which letter of the alphabet is it when you listen the audio?",
    audio: "<audio class='alp-sound' controls><source src='Audio/X-audio.m4a'></audio>",
    options: ["X", "J", "E", "A",],
    answer: "X"
  },
  {
    question: "Which letter of the alphabet is it when you listen the audio?",
    audio: "<audio class='alp-sound' controls><source src='Audio/J-audio.m4a'></audio>",
    options: ["N", "F", "J", "M",],
    answer: "J"
  },
  {
    question: "Which letter of the alphabet is it when you listen the audio?",
    audio: "<audio class='alp-sound' controls><source src='Audio/C-audio.m4a'></audio>",
    options: ["B", "U", "P", "C",],
    answer: "C"
  },
  {
    question: "Which letter of the alphabet is it when you listen the audio?",
    audio: "<audio class='alp-sound' controls><source src='Audio/D-audio.m4a'></audio>",
    options: ["D", "E", "Z", "O",],
    answer: "D"
  }
];

let currentQuestion = 0;
let score = 0;
let timeLeft = 30;
let timerInterval;
const timerEl = document.getElementById("time");
const questionEl = document.querySelector(".question");
const audioEl = document.querySelector(".audio");
const optionsEl = document.querySelector(".options");
const resultEl = document.querySelector(".result");
const scoreEl = document.getElementById("score");
const restartBtn = document.querySelector(".restart-btn");
const donateBtn = document.querySelector(".button-donate");



function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const random = Math.floor(Math.random() * (i + 1));
    [array[i], array[random]] = [array[random], array[i]]
  }
}
shuffle(quizData);

function loadQuestion() {

if(currentQuestion >= quizData.length) {
  endQuiz();
  return;
}
const currentQuiz = quizData[currentQuestion];
questionEl.textContent = currentQuiz.question;
audioEl.innerHTML = currentQuiz.audio; 
optionsEl.innerHTML = "";
currentQuiz.options.forEach((option) => {
  const button = document.createElement("button");
  button.classList.add("option");
  button.textContent = option;
  button.onclick = () => checkAnswer(option);
  optionsEl.appendChild(button);
});
}


function checkAnswer(selectedOption) {
  if(selectedOption === quizData[currentQuestion].answer) {
    score++;
  }
  currentQuestion++;
  loadQuestion();
} 


function startTimer() {
timerInterval = setInterval(() => {
  timeLeft--;
  timerEl.textContent = timeLeft;

  if(timeLeft <= 0) {
    endQuiz();
  }

  if(timeLeft <= 30) {
    timerEl.classList.add("green");
  }
 
  if (timeLeft <= 9) {
    timerEl.classList.remove("green");
  } 

  if (timeLeft < 10) {
    timerEl.classList.add("red");
  }


  if(timeLeft < 10) {
    timerEl.textContent = "0" + timeLeft;
  }
}, 1000);
}

function endQuiz() {
clearInterval(timerInterval);
questionEl.style.display = "none";
audioEl.style.display = "none";
optionsEl.style.display = "none";
resultEl.style.display = "block";
scoreEl.textContent = score;
restartBtn.style.display = "inline-block";
donateBtn.style.display = "block";
}




restartBtn.addEventListener("click", () => {
currentQuestion = 0;
score = 0;
timeLeft = 30;
timerEl.textContent = timeLeft;
timerEl.classList.remove("red");
questionEl.style.display = "block";
audioEl.style.display = "block";
optionsEl.style.display = "block";
resultEl.style.display = "none";
restartBtn.style.display = "none";
donateBtn.style.display = "none";
shuffle(quizData);
loadQuestion();
startTimer();
});
loadQuestion();
startTimer();