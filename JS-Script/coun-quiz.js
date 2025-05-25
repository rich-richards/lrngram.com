const quizData = [
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images/France-Flag-30725__94649.jpg"></div>',    
      options: ["CHINA", "NIGERIA", "FRANCE", "INDIA"],
      answer: "FRANCE"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images/Flag_of_the_United_States.svg.webp"></div>',
      options: ["UNITED STATES OF AMERICA", "EGYPT", "GERMANY", "UNITED KINGDOM"],
      answer: "UNITED STATES OF AMERICA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images/images (1).jpg"></div>',
      options: ["SINGAPORE", "EGYPT", "SPAIN", "BRAZIL",],
      answer: "EGYPT"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images/Wovilon-Chinese-Flag-Large-Size-6-Specifications-Indoor-and-Outdoor-Nano-Waterproof-Sunscreen-Flag_44d9d312-0411-431e-a4e5-5dbe34088959.e13f56f8d0e851c4483a7adaa932bab7.webp"></div>',
      options: ["SINGAPORE", "CANADA", "JAPAN", "CHINA",],
      answer: "CHINA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images/9a5307df-b04e-486b-8f57-f753a9e6206e_1.c9bbc1419a7fa001f38f73d7aca2883c.webp"></div>',
      options: ["NIGERIA", "RUSSIA", "PORTUGAL", "GREECE",],
      answer: "NIGERIA"
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
  imageEl.innerHTML = currentQuiz.image_country;
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