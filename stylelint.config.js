export default {
  extends: ['stylelint-config-standard'],
  rules: {
    // Для CSS-модулей разрешаем любые имена классов
    'selector-class-pattern': null,

    // Разрешаем :global и :local
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'local', 'export'],
      },
    ],

    // Разрешаем композицию
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['value', 'each', 'mixin', 'include', 'define-mixin'],
      },
    ],
  },
};
