const quizData = [
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/ebe7f226-84ce-4a73-ba1e-b58e157dde9f.jpg"></div>',    
      options: ["CHINA", "NIGERIA", "FRANCE", "INDIA"],
      answer: "FRANCE"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/9d9602d3-3cbe-4949-bc90-1a6be27d4e19.jpg"></div>',
      options: ["UNITED STATES OF AMERICA", "EGYPT", "GERMANY", "UNITED KINGDOM"],
      answer: "UNITED STATES OF AMERICA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/3834aced-5fea-401f-8071-eea48f349cbd.jpg"></div>',
      options: ["ITALY", "EGYPT", "SPAIN", "BRAZIL",],
      answer: "EGYPT"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/97e591fe-55bc-4e14-9fb7-442874de16c1.jpg"></div>',
      options: ["SINGAPORE", "CANADA", "JAPAN", "CHINA",],
      answer: "CHINA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/pngtree-nigeria-flag-waving-png-image_4565993.png"></div>',
      options: ["NIGERIA", "SOUTH AFRICA", "PORTUGAL", "GREECE",],
      answer: "NIGERIA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/ee6c34c8-6288-4604-b213-9712555fa9a6.jpg"></div>',
      options: ["TÜRKIYE", "IRELAND", "JAPAN", "RUSSIA",],
      answer: "RUSSIA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/780a708f-e736-41b5-9239-ddde74345157.jpg"></div>',
      options: ["SOUTH AFRICA", "BRAZIL", "GERMANY", "CANADA",],
      answer: "BRAZIL"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/b9aa59e4-ab06-47eb-ba5a-630f44338d6f.jpg"></div>',
      options: ["SINGAPORE", "UNITED STATES OF AMERICA", "PORTUGAL", "UNITED KINGDOM",],
      answer: "UNITED KINGDOM"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/2b359013-9149-464e-ad80-c66ebe0f1657.jpg"></div>',
      options: ["SPAIN", "INDIA", "EGYPT", "TÜRKIYE",],
      answer: "INDIA"
    },
    {
      question: "Which country is this?",
      image_country: '<div><img class="img" src="images-country/44a67e6b-d07a-41ba-9609-c03fbc0334a8.jpg"></div>',
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
  donateBtn.style.display = "block";
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
  donateBtn.style.display = "none";

  shuffle(quizData);
  loadQuestion();
  startTimer();
  });
  loadQuestion();
  startTimer();