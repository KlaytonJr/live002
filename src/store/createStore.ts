import { useEffect, useState, useSyncExternalStore } from 'react';

type SetterFn<TState> = (prevState: TState) => Partial<TState>;
type SetStateFn<TState> = (
  partialState: Partial<TState> | SetterFn<TState>,
) => void;

export function createStore<TState extends Record<string, any>>(
  createState: (setState: SetStateFn<TState>, getState: () => TState) => TState,
) {
  let state: TState;
  let listeners: Set<() => void>;

  function setState(partialState: Partial<TState> | SetterFn<TState>) {
    // Pode ser um objeto ou uma função
    // Se for uma função, recebe o estado anterior
    // Se for um objeto, recebe o novo estado
    const newValue =
      typeof partialState === 'function' ? partialState(state) : partialState;

    state = {
      ...state,
      ...newValue,
    };

    notifyListeners();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function notifyListeners() {
    listeners.forEach((listener) => listener());
  }

  function getState() {
    return state;
  }

  // function useStore<TValue>(selector: (currentState: TState) => TValue) {
  //   const [value, setValue] = useState(() => selector(state));

  //   useEffect(() => {
  //     const unsubscribe = subscribe(() => {
  //       const newValue = selector(state);

  //       if (value !== newValue) {
  //         setValue(newValue);
  //       }
  //     });

  //     return () => unsubscribe();
  //   }, [selector, value]);

  //   return value;
  // }
  function useStore<TValue>(selector: (currentState: TState) => TValue) {
    return useSyncExternalStore(subscribe, () => selector(state));
  }

  state = createState(setState, getState);
  listeners = new Set();

  return useStore;
}
