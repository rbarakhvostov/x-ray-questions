import { formatQuestionCount, getPlayableCount, TestId, testList, tests } from '../data/tests.ts';
import { buildFavoriteQuestions, getFavoriteCount, isFavorite, toggleFavorite } from '../services/favorites.ts';
import { saveState, loadState, clearState } from '../services/storage.ts';
import { FavoritableQuestion, resetState, state } from '../state/quizState.ts';
import { shuffleArray } from '../utils/shuffle.ts';
import { normalize } from '../utils/normalize.ts';
import { getCorrectAnswers, hasCorrectAnswer, isAnswerCorrect, isMultipleChoice, Question } from './answer.ts';
import { triggerCelebration } from './celebration.ts';
import { els } from './dom.ts';

function updateStats() {
  els.currentQ.textContent = String(state.currentIndex + 1);
  els.totalQ.textContent = String(state.questions.length);
  els.scoreCorrect.textContent = String(state.correctCount);
  els.scoreWrong.textContent = String(state.wrongCount);
  const progress = (state.currentIndex / state.questions.length) * 100;
  els.progressBar.style.width = `${progress}%`;
}

function updateFavoriteButton(isFav: boolean) {
  els.favoriteBtn.classList.toggle('is-active', isFav);
  els.favoriteBtn.textContent = isFav ? '★' : '☆';
  els.favoriteBtn.setAttribute('aria-pressed', String(isFav));
}

function toggleCurrentFavorite() {
  const question = state.questions[state.currentIndex];
  const isFav = toggleFavorite(question.sourceTestId, question.question_number);
  updateFavoriteButton(isFav);
}

function handleOptionClick(element: HTMLElement, text: string, multiple: boolean) {
  if (state.isAnswered) return;

  if (multiple) {
    if (state.selectedOptions.includes(text)) {
      state.selectedOptions = state.selectedOptions.filter((item) => item !== text);
      element.classList.remove('selected');
    } else {
      state.selectedOptions.push(text);
      element.classList.add('selected');
    }
  } else {
    state.selectedOptions = [text];
    document.querySelectorAll('.option').forEach((el) => el.classList.remove('selected'));
    element.classList.add('selected');
  }

  els.checkBtn.disabled = state.selectedOptions.length === 0;
}

