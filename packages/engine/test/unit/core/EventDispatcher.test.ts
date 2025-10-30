import { describe, it, expect, vi, Test } from "vitest";
import { EventDispatcher, BaseEvent } from "../../../src/core/EventDispatcher";

interface TestEvents {
  start: BaseEvent & { type: 'start'; message: string };
  stop: BaseEvent & { type: 'stop' };
  [key: string]: BaseEvent;
}

describe('EventDispatcher', () => {

  describe('addEventListener()', () => {

    it('should create a listener list if none exists', () => {
      const dispatcher = new EventDispatcher<TestEvents>();
      const listener = vi.fn();

      dispatcher.addEventListener('start', listener);

      expect(dispatcher['listeners']).toBeDefined();
      expect(dispatcher['listeners']!['start']).toHaveLength(1);
      expect(dispatcher['listeners']!['start']![0]).toBe(listener);
    });

    it('should not add the same listener twice', () => {
      const dispatcher = new EventDispatcher<TestEvents>();
      const listener = vi.fn();

      dispatcher.addEventListener('start', listener);
      dispatcher.addEventListener('start', listener);

      expect(dispatcher['listeners']!['start']).toHaveLength(1);
    });

    it('should handle multiple event types seperately', () => {
      const dispatcher = new EventDispatcher<TestEvents>();
      const startListener = vi.fn();
      const stopListener = vi.fn();

      dispatcher.addEventListener('start', startListener);
      dispatcher.addEventListener('stop', stopListener);

      expect(dispatcher['listeners']!['start']).toHaveLength(1);
      expect(dispatcher['listeners']!['stop']).toHaveLength(1);
      expect(dispatcher['listeners']!['start']![0]).toBe(startListener);
      expect(dispatcher['listeners']!['stop']![0]).toBe(stopListener);
    });

    it('should not thrown when _liseners already exists', () => {
      const dispatcher = new EventDispatcher<TestEvents>();
      const listener = vi.fn();

      dispatcher.addEventListener('start', listener);
      dispatcher.addEventListener('stop', listener);

      expect(Object.keys(dispatcher['listeners']!)).toEqual(['start', 'stop']);
    })
  });

  describe('hasEventListener()', () => {
    it('should return false when no listener exists', () => {
      const dispatcher = new EventDispatcher<TestEvents>();
      const listener = vi.fn();

      expect(dispatcher.hasEventListener('start', listener)).toBe(false);
    })

    it('should return true after listener is added', () => {
      const dispatcher = new EventDispatcher<TestEvents>();
      const listener = vi.fn();

      dispatcher.addEventListener('start', listener);

      expect(dispatcher.hasEventListener('start', listener)).toBe(true);
    });

    it('should return false for unregistered listener of same event type', () => {
      const dispatcher = new  EventDispatcher<TestEvents>();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      dispatcher.addEventListener('start', listener1);

      expect(dispatcher.hasEventListener('start', listener2)).toBe(false);
    });

    it('should return false for listener registered to a diffrent event type', () => {
      const dispatcher = new  EventDispatcher<TestEvents>();
      const listener = vi.fn();

      dispatcher.addEventListener('start', listener);

      expect(dispatcher.hasEventListener('stop', listener)).toBe(false);
    });

    it('should return false after listener is removed', () => {
      const dispatcher = new  EventDispatcher<TestEvents>();
      const listener = vi.fn();

      dispatcher.addEventListener('start', listener);
      dispatcher.removeEventListener('start', listener);

      expect(dispatcher.hasEventListener('start', listener)).toBe(false);
    })
  });
});
