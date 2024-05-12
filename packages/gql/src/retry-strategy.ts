import { Observable, ObservableInput, RetryConfig, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Logger } from './logger';

type RetryStrategyParams = Readonly<{
  eagerAttempts?: number;
  eagerDelayMs?: number;
  lazyDelayMs?: number;
  label?: string;
  stop$?: Observable<unknown>;
  logger?: Logger;
}>;

export const RetryStrategy = (params: RetryStrategyParams = {}): RetryConfig => ({
  delay: (_, attempt): ObservableInput<unknown> => {
    const {
      eagerAttempts = 3,
      eagerDelayMs = 1000,
      lazyDelayMs = 5000,
      label = 'Network failure',
      logger,
      stop$,
    } = params;

    const delay = attempt <= eagerAttempts ? eagerDelayMs : lazyDelayMs;
    const retry$ = timer(delay);

    logger?.warn(`${label}. Retrying in ${delay}ms. Attempt #${attempt}`);
    logger?.debug(params, _);

    return stop$ ? retry$.pipe(takeUntil(stop$)) : retry$;
  },
});
