export interface QueryState<TData = unknown> {
  key: string;

  isLoading: boolean;

  isLoaded: boolean;

  data?: TData;

  error?: unknown;

  staleAt?: number;
}