function renderQuestion() {
  const question = state.questions[state.currentIndex];
  const multiple = isMultipleChoice(question);

  els.questionCard.style.animation = 'none';
  void els.questionCard.offsetHeight;
  els.questionCard.style.animation = 'slideUp 0.4s ease-out';

  els.qNumber.textContent = `Вопрос ${question.question_number}`;
  els.qText.textContent = question.question_text;

  if (multiple) {
    els.qType.classList.remove('hidden');
    els.qType.textContent = 'Выберите несколько вариантов';
  } else {
    els.qType.classList.add('hidden');
  }

  updateFavoriteButton(isFavorite(question.sourceTestId, question.question_number));

  els.optionsList.innerHTML = '';
  state.selectedOptions = [];
  state.isAnswered = false;
  els.checkBtn.disabled = true;
  els.checkBtn.classList.remove('hidden');
  els.nextBtn.classList.add('hidden');

  question.options.forEach((option) => {
    const div = document.createElement('div');
    div.className = `option ${multiple ? 'multiple-choice' : ''}`;
    div.innerHTML = `<div class="option-indicator"></div><div>${option}</div>`;
    div.addEventListener('click', () => handleOptionClick(div, option, multiple));
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

  document.querySelectorAll('.option').forEach((el) => {
    el.classList.remove('selected');
    el.classList.add('disabled');
    const optionText = normalize(el.querySelector('div:last-child')?.textContent || '');
    const isCorrectOption = correctAnswers.includes(optionText);
    const isUserSelected = userAnswers.includes(optionText);

    if (isCorrectOption && isUserSelected) {
      el.classList.add('correct');
    } else if (isCorrectOption && !isUserSelected) {
      el.classList.add('missed');
    } else if (!isCorrectOption && isUserSelected) {
      el.classList.add('incorrect');
    }
  });

  updateStats();
  els.checkBtn.classList.add('hidden');
  els.nextBtn.classList.remove('hidden');
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

  if (state.currentIndex >= state.questions.length && state.mode === 'test' && state.testId) {
    clearState(state.testId);
  }
}

function showQuizChrome() {
  const title = state.mode === 'favorites' ? 'Избранное' : state.testId ? tests[state.testId].title : null;

  document.title = title ?? 'Выберите тест';
  els.testTitle.textContent = title ?? '';
  els.testSelectArea.classList.add('hidden');
  els.quizHeader.classList.remove('hidden');
  els.globalActions.classList.remove('hidden');
}

function showResults() {
  showQuizChrome();
  els.quizArea.classList.add('hidden');
  els.resultsArea.classList.remove('hidden');

  const total = state.questions.length;
  const percentage = Math.round((state.correctCount / total) * 100);
  els.finalScore.textContent = `${percentage}%`;

  if (percentage >= 90) {
    els.finalMessage.textContent = 'Превосходно! Вы отлично знаете материал.';
  } else if (percentage >= 70) {
    els.finalMessage.textContent = 'Хороший результат! Есть небольшие пробелы.';
  } else if (percentage >= 50) {
    els.finalMessage.textContent = 'Неплохо, но стоит повторить некоторые темы.';
  } else {
    els.finalMessage.textContent = 'Рекомендуется внимательно изучить теорию и попробовать снова.';
  }
}

function prepareQuestions(sourceQuestions: Question[], shuffle: boolean, sourceTestId: TestId): FavoritableQuestion[] {
  const playable = sourceQuestions.filter(hasCorrectAnswer);
  const source = shuffle ? shuffleArray(playable) : [...playable];

  return source.map((question) => ({
    ...question,
    options: shuffleArray(question.options),
    sourceTestId,
  }));
}

function restartQuiz(shuffle = false) {
  if (state.mode === 'favorites') {
    startFavorites();

    return;
  }

  if (!state.testId) return;

  clearState(state.testId);
  initQuiz(shuffle);
}

export function showTestSelect() {
  resetState();
  document.title = 'Выберите тест';
  els.testSelectArea.classList.remove('hidden');
  els.quizHeader.classList.add('hidden');
  els.quizArea.classList.add('hidden');
  els.resultsArea.classList.add('hidden');
  els.globalActions.classList.add('hidden');
  renderTestSelect();
}

function renderTestSelect() {
  els.testSelectList.innerHTML = '';

  const favoriteCount = getFavoriteCount();

  if (favoriteCount > 0) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'select-test-btn select-favorites-btn';
    button.innerHTML = `
      <span class="select-test-title">★ Избранное</span>
      <span class="select-test-meta">${formatQuestionCount(favoriteCount)}</span>
    `;
    button.addEventListener('click', startFavorites);
    els.testSelectList.appendChild(button);
  }

  testList.forEach((test) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'select-test-btn';
    button.innerHTML = `
      <span class="select-test-title">${test.title}</span>
      <span class="select-test-meta">${formatQuestionCount(getPlayableCount(test))}</span>
    `;
    button.addEventListener('click', () => startTest(test.id));
    els.testSelectList.appendChild(button);
  });
}

export function startTest(testId: TestId) {
  state.testId = testId;
  initQuiz();
}

export function startFavorites() {
  const questions = buildFavoriteQuestions();

  if (questions.length === 0) return;

  resetState();
  state.mode = 'favorites';
  state.questions = questions;
  state.currentIndex = 0;
  state.selectedOptions = [];
  state.isAnswered = false;

  showQuizChrome();
  els.quizArea.classList.remove('hidden');
  els.resultsArea.classList.add('hidden');

  updateStats();
  renderQuestion();
}

export function initQuiz(shuffle = false) {
  if (!state.testId) {
    showTestSelect();

    return;
  }

  const bank = tests[state.testId];

  if (!loadState(state.testId) || shuffle) {
    state.testId = bank.id;
    state.questions = prepareQuestions(bank.questions, shuffle, bank.id);
    state.currentIndex = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.answeredIndices = new Set();
    state.correctStreak = 0;
  } else {
    while (state.currentIndex < state.questions.length && state.answeredIndices.has(state.currentIndex)) {
      state.currentIndex++;
    }

    if (state.currentIndex >= state.questions.length) {
      showResults();

      return;
    }
  }

  state.selectedOptions = [];
  state.isAnswered = false;

  showQuizChrome();
  els.quizArea.classList.remove('hidden');
  els.resultsArea.classList.add('hidden');

  updateStats();
  renderQuestion();
  saveState();
}

export function bindQuizEvents() {
  els.checkBtn.addEventListener('click', checkAnswer);
  els.nextBtn.addEventListener('click', nextQuestion);
  els.favoriteBtn.addEventListener('click', toggleCurrentFavorite);
  els.restartBtn.addEventListener('click', () => restartQuiz(false));
  els.globalShuffleBtn.addEventListener('click', () => restartQuiz(true));
  els.restartResultsBtn.addEventListener('click', () => restartQuiz(false));
  els.shuffleResultsBtn.addEventListener('click', () => restartQuiz(true));
  els.backToTestsBtn.addEventListener('click', showTestSelect);
  els.resultsBackBtn.addEventListener('click', showTestSelect);
}
