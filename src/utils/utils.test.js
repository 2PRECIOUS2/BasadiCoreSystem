import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple utility functions to test
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('en-US');
  } catch {
    return '';
  }
};

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Tests for the utility functions
describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    test('formats number correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    test('handles invalid input', () => {
      expect(formatCurrency('invalid')).toBe('$0.00');
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
    });
  });

  describe('formatDate', () => {
    test('formats date correctly', () => {
      const result = formatDate('2025-10-10');
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test('handles invalid input', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate('invalid')).toBe('');
    });
  });

  describe('validateEmail', () => {
    test('validates correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('rejects invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });
});

// Simple component test
const SimpleComponent = ({ title = "Test" }) => {
  return <div data-testid="simple-component">{title}</div>;
};

describe('SimpleComponent', () => {
  test('renders with default title', () => {
    render(<SimpleComponent />);
    expect(screen.getByTestId('simple-component')).toHaveTextContent('Test');
  });

  test('renders with custom title', () => {
    render(<SimpleComponent title="Custom Title" />);
    expect(screen.getByTestId('simple-component')).toHaveTextContent('Custom Title');
  });
});