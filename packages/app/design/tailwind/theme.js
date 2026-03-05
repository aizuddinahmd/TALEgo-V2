// @ts-check

/** @type {import('tailwindcss').Config['theme']} */
const theme = {
  // edit your tailwind theme here!
  // https://tailwindcss.com/docs/adding-custom-styles
  extend: {
    colors: {
      'brand-gold': '#D4AF37',
      'brand-blue': '#0066FF',
      'brand-black': '#0F0F0F',
      'brand-dark-gray': '#1A1A1A',
      'glass-bg': 'rgba(20, 20, 20, 0.7)',
      'glass-border': 'rgba(212, 175, 55, 0.3)',
    },
  },
}

module.exports = {
  theme,
}
