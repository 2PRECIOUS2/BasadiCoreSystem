// src/tests/dummy.test.js
import { sum } from '../utils/helpers';

describe('Dummy Test Suite', () => {
  test('math test', () => {
    expect(2 + 2).toBe(4);
  });

  test('string test', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

  test('array test', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.length).toBe(5);
  });

  test('helper function test', () => {
    // if you have a simple function in helpers.js
    expect(sum(3, 7)).toBe(10);
  });
});
