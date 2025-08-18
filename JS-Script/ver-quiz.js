const quizData = [
    {
      question: "How is 'HAVE' written in the present for the third person?",    
      options: ["HAVES", "HAS", "HAVED", "HASED"],
      answer: "HAS"
    },
    {
      question: "How is 'EAT' written in the past?",
      options: ["EATS", "EATES", "EATED", "ATE"],
      answer: "ATE"
    },
    {
      question: "How is 'READ' written in the past?",
      options: ["RED", "READS", "READ", "READED",],
      answer: "READ"
    },
    {
      question: "How is 'SING' written in the past?",
      options: ["SINGED", "SANG", "SINGES", "SING",],
      answer: "SANG"
    },
    {
      question: "How is 'RUN' written in the present?",
      options: ["RUNES", "RUNNES", "RUND", "RUN",],
      answer: "RUN"
    },
      {
      question: "How is 'LEARN' written in the present for the third person?",
      options: ["LEARNTS", "LEARNS", "LEARNT", "LEARNES",],
      answer: "LEARNS"
    },
      {
      question: "How is 'SLEEP' written in the past?",
      options: ["SLEEPET", "SLEPED", "SLEPT", "SLEP",],
      answer: "SLEPT"
    },
      {
      question: "How is 'DANCE' written in the present?",
      options: ["DANCE", "DANCES", "DANCET", "DANCED",],
      answer: "DANCE"
    },
      {
      question: "How is 'DRAW' written in the past?",
      options: ["DREWED", "DREWS", "DREEW", "DREW",],
      answer: "DREW"
    },
      {
      question: "How is 'JUMP' written in the present for the third person?",
      options: ["JUMPSES", "JUMPS", "JUMPES", "JUMPED",],
      answer: "JUMPS"
    }
];
  
let currentQuestion = 0;
let score = 0;
let timeLeft = 30;
let timerInterval;
const timerEl = document.getElementById("time");
const questionEl = document.querySelector(".question");
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