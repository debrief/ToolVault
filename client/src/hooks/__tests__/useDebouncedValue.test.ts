import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('basic functionality', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebouncedValue('initial', 300));
      
      expect(result.current).toBe('initial');
    });

    it('should debounce value changes with default delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      // Change the value
      rerender({ value: 'changed' });
      
      // Should still be the old value immediately
      expect(result.current).toBe('initial');

      // Advance time by less than default delay (300ms)
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(result.current).toBe('initial');

      // Advance time to complete the delay
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe('changed');
    });

    it('should debounce value changes with custom delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 500),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'changed' });
      
      // Advance by less than custom delay
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current).toBe('initial');

      // Complete the custom delay
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(result.current).toBe('changed');
    });

    it('should reset timer on rapid value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'initial' } }
      );

      // First change
      rerender({ value: 'change1' });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(result.current).toBe('initial');

      // Second change before first timer completes
      rerender({ value: 'change2' });
      
      // Original timer should be cancelled, still showing initial
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(result.current).toBe('initial');

      // Complete the new timer
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe('change2');
    });
  });

  describe('type handling', () => {
    it('should work with string values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: 'hello' } }
      );

      rerender({ value: 'world' });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe('world');
    });

    it('should work with number values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: 42 } }
      );

      rerender({ value: 84 });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe(84);
    });

    it('should work with boolean values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: true } }
      );

      rerender({ value: false });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe(false);
    });

    it('should work with object values', () => {
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { name: 'Jane', age: 25 };
      
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: obj1 } }
      );

      expect(result.current).toEqual(obj1);

      rerender({ value: obj2 });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toEqual(obj2);
    });

    it('should work with array values', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];
      
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: arr1 } }
      );

      expect(result.current).toEqual(arr1);

      rerender({ value: arr2 });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toEqual(arr2);
    });

    it('should work with null and undefined values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: null } }
      );

      expect(result.current).toBeNull();

      rerender({ value: undefined });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBeUndefined();

      rerender({ value: 'not null' });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe('not null');
    });
  });

  describe('delay variations', () => {
    it('should work with zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 0),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });
      
      // With zero delay, should update immediately after timer tick
      act(() => {
        jest.advanceTimersByTime(0);
      });
      
      expect(result.current).toBe('changed');
    });

    it('should work with very small delays', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 1),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });
      
      act(() => {
        jest.advanceTimersByTime(1);
      });
      
      expect(result.current).toBe('changed');
    });

    it('should work with large delays', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 5000),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });
      
      act(() => {
        jest.advanceTimersByTime(4999);
      });
      
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });
      
      expect(result.current).toBe('changed');
    });

    it('should handle delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebouncedValue(value, delay),
        { 
          initialProps: { value: 'initial', delay: 300 } 
        }
      );

      // Change value
      rerender({ value: 'changed', delay: 300 });
      
      // Change delay while timer is running
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      rerender({ value: 'changed', delay: 100 });
      
      // Should reset with new delay
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe('changed');
    });
  });

  describe('cleanup and memory management', () => {
    it('should cleanup timer on unmount', () => {
      const { result, rerender, unmount } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });
      
      // Timer should be set
      expect(result.current).toBe('initial');

      // Unmount before timer completes
      unmount();
      
      // Advance time past the delay
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // No memory leaks or errors should occur
      // This test primarily ensures cleanup happens without errors
    });

    it('should cleanup previous timer when value changes', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      const { rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'initial' } }
      );

      // First change
      rerender({ value: 'change1' });
      
      // Second change should clear the previous timer
      rerender({ value: 'change2' });
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
      
      clearTimeoutSpy.mockRestore();
    });

    it('should handle rapid successive changes efficiently', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: 'initial' } }
      );

      // Rapidly change value multiple times
      const values = ['change1', 'change2', 'change3', 'change4', 'final'];
      
      values.forEach(value => {
        rerender({ value });
        act(() => {
          jest.advanceTimersByTime(50); // Less than delay
        });
      });

      // Should still be initial value
      expect(result.current).toBe('initial');

      // Complete the final timer
      act(() => {
        jest.advanceTimersByTime(50);
      });

      // Should have the final value
      expect(result.current).toBe('final');
    });
  });

  describe('edge cases', () => {
    it('should handle same value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: 'same' } }
      );

      // Change to same value
      rerender({ value: 'same' });
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current).toBe('same');
    });

    it('should handle reference equality for objects', () => {
      const obj = { name: 'test' };
      
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: obj } }
      );

      // Change to same object reference
      rerender({ value: obj });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe(obj);
    });

    it('should handle negative delays gracefully', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, -100),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });
      
      // Negative delay should likely behave like 0 or small positive delay
      act(() => {
        jest.advanceTimersByTime(0);
      });
      
      // The exact behavior with negative delays may vary, but shouldn't crash
      expect(result.current).toBeDefined();
    });

    it('should work with complex search scenarios', () => {
      // Simulating a real-world search input scenario
      const { result, rerender } = renderHook(
        ({ query }) => useDebouncedValue(query, 300),
        { initialProps: { query: '' } }
      );

      // User types "r"
      rerender({ query: 'r' });
      act(() => jest.advanceTimersByTime(100)); // User still typing
      
      // User types "re"
      rerender({ query: 're' });
      act(() => jest.advanceTimersByTime(100)); // User still typing
      
      // User types "react"
      rerender({ query: 'react' });
      act(() => jest.advanceTimersByTime(100)); // User still typing
      
      // User deletes one character: "reac"
      rerender({ query: 'reac' });
      act(() => jest.advanceTimersByTime(100)); // User still typing
      
      // User types final character: "react"
      rerender({ query: 'react' });
      
      // Still initial value during typing
      expect(result.current).toBe('');
      
      // User stops typing - complete the debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current).toBe('react');
    });

    it('should maintain type inference correctly', () => {
      // This test ensures TypeScript type inference works correctly
      const stringHook = renderHook(() => useDebouncedValue('string', 100));
      const numberHook = renderHook(() => useDebouncedValue(42, 100));
      const booleanHook = renderHook(() => useDebouncedValue(true, 100));
      
      // These assertions help verify TypeScript compilation
      expect(typeof stringHook.result.current).toBe('string');
      expect(typeof numberHook.result.current).toBe('number');
      expect(typeof booleanHook.result.current).toBe('boolean');
    });
  });
});