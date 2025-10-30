import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Clock } from '../../../src/core/clock';

describe('Clock', () => {
  let clock: Clock;

  beforeEach(() => {
    clock = new Clock();
  });

  // Initialization tests
  it('should initialize with default values', () => {
    expect(clock.time).toBe(0);
    expect(clock.deltaTime).toBe(0);
    expect(clock.timeScale).toBe(1);
    expect(clock.fixedDeltaTime).toBeCloseTo(1 / 60);
    expect(clock.maxAccumulatedTime).toBe(0.25);
  });

  // Tick behaviour tests
  it ('should advance time on tick', () => {
    const start = clock.time;
    clock.tick();
    expect(clock.time).toBeGreaterThan(start);
    expect(clock.deltaTime).toBeGreaterThan(0);
  });

  // Time scaling tests
  it('should apply timeScale correctly', () => {
    clock.timeScale = 2; // double speed
    clock.tick();
    const dtScaled = clock.deltaTime;

    clock = new Clock(); // reset clock
    clock.timeScale = 1;
    clock.tick();
    const dtNormal = clock.deltaTime;

    expect(dtScaled).toBeGreaterThan(dtNormal);
    expect(dtScaled).toBeCloseTo(dtNormal * 2, 1);
  });

  // Pause behaviour tests
  it('should pause when timeScale is 0', () => {
    clock.timeScale = 0;
    clock.tick();
    expect(clock.deltaTime).toBe(0);

    const timeAfterPause = clock.time;
    clock.tick();
    expect(clock.time).toBe(timeAfterPause); // time should not advance
  });

  // Reverse time testing
  it('should reverse when timeScale < 0', () => {
    clock.timeScale = -0.5;
    clock.tick();
    const t1 = clock.time;

    clock.tick();
    const t2 = clock.time;

    expect(t2).toBeLessThan(t1);
  });

  // Accumulator tests
  it('should not accumulate more than maxAccumulatedTime', () => {
    // simulate a large frame gap by manually  hacking lastTime
    clock['lastTime'] -= 7000; // 7 seconds ago
    clock.tick();
    expect(clock['accumulator']).toBeLessThanOrEqual(clock.maxAccumulatedTime);
  });

  //
  it('should run fixed steps when accumulator is enough', () => {
    const stepFn = vi.fn();

    // simulate ~3 fixedDeltaTime worth of accumulator
    clock['accumulator'] = clock.fixedDeltaTime * 3.2;
    const alpha = clock.stepFixed(stepFn);

    expect(stepFn).toHaveBeenCalledTimes(3);
    expect(alpha).toBeCloseTo(0.2, 1);  // leftover fraction
  });

  // alpha test
  it('should return alpha in [0, 1)', () => {
    clock['accumulator'] = clock.fixedDeltaTime * 0.5;
    const alpha = clock.stepFixed(() => {});

    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(1);
  });

  it('integration: tick + stepFixed should process steps deterministically', () => {
    const stepFn = vi.fn();

    // simulate multiple frames
    for (let i = 0; i < 10; i++) {
      // mock time manually, so tick sees a 20ms gap to peocess fixedStep
      clock['lastTime'] -= 20;
      clock.tick();
      clock.stepFixed(stepFn);
    }

    expect(stepFn).toHaveBeenCalled();
    // should be consistent number of calls (depends on frame timing)
    // at least ensures physics keeps up
  })
});
