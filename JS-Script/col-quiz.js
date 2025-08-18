const quizData = [
  {
    question: "What color is it?",
    color: "<div class='blue-color'></div>",
    options: ["PINK", "GREEN", "BLUE", "YELLOW"],
    answer: "BLUE"
  },
  {
    question: "What color is it?",
    color: "<div class='cyan-color'></div>",
    options: ["GOLD", "PURPLE", "CYAN", "MAROON"],
    answer: "CYAN"
  },
  {
    question: "What color is it?",
    color: "<div class='red-color'></div>",
    options: ["ORANGE", "MAROON", "BLACK", "RED",],
    answer: "RED"
  },
  {
    question: "What color is it?",
    color: "<div class='gray-color'></div>",
    options: ["GREEN", "WHITE", "GRAY", "VIOLET",],
    answer: "GRAY"
  },
  {
    question: "What color is it?",
    color: "<div class='purple-color'></div>",
    options: ["PURPLE", "CRIMSON", "YELLOW", "OLIVE",],
    answer: "PURPLE"
  },
   {
    question: "What color is it?",
    color: "<div class='yellow-color'></div>",
    options: ["BLACK", "ORANGE", "PINK", "YELLOW",],
    answer: "YELLOW"
  },
   {
    question: "What color is it?",
    color: "<div class='black-color'></div>",
    options: ["GREEN", "BLACK", "BLUE", "WHITE",],
    answer: "BLACK"
  },
   {
    question: "What color is it?",
    color: "<div class='green-color'></div>",
    options: ["GREEN", "RED", "PINK", "OLIVE",],
    answer: "GREEN"
  },
   {
    question: "What color is it?",
    color: "<div class='silver-color'></div>",
    options: ["BLACK", "VIOLET", "GOLD", "SILVER",],
    answer: "SILVER"
  },
   {
    question: "What color is it?",
    color: "<div class='beige-color'></div>",
    options: ["PINK", "ORANGE", "BEIGE", "MAROON",],
    answer: "BEIGE"
  }
];

let currentQuestion = 0;
let score = 0;
let timeLeft = 30;
let timerInterval;
const timerEl = document.getElementById("time");
const questionEl = document.querySelector(".question");
const colorEl = document.querySelector(".color-block");
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
colorEl.innerHTML = currentQuiz.color;
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
  optionsEl.style.display = "none";
  colorEl.style.display = "none";
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
  colorEl.style.display = "block";
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