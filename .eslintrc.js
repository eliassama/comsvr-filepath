module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eliassama/typescript'],
  overrides: [
    {
      files: ['*.ts'],
      extends: ['eliassama'],
    },
  ],
};
