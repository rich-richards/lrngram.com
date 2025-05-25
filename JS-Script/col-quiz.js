const quizData = [
  {
    question: "What color is it?",
    color_image: '<img class="img" src="images/2560px-5120x2880-dark-blue-solid-color-background.jpg">',
    options: ["PINK", "GREEN", "BLUE", "YELLOW"],
    answer: "BLUE"
  },
  {
    question: "What color is it?",
    color_image: '<img class="img" src="images/2560x1440-electric-cyan-solid-color-background.webp">',
    options: ["GOLD", "PURPLE", "CYAN", "MAROON"],
    answer: "CYAN"
  },
  {
    question: "What color is it?",
    color_image: '<img class="img" src="images/Solid_red.png">',
    options: ["ORANGE", "MAROON", "BLACK", "RED",],
    answer: "RED"
  },
  {
    question: "What color is it?",
    color_image: '<img class="img" src="images/Graukarte.svg.png">',
    options: ["GREEN", "WHITE", "GRAY", "VIOLET",],
    answer: "GRAY"
  },
  {
    question: "What color is it?",
    color_image: '<img class="img" src="images/Solid_purple.svg.png">',
    options: ["PURPLE", "CRIMSON", "YELLOW", "OLIVE",],
    answer: "PURPLE"
  }
];

let currentQuestion = 0;
let score = 0;
let timeLeft = 30;
let timerInterval;
const timerEl = document.getElementById("time");
const questionEl = document.querySelector(".question");
const imageEl = document.querySelector(".image");
const optionsEl = document.querySelector(".options");
const resultEl = document.querySelector(".result");
const scoreEl = document.getElementById("score");
const restartBtn = document.querySelector(".restart-btn");

function loadQuestion() {
if(currentQuestion >= quizData.length) {
  endQuiz();
  return;
}
const currentQuiz = quizData[currentQuestion];
questionEl.textContent = currentQuiz.question;
imageEl.innerHTML = currentQuiz.color_image;
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

  if(timeLeft < 10) {
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
  imageEl.style.display = "none";
  optionsEl.style.display = "none";
  resultEl.style.display = "block";
  scoreEl.textContent = score;
  restartBtn.style.display = "inline-block";
}


restartBtn.addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  timeLeft = 30;
  timerEl.textContent = timeLeft;
  timerEl.classList.remove("red");
  questionEl.style.display = "block";
  imageEl.style.display = "block";
  optionsEl.style.display = "block";
  resultEl.style.display = "none";
  restartBtn.style.display = "none";
  loadQuestion();
  startTimer();
});
loadQuestion();
startTimer();