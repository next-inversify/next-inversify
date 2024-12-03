export const createSignal = <T>(): Signal<T> => {
  const listeners = new Set<(value: T) => void>();

  const subscribe = (listener: (value: T) => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  const next = (value: T) => {
    listeners.forEach((listener) => listener(value));
  };

  return {
    subscribe,
    next,
    asObservable: () => ({
      subscribe,
    }),
  };
};

export type Signal<T> = {
  subscribe: (listener: (value: T) => void) => () => void;
  next: (value: T) => void;
  asObservable: () => SignalObservable<T>;
};

export type SignalObservable<T> = {
  subscribe: (listener: (value: T) => void) => () => void;
};
