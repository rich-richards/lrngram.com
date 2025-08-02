const quizData = [
    {
      question: "What is number 10 in letter?",    
      options: ["TWENTY", "EIGHT", "NINETY", "TEN"],
      answer: "TEN"
    },
    {
      question: "What is number 75 in letter?",
      options: ["SIXTY-FOUR", "SEVENTY", "SEVENTY-FIVE", "FIFTY-EIGHT"],
      answer: "SEVENTY-FIVE"
    },
    {
      question: "What is number 45 in letter?",
      options: ["FOURTY-FIVE", "THIRTY", "TWENTY-EIGHT", "NINETY-ONE",],
      answer: "FOURTY-FIVE"
    },
    {
      question: "What is number 5 in letter?",
      options: ["FIFTY", "TWENTY-TWO", "SEVEN", "FIVE",],
      answer: "FIVE"
    },
    {
      question: "What is number 100 in letter?",
      options: ["NINETY", "HUNDRED", "SEVENTY", "FOURTY",],
      answer: "HUNDRED"
    },
     {
      question: "What is number 26 in letter?",
      options: ["FOURTY-ONE", "SIXTY", "NINETY-SIX", "TWENTY-SIX",],
      answer: "TWENTY-SIX"
    },
     {
      question: "What is number 59 in letter?",
      options: ["EIGHTY-TWO", "FIFTY-NINE", "FOURTY-THREE", "SIXTY-NINE",],
      answer: "FIFTY-NINE"
    },
     {
      question: "What is number 22 in letter?",
      options: ["SEVENTY", "SIXTY-TWO", "TWENTY-TWO", "FIFTY-THREE",],
      answer: "TWENTY-TWO"
    },
     {
      question: "What is number 57 in letter?",
      options: ["FIFTY-SEVEN", "FIFTY-FOUR", "SIXTY-SEVEN", "TWOLF",],
      answer: "FIFTY-SEVEN"
    },
     {
      question: "What is number 80 in letter?",
      options: ["NINETY", "FOURTY-THREE", "THIRTY-TWO", "EIGHTY",],
      answer: "EIGHTY"
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
  shuffle(quizData);
  loadQuestion();
  startTimer();
  });
  loadQuestion();
  startTimer();