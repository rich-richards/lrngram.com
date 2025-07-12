const quizData = [
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/banner-2292670_1920.png"></div>',    
      options: ["CHINA", "NIGERIA", "FRANCE", "INDIA"],
      answer: "FRANCE"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/usa-flag-1133963_1920.jpg"></div>',
      options: ["UNITED STATES OF AMERICA", "EGYPT", "GERMANY", "UNITED KINGDOM"],
      answer: "UNITED STATES OF AMERICA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/kamel-altohamy-xkKaCEvCqqk-unsplash.jpg"></div>',
      options: ["ITALY", "EGYPT", "SPAIN", "BRAZIL",],
      answer: "EGYPT"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/banner-2292666_1920.png"></div>',
      options: ["SINGAPORE", "CANADA", "JAPAN", "CHINA",],
      answer: "CHINA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/pexels-meshack-emmanuel-kazanshyi-1267432081-29832529.jpg"></div>',
      options: ["NIGERIA", "SOUTH AFRICA", "PORTUGAL", "GREECE",],
      answer: "NIGERIA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/russia-3605381_1920.jpg"></div>',
      options: ["TÜRKIYE", "IRELAND", "JAPAN", "RUSSIA",],
      answer: "RUSSIA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/chris-boland-UqBeA-7apRE-unsplash.jpg"></div>',
      options: ["SOUTH AFRICA", "BRAZIL", "GERMANY", "CANADA",],
      answer: "BRAZIL"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/michael-starkie-4F0sg4IS8UI-unsplash.jpg"></div>',
      options: ["SINGAPORE", "UNITED STATES OF AMERICA", "PORTUGAL", "UNITED KINGDOM",],
      answer: "UNITED KINGDOM"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/pexels-studio-art-smile-218587-3476860.jpg"></div>',
      options: ["SPAIN", "INDIA", "EGYPT", "TÜRKIYE",],
      answer: "INDIA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/chris-boland-qNO3XMQILTA-unsplash.jpg"></div>',
      options: ["CHINA", "GREECE", "JAPAN", "SPAIN",],
      answer: "SPAIN"
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
  shuffle(quizData);
  loadQuestion();
  startTimer();
  });
  loadQuestion();
  startTimer();