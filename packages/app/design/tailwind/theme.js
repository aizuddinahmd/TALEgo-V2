// @ts-check

/** @type {import('tailwindcss').Config['theme']} */
const theme = {
  // edit your tailwind theme here!
  // https://tailwindcss.com/docs/adding-custom-styles
  extend: {
    colors: {
      'brand-gold': '#D4AF37',
      'brand-blue': '#0066FF',
      'brand-black': '#000000',
      'brand-dark-gray': '#121212',
      'deep-black': '#000000',
      'midnight-charcoal': '#121212',
      'gunmetal': '#262626',
      'muted-silver': '#A0A0A0',
      'metallic-gold': '#D4AF37',
      'glass-bg': 'rgba(0, 0, 0, 0.7)',
      'glass-border': 'rgba(212, 175, 55, 0.3)',
    },
  },
}

module.exports = {
  theme,
}
