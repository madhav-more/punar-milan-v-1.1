export const Colors = {
  primary: '#E91E63', // Premium Pink/Crimson
  secondary: '#FF4081',
  accent: '#7C4DFF',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#B00020',
  success: '#4CAF50',
  warning: '#FFC107',
  overlay: 'rgba(0, 0, 0, 0.5)',
  white: '#FFFFFF',
  black: '#000000',
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    color: Colors.text,
  },
  bodySmall: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
};

export const Shadows = {
  light: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
