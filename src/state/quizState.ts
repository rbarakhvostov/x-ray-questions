import { Question } from '../quiz/answer.ts';

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  correctCount: number;
  wrongCount: number;
  selectedOptions: string[];
  isAnswered: boolean;
  answeredIndices: Set<number>;
  correctStreak: number;
}

export function createInitialState(): QuizState {
  return {
    questions: [],
    currentIndex: 0,
    correctCount: 0,
    wrongCount: 0,
    selectedOptions: [],
    isAnswered: false,
    answeredIndices: new Set(),
    correctStreak: 0,
  };
}

export const state = createInitialState();

export function resetState() {
  Object.assign(state, createInitialState());
}
