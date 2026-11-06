/** @type {import('prettier').Config} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/app/globals.css',
  printWidth: 80,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'always',
  semi: false,
  endOfLine: 'auto',
}

export default config
