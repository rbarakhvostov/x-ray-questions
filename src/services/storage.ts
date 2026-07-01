import { state } from '../state/quizState.ts';

const STORAGE_KEY = 'radiologyQuizState';

export function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      questions: state.questions,
      currentIndex: state.currentIndex,
      correctCount: state.correctCount,
      wrongCount: state.wrongCount,
      answeredIndices: [...state.answeredIndices],
      correctStreak: state.correctStreak,
    })
  );
}

export function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return false;

  const parsed = JSON.parse(saved);
  state.questions = parsed.questions;
  state.currentIndex = parsed.currentIndex;
  state.correctCount = parsed.correctCount;
  state.wrongCount = parsed.wrongCount;
  state.answeredIndices = new Set(parsed.answeredIndices || []);
  state.correctStreak = parsed.correctStreak || 0;
  return true;
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
