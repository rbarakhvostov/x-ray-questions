export function createInitialState() {
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
