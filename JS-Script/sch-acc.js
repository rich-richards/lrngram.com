const quizData = [
    {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images/61i3tHQEURL._AC_UF894,1000_QL80_.jpg"></div>',    
        options: ["CRAYONS", "CHALKS", "SHARPENER", "SLATE"],
        answer: "SLATE"
    },
    {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images/Blue_Book_PNG_Clipart.png"></div>',    
        options: ["BOOK", "CALCULATOR", "PALETTE", "HIGLIGHTER"],
        answer: "BOOK"
    },
    {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images/boys-school-bag.jpeg"></div>',    
        options: ["CHALK", "BACKPACK", "PROTRACTOR", "RULER"],
        answer: "BACKPACK"
    },
    {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images/asta-pi616-scotch-7-student-scissors-blue-1593882199.jpg"</div>',    
        options: ["ERASER", "NOTEPAD", "SCISSORS", "PEN"],
        answer: "SCISSORS"
  },
  {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images/SIS3876_3.webp"</div>',    
        options: ["CALCULATOR", "STAPLER", "PENCIL CASE", "PALETTE"],
        answer: "PALETTE"
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
  imageEl.innerHTML = currentQuiz.image_sch_acc;
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

    if(timeLeft <10) {
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