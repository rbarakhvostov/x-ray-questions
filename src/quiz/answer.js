import { normalize } from '../utils/normalize.js';

export const getCorrectAnswers = (question) => question.correct_answer.map(normalize);

export function isAnswerCorrect(question, selectedOptions) {
  const correctAnswers = getCorrectAnswers(question);
  const userAnswers = selectedOptions.map(normalize);

  return correctAnswers.length === userAnswers.length && correctAnswers.every((answer) => userAnswers.includes(answer));
}

export const isMultipleChoice = (question) => getCorrectAnswers(question).length > 1;
