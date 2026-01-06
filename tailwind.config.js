/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skin: {
          primary: withOpacity('--color-bg-primary'),
          secondary: withOpacity('--color-bg-secondary'),
          text: withOpacity('--color-text-primary'),
          muted: withOpacity('--color-text-secondary'),
          accent: withOpacity('--color-accent'),
          'accent-light': withOpacity('--color-accent-light'),
        }
      }
    },
  },
  plugins: [],
}
