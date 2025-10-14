import '@testing-library/jest-dom';

// Mock environment variables for Vite
Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:5000'
      }
    }
  }
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000/',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: ''
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});