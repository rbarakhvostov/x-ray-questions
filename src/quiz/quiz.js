import { rawQuestions } from "../data/questions.js";
import { state } from "../state/quizState.js";
import { shuffleArray } from "../utils/shuffle.js";
import { saveState, loadState, clearState } from "../services/storage.js";
import { els } from "./dom.js";
import { triggerCelebration } from "./celebration.js";
import {
  getCorrectAnswers,
  isAnswerCorrect,
  isMultipleChoice,
} from "./answer.js";
import { normalize } from "../utils/normalize.js";

function updateStats() {
  els.currentQ.textContent = state.currentIndex + 1;
  els.totalQ.textContent = state.questions.length;
  els.scoreCorrect.textContent = state.correctCount;
  els.scoreWrong.textContent = state.wrongCount;
  const progress = (state.currentIndex / state.questions.length) * 100;
  els.progressBar.style.width = `${progress}%`;
}

function handleOptionClick(element, text, multiple) {
  if (state.isAnswered) return;

  if (multiple) {
    if (state.selectedOptions.includes(text)) {
      state.selectedOptions = state.selectedOptions.filter((item) => item !== text);
      element.classList.remove("selected");
    } else {
      state.selectedOptions.push(text);
      element.classList.add("selected");
    }
  } else {
    state.selectedOptions = [text];
    document.querySelectorAll(".option").forEach((el) => el.classList.remove("selected"));
    element.classList.add("selected");
  }

  els.checkBtn.disabled = state.selectedOptions.length === 0;
}

function renderQuestion() {
  const question = state.questions[state.currentIndex];
  const multiple = isMultipleChoice(question);

  els.questionCard.style.animation = "none";
  els.questionCard.offsetHeight;
  els.questionCard.style.animation = "slideUp 0.4s ease-out";

  els.qNumber.textContent = `Вопрос ${question.question_number}`;
  els.qText.textContent = question.question_text;

  if (multiple) {
    els.qType.classList.remove("hidden");
    els.qType.textContent = "Выберите несколько вариантов";
  } else {
    els.qType.classList.add("hidden");
  }

  els.optionsList.innerHTML = "";
  state.selectedOptions = [];
  state.isAnswered = false;
  els.checkBtn.disabled = true;
  els.checkBtn.classList.remove("hidden");
  els.nextBtn.classList.add("hidden");

  question.options.forEach((option) => {
    const div = document.createElement("div");
    div.className = `option ${multiple ? "multiple-choice" : ""}`;
    div.innerHTML = `<div class="option-indicator"></div><div>${option}</div>`;
    div.addEventListener("click", () => handleOptionClick(div, option, multiple));
    els.optionsList.appendChild(div);
  });
}

function checkAnswer() {
  state.isAnswered = true;
  const question = state.questions[state.currentIndex];
  state.answeredIndices.add(state.currentIndex);

  const correctAnswers = getCorrectAnswers(question);
  const userAnswers = state.selectedOptions.map(normalize);
  const isCorrect = isAnswerCorrect(question, state.selectedOptions);

  if (isCorrect) {
    state.correctCount++;
    state.correctStreak++;
  } else {
    state.wrongCount++;
    state.correctStreak = 0;
  }

  triggerCelebration(isCorrect);

  document.querySelectorAll(".option").forEach((el) => {
    el.classList.remove("selected");
    el.classList.add("disabled");
    const optionText = normalize(el.querySelector("div:last-child").textContent);
    const isCorrectOption = correctAnswers.includes(optionText);
    const isUserSelected = userAnswers.includes(optionText);

    if (isCorrectOption && isUserSelected) {
      el.classList.add("correct");
    } else if (isCorrectOption && !isUserSelected) {
      el.classList.add("missed");
    } else if (!isCorrectOption && isUserSelected) {
      el.classList.add("incorrect");
    }
  });

  updateStats();
  els.checkBtn.classList.add("hidden");
  els.nextBtn.classList.remove("hidden");
  saveState();
}

function nextQuestion() {
  state.currentIndex++;
  if (state.currentIndex < state.questions.length) {
    renderQuestion();
    updateStats();
    saveState();
  } else {
    showResults();
  }

  if (state.currentIndex >= state.questions.length) {
    clearState();
  }
}

function showResults() {
  els.quizArea.classList.add("hidden");
  els.globalShuffleBtn.classList.add("hidden");
  els.restartBtn.classList.add("hidden");
  els.resultsArea.classList.remove("hidden");

  const total = state.questions.length;
  const percentage = Math.round((state.correctCount / total) * 100);
  els.finalScore.textContent = `${percentage}%`;

  if (percentage >= 90) {
    els.finalMessage.textContent = "Превосходно! Вы отлично знаете материал.";
  } else if (percentage >= 70) {
    els.finalMessage.textContent = "Хороший результат! Есть небольшие пробелы.";
  } else if (percentage >= 50) {
    els.finalMessage.textContent = "Неплохо, но стоит повторить некоторые темы.";
  } else {
    els.finalMessage.textContent =
      "Рекомендуется внимательно изучить теорию и попробовать снова.";
  }
}

function prepareQuestions(shuffle) {
  const source = shuffle ? shuffleArray(rawQuestions) : [...rawQuestions];
  return source.map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));
}

export function initQuiz(shuffle = false) {
  if (!loadState() || shuffle) {
    state.questions = prepareQuestions(shuffle);
    state.currentIndex = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.answeredIndices = new Set();
    state.correctStreak = 0;
  } else {
    while (
      state.currentIndex < state.questions.length &&
      state.answeredIndices.has(state.currentIndex)
    ) {
      state.currentIndex++;
    }

    if (state.currentIndex >= state.questions.length) {
      showResults();
      return;
    }
  }

  state.selectedOptions = [];
  state.isAnswered = false;

  els.quizArea.classList.remove("hidden");
  els.resultsArea.classList.add("hidden");
  els.globalShuffleBtn.classList.remove("hidden");
  els.restartBtn.classList.remove("hidden");

  updateStats();
  renderQuestion();
  saveState();
}

export function restartQuiz(shuffle = false) {
  clearState();
  initQuiz(shuffle);
}

export function bindQuizEvents() {
  els.checkBtn.addEventListener("click", checkAnswer);
  els.nextBtn.addEventListener("click", nextQuestion);
  els.restartBtn.addEventListener("click", () => restartQuiz(false));
  els.globalShuffleBtn.addEventListener("click", () => restartQuiz(true));
  els.restartResultsBtn.addEventListener("click", () => restartQuiz(false));
  els.shuffleResultsBtn.addEventListener("click", () => restartQuiz(true));
}
