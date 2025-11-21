/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // VitrineFast Brand Colors
        primary: '#2D7DF6',      // Azul VitrineFast
        secondary: '#0A2540',    // Azul Escuro Pro
        fast: '#FF8C42',         // Laranja Fast
        
        // UI Colors
        textDark: '#1E293B',     // Texto principal
        textLight: '#94A3B8',    // Texto secundário
        borderLight: '#E3E8EF',  // Bordas suaves
        bgLight: '#FFFFFF',      // Background principal
        
        // Semantic Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
