import { normalize } from "../utils/normalize.js";

export function getCorrectAnswers(question) {
  const normalizedOptions = question.options.map(normalize);
  const parts = question.correct_answer.split(",").map((part) => normalize(part));
  const matchingParts = parts.filter((part) => normalizedOptions.includes(part));

  return matchingParts.length > 0
    ? matchingParts
    : [normalize(question.correct_answer)];
}

export function isAnswerCorrect(question, selectedOptions) {
  const correctAnswers = getCorrectAnswers(question);
  const userAnswers = selectedOptions.map(normalize);

  return (
    correctAnswers.length === userAnswers.length &&
    correctAnswers.every((answer) => userAnswers.includes(answer))
  );
}

export function isMultipleChoice(question) {
  return getCorrectAnswers(question).length > 1;
}
