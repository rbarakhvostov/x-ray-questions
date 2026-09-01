import { TestId } from '../data/tests.ts';
import { state } from '../state/quizState.ts';

const LEGACY_STORAGE_KEY = 'radiologyQuizState';

function storageKey(testId: TestId) {
  return `quizState:${testId}`;
}

export function saveState() {
  if (!state.testId) return;

  localStorage.setItem(
    storageKey(state.testId),
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

export function loadState(testId: TestId) {
  const saved =
    localStorage.getItem(storageKey(testId)) ??
    (testId === 'radiology' ? localStorage.getItem(LEGACY_STORAGE_KEY) : null);

  if (!saved) return false;

  const parsed = JSON.parse(saved);
  state.testId = testId;
  state.questions = parsed.questions;
  state.currentIndex = parsed.currentIndex;
  state.correctCount = parsed.correctCount;
  state.wrongCount = parsed.wrongCount;
  state.answeredIndices = new Set(parsed.answeredIndices || []);
  state.correctStreak = parsed.correctStreak || 0;

  return true;
}

export function clearState(testId: TestId = state.testId ?? 'radiology') {
  localStorage.removeItem(storageKey(testId));

  if (testId === 'radiology') {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}
