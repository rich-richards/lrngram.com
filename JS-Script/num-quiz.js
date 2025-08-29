const quizData = [
    {
      question: "10?",    
      options: ["TWENTY", "EIGHT", "NINETY", "TEN"],
      answer: "TEN"
    },
    {
      question: "Seventy-five?",
      options: ["64", "70", "75", "58"],
      answer: "75"
    },
    {
      question: "45?",
      options: ["FORTY-FIVE", "THIRTY", "TWENTY-EIGHT", "NINETY-ONE",],
      answer: "FORTY-FIVE"
    },
    {
      question: "Five?",
      options: ["50", "22", "7", "5",],
      answer: "5"
    },
    {
      question: "100?",
      options: ["NINETY", "HUNDRED", "SEVENTY", "FORTY",],
      answer: "HUNDRED"
    },
     {
      question: "Twenty-six?",
      options: ["41", "60", "96", "26",],
      answer: "26"
    },
     {
      question: "59?",
      options: ["EIGHTY-TWO", "FIFTY-NINE", "FORTY-THREE", "SIXTY-NINE",],
      answer: "FIFTY-NINE"
    },
     {
      question: "Twenty-two?",
      options: ["73", "62", "22", "53",],
      answer: "22"
    },
     {
      question: "57?",
      options: ["FIFTY-SEVEN", "FIFTY-FOUR", "SIXTY-SEVEN", "TWELVE",],
      answer: "FIFTY-SEVEN"
    },
     {
      question: "Eighty?",
      options: ["90", "43", "32", "80",],
      answer: "80"
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