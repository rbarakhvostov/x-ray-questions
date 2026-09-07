import { tests, TestId } from '../data/tests.ts';
import { hasCorrectAnswer } from '../quiz/answer.ts';
import { FavoritableQuestion } from '../state/quizState.ts';
import { shuffleArray } from '../utils/shuffle.ts';

interface FavoriteRef {
  testId: TestId;
  questionNumber: number;
}

const STORAGE_KEY = 'favoriteQuestions';

function loadFavoriteRefs(): FavoriteRef[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return [];

  try {
    return JSON.parse(saved) as FavoriteRef[];
  } catch {
    return [];
  }
}

function saveFavoriteRefs(refs: FavoriteRef[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(refs));
}

export function isFavorite(testId: TestId, questionNumber: number): boolean {
  return loadFavoriteRefs().some((ref) => ref.testId === testId && ref.questionNumber === questionNumber);
}

export function toggleFavorite(testId: TestId, questionNumber: number): boolean {
  const refs = loadFavoriteRefs();
  const index = refs.findIndex((ref) => ref.testId === testId && ref.questionNumber === questionNumber);

  if (index === -1) {
    refs.push({ testId, questionNumber });
    saveFavoriteRefs(refs);

    return true;
  }

  refs.splice(index, 1);
  saveFavoriteRefs(refs);

  return false;
}

export function getFavoriteCount(): number {
  return loadFavoriteRefs().length;
}

export function buildFavoriteQuestions(): FavoritableQuestion[] {
  const resolved = loadFavoriteRefs()
    .map((ref): FavoritableQuestion | null => {
      const question = tests[ref.testId].questions.find((item) => item.question_number === ref.questionNumber);

      return question && hasCorrectAnswer(question) ? { ...question, sourceTestId: ref.testId } : null;
    })
    .filter((question): question is FavoritableQuestion => question !== null);

  return shuffleArray(resolved).map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));
}
