import { state } from '../state/quizState.js';

const CELEBRATION_DURATION_MS = 3100;

const CELEBRATIONS = [
  {
    streakMod: 100,
    className: 'celebration-bigheart',
    emoji: '🥳🥳🥳',
    text: 'Ты профи!!!',
  },
  {
    streakMod: 50,
    className: 'celebration-bigheart',
    emoji: '❤️‍🔥❤️‍🔥❤️‍🔥',
    text: 'Люблю тебя!!!',
  },
  {
    streakMod: 25,
    className: 'celebration-brain',
    emoji: '🧠🧠🧠',
    text: 'Мегамозг!!!',
  },
  {
    streakMod: 20,
    className: 'celebration-flowers',
    emoji: '🌷🌻🌹',
    text: 'Вау. Супeр!',
  },
  {
    streakMod: 15,
    className: 'celebration-fire',
    emoji: '🔥🔥🔥',
    text: 'Ну ты и голова!',
  },
  {
    streakMod: 10,
    className: 'celebration-salute',
    emoji: '🎉🎊🥳',
    text: 'Ты умничка!!!',
  },
  {
    streakMod: 5,
    className: 'celebration-heart',
    emoji: '❤️',
    text: 'Молодец!',
  },
];

function buildCelebrationHtml(config) {
  return `
    <span class="celebration-emoji">${config.emoji}</span>
    <span class="celebration-text">${config.text}</span>
  `;
}

export function triggerCelebration(isCorrect) {
  if (!isCorrect) return;

  document.querySelector('.celebration')?.remove();

  const config = CELEBRATIONS.find((item) => state.correctStreak % item.streakMod === 0);
  if (!config) return;

  const outer = document.createElement('div');
  outer.className = 'celebration';

  const inner = document.createElement('div');
  inner.className = `celebration-inner ${config.className}`;
  inner.innerHTML = buildCelebrationHtml(config);

  outer.appendChild(inner);
  document.body.appendChild(outer);
  setTimeout(() => outer.remove(), CELEBRATION_DURATION_MS);
}
