import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/store/gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('starts with default values', () => {
    const state = useGameStore.getState();
    expect(state.day).toBe(1);
    expect(state.stamina).toBe(70);
    expect(state.usefulness).toBe(40);
    expect(state.dissociation).toBe(0);
    expect(state.phase).toBe('sonderkommando');
    expect(state.dead).toBe(false);
    expect(state.survived).toBe(false);
  });

  it('advances days correctly', () => {
    useGameStore.getState().advanceDay();
    expect(useGameStore.getState().day).toBe(2);
  });

  it('transitions to medical phase after day 90', () => {
    const store = useGameStore.getState();
    // Manually set to day 90
    useGameStore.setState({ day: 90, stamina: 70, usefulness: 50 });
    store.advanceDay();
    expect(useGameStore.getState().phase).toBe('medical');
  });

  it('transitions to pathologist phase after day 210', () => {
    useGameStore.setState({ day: 210, stamina: 70, usefulness: 50 });
    useGameStore.getState().advanceDay();
    expect(useGameStore.getState().phase).toBe('pathologist');
  });

  it('marks survived at liberation day', () => {
    useGameStore.setState({ day: 256, stamina: 50, usefulness: 50 });
    useGameStore.getState().advanceDay();
    expect(useGameStore.getState().survived).toBe(true);
  });

  it('marks dead when stamina hits 0', () => {
    useGameStore.setState({ day: 10, stamina: 1, usefulness: 50, rations: 0 });
    // With 0 rations and starvation drain, but stamina recovery from rations won't help
    // Directly test applyEventChoice draining stamina to 0
    useGameStore.getState().applyEventChoice({
      usefulness: 0,
      stamina: -5, // drain remaining 1 -> 0 (clamped)
      dissociation: 0,
      rations: 0,
    });
    expect(useGameStore.getState().stamina).toBe(0);
    expect(useGameStore.getState().dead).toBe(true);
    expect(useGameStore.getState().deathCause).toBe('starvation');
  });

  it('rest increases stamina and decreases usefulness', () => {
    useGameStore.setState({ stamina: 50, usefulness: 50 });
    useGameStore.getState().rest();
    expect(useGameStore.getState().stamina).toBe(55);
    expect(useGameStore.getState().usefulness).toBe(49);
  });

  it('applies event effects correctly', () => {
    useGameStore.setState({ stamina: 50, usefulness: 40, dissociation: 10, rations: 3 });
    useGameStore.getState().applyEventChoice({
      stamina: -10,
      usefulness: 15,
      dissociation: 5,
      rations: 1,
    });
    const state = useGameStore.getState();
    expect(state.stamina).toBe(40);
    expect(state.usefulness).toBe(55);
    expect(state.rations).toBe(4);
    // Dissociation includes the compliance gain
    expect(state.dissociation).toBeGreaterThan(10);
  });

  it('resistance acts reduce dissociation', () => {
    useGameStore.setState({ dissociation: 30, totalResistanceActs: 0 });
    useGameStore.getState().applyEventChoice({
      stamina: -5,
      usefulness: 0,
      dissociation: -10,
      rations: 0,
      isResistance: true,
    });
    const state = useGameStore.getState();
    expect(state.dissociation).toBeLessThan(30);
    expect(state.totalResistanceActs).toBe(1);
  });

  it('tracks revolt participation', () => {
    expect(useGameStore.getState().revolted).toBe(false);
    useGameStore.getState().setRevolted(true);
    expect(useGameStore.getState().revolted).toBe(true);
  });

  it('clamps stats to valid ranges', () => {
    useGameStore.getState().applyEventChoice({
      stamina: 1000,
      usefulness: 1000,
      dissociation: 1000,
      rations: 1000,
    });
    const state = useGameStore.getState();
    expect(state.stamina).toBeLessThanOrEqual(100);
    expect(state.usefulness).toBeLessThanOrEqual(100);
    expect(state.dissociation).toBeLessThanOrEqual(100);
    expect(state.rations).toBeLessThanOrEqual(10);
  });
});
