export type Callback<T = unknown> = (value: T) => void;
export type Subscription = {
  unsubscribe: () => void;
};
