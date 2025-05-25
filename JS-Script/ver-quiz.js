const quizData = [
    {
      question: "How is 'HAVE' written in the third person in the present?",    
      options: ["HAVES", "HAS", "HAVED", "HASED"],
      answer: "HAS"
    },
    {
      question: "How is 'EAT' written in the past?",
      options: ["EATS", "EATES", "EATED", "ATE"],
      answer: "ATE"
    },
    {
      question: "How is 'READ' written in the past??",
      options: ["RED", "READS", "READ", "READED",],
      answer: "READ"
    },
    {
      question: "How is 'SING' written in the past??",
      options: ["SINGED", "SANG", "SINGES", "SING",],
      answer: "SANG"
    },
    {
      question: "How is 'RUN' written in the present??",
      options: ["RUNES", "RUNNES", "RUND", "RUN",],
      answer: "RUN"
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
  loadQuestion();
  startTimer();
  });
  loadQuestion();
  startTimer();