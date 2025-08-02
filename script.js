const API_KEY = 'Tq4hoNdVAMojiDiwhJ9IRd5ugwksWC2PYjJsJi1i';

const startBtn = document.getElementById('start-btn');
const errorMsg = document.getElementById('error-msg');
const startScreen = document.querySelector('.start-screen');
const quizScreen = document.querySelector('.quiz');
const endScreen = document.querySelector('.end-screen');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const timeLeftEl = document.getElementById('time-left');
const scoreEl = document.getElementById('score');
const totalEl = document.getElementById('total');
const restartBtn = document.getElementById('restart-btn');

let questions = [];
let currentIndex = 0;
let selectedAnswer = null;
let score = 0;
let timer;
let timePerQuestion = 10;
let timeLeft;

// Load countdown audio once
const countdownAudio = new Audio('countdown.mp3');

startBtn.addEventListener('click', () => {
  errorMsg.style.display = 'none';
  const numQuestions = document.getElementById('num-questions').value;
  const category = document.getElementById('category').value;
  const difficulty = document.getElementById('difficulty').value;
  timePerQuestion = parseInt(document.getElementById('time').value);

  let url = `https://quizapi.io/api/v1/questions?apiKey=${API_KEY}&limit=${numQuestions}`;
  if (category) url += `&category=${category}`;
  if (difficulty) url += `&difficulty=${difficulty}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) {
        errorMsg.style.display = 'block';
        return;
      }
      questions = data;
      currentIndex = 0;
      score = 0;
      startScreen.classList.add('hide');
      quizScreen.classList.remove('hide');
      showQuestion();
    })
    .catch(() => {
      errorMsg.style.display = 'block';
    });
});

function showQuestion() {
  clearInterval(timer);
  selectedAnswer = null;
  submitBtn.disabled = true;
  nextBtn.classList.add('hide');
  answersEl.innerHTML = '';

  const q = questions[currentIndex];
  questionEl.textContent = q.question;

  // Show answers (API returns keys answer_a to answer_f, some can be null)
  for (const key in q.answers) {
    if (q.answers[key]) {
      const div = document.createElement('div');
      div.classList.add('answer');
      div.textContent = q.answers[key];
      div.dataset.key = key;
      div.style.backgroundColor = '';  // reset styles
      div.style.color = '';
      div.style.border = '';
      div.addEventListener('click', () => {
        if (selectedAnswer) {
          selectedAnswer.classList.remove('selected');
        }
        div.classList.add('selected');
        selectedAnswer = div;
        submitBtn.disabled = false;
      });
      answersEl.appendChild(div);
    }
  }

  // Timer
  timeLeft = timePerQuestion;
  updateTimerUI();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft === 3) {
      // Play countdown sound at 3 seconds left
      countdownAudio.play().catch(() => {
        // Ignore play errors (autoplay restrictions)
      });
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      submitAnswer();
    }
  }, 1000);
}

function updateTimerUI() {
  timeLeftEl.textContent = `Time left: ${timeLeft}s`;
  const progress = (timeLeft / timePerQuestion) * 100;
  progressBar.style.width = progress + '%';
}

submitBtn.addEventListener('click', submitAnswer);
nextBtn.addEventListener('click', () => {
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showEndScreen();
  }
});

function submitAnswer() {
  clearInterval(timer);
  submitBtn.disabled = true;

  const q = questions[currentIndex];
  const correctAnswers = q.correct_answers;

  // Check if selected answer is correct
  let isCorrect = false;
  let selectedKey = null;
  if (selectedAnswer) {
    selectedKey = selectedAnswer.dataset.key;
    if (correctAnswers[selectedKey + '_correct'] === 'true') {
      isCorrect = true;
    }
  }

  // Show correct and wrong answers with colors
  const answerDivs = answersEl.querySelectorAll('.answer');
  answerDivs.forEach((div) => {
    const key = div.dataset.key;
    if (correctAnswers[key + '_correct'] === 'true') {
      // Correct answer green
      div.style.backgroundColor = 'green';
      div.style.color = 'white';
      div.style.border = '2px solid darkgreen';
    } else {
      // Default background for wrong answers
      div.style.backgroundColor = '#4a4f6d';
      div.style.color = 'white';
      div.style.border = 'none';
    }
  });

  // If user selected wrong answer, mark it red
  if (selectedAnswer && !isCorrect) {
    selectedAnswer.style.backgroundColor = 'red';
    selectedAnswer.style.color = 'white';
    selectedAnswer.style.border = '2px solid darkred';
  }

  if (isCorrect) score++;

  nextBtn.classList.remove('hide');
}

function showEndScreen() {
  quizScreen.classList.add('hide');
  endScreen.classList.remove('hide');
  scoreEl.textContent = score;
  totalEl.textContent = questions.length;
}

restartBtn.addEventListener('click', () => {
  endScreen.classList.add('hide');
  startScreen.classList.remove('hide');
});
