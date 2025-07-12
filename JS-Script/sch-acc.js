const quizData = [
    {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images-school-accessories/deleece-cook-zzjLGF_6dx4-unsplash.jpg"></div>',    
        options: ["CRAYONS", "CHALKS", "SHARPENER", "SLATE"],
        answer: "SLATE"
    },
    {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images-school-accessories/kenny-eliason-ch_z2RsV7uc-unsplash.jpg"></div>',    
        options: ["BOOK", "CALCULATOR", "PALETTE", "HIGLIGHTER"],
        answer: "BOOK"
    },
    {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images-school-accessories/sun-lingyan-_H0fjILH5Vw-unsplash.jpg"></div>',    
        options: ["CHALK", "BACKPACK", "PROTRACTOR", "RULER"],
        answer: "BACKPACK"
    },
    {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images-school-accessories/behnam-norouzi-zvmZjYt5Z9s-unsplash.jpg"</div>',    
        options: ["ERASER", "NOTEPAD", "SCISSORS", "PEN"],
        answer: "SCISSORS"
    },
    {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images-school-accessories/nick-fewings-b0rbVE6olh8-unsplash.jpg"</div>',    
        options: ["CALCULATOR", "STAPLER", "PENCIL CASE", "PALETTE"],
        answer: "PALETTE"
    },
       {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images-school-accessories/grant-davies-9BdTR47vdDY-unsplash.jpg"</div>',    
        options: ["CALCULATOR", "CHALKS", "PROTRACTOR", "SHARPERNER"],
        answer: "CHALKS"
       },
        {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images-school-accessories/liviu-c-d_eLSvL4v9w-unsplash.jpg"</div>',    
        options: ["RULER", "PENCIL", "PEN", "SCISSORS"],
        answer: "PEN"
       },
        {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images-school-accessories/nicolae-valera-OqkRizzcVx4-unsplash.jpg"</div>',    
        options: ["STAPLER", "GLUE STICK", "BACKPACK", "ERASER"],
        answer: "STAPLER"
       },
        {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images-school-accessories/nihal-demirci-Q5Sb5Pq-T1s-unsplash.jpg"</div>',    
        options: ["HIGHLIGHTER", "SCISSORS", "PENCIL CASE", "BOOK"],
        answer: "PENCIL CASE"
       },
        {
        question: "Which school accessory is this?",
        image_sch_acc: '<div><img class="img" src="images-school-accessories/daniel-shapiro-r5KFjtLvB_I-unsplash.jpg"</div>',    
        options: ["ERASER", "CRAYONS", "CALCULATOR", "NOTEPAD"],
        answer: "ERASER"
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