import { state } from '../state/quizState.ts';

const CELEBRATION_DURATION_MS = 3000;

interface CelebrationConfig {
  streakMod: number;
  className: string;
  emoji: string;
  text: string;
}

const CELEBRATIONS: CelebrationConfig[] = [
  {
    streakMod: 100,
    className: 'celebration-congratulations',
    emoji: '🥳🥳🥳',
    text: 'Ты профи!!!',
  },
  {
    streakMod: 50,
    className: 'celebration-brain',
    emoji: '🧠🧠🧠',
    text: 'Отличный результат!!!',
  },
  {
    streakMod: 25,
    className: 'celebration-flowers',
    emoji: '🌷🌻🌹',
    text: 'Молодец!!!',
  },
];

function buildCelebrationHtml(config: CelebrationConfig) {
  return `
    <span class="celebration-emoji">${config.emoji}</span>
    <span class="celebration-text">${config.text}</span>
  `;
}

export function triggerCelebration(isCorrect: boolean) {
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
