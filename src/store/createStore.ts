type SetterFn<TState> = (prevState: TState) => Partial<TState>;

export function createStore<TState>(initialState: TState) {
  let state = initialState;
  const listeners = new Set<() => void>();

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

  return { setState, getState, subscribe };
}
