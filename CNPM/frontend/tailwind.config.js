module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#fff',
        },
        secondary: {
          DEFAULT: '#f5f5f5',
          foreground: '#000',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#fff',
        },
        accent: {
          DEFAULT: '#e0e0e0',
          foreground: '#000',
        },
        muted: {
          DEFAULT: '#f0f0f0',
          foreground: '#666666',
        },
        background: '#f8fafc',
        card: {
          DEFAULT: '#fff',
          foreground: '#000',
        },
        popover: {
          DEFAULT: '#fff',
          foreground: '#000',
        },
        border: '#d0d0d0',
        input: 'transparent',
        'input-background': '#f8f8f8',
        'switch-background': '#d0d0d0',
        ring: '#666666',
        sidebar: {
          DEFAULT: '#f5f5f5',
          foreground: '#000',
          primary: '#000',
          'primary-foreground': '#fff',
          accent: '#e0e0e0',
          'accent-foreground': '#000',
          border: '#d0d0d0',
          ring: '#666666',
        },
      },
    },
  },
  plugins: [],
};
