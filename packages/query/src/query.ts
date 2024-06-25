/* eslint-disable @typescript-eslint/no-explicit-any */
import { action, makeObservable, observable } from 'mobx';

import { QueryState } from './query.state';

export class Query<TData> implements QueryState {
  key: string;

  @observable
  isLoading: boolean = false;

  @observable
  isLoaded: boolean = false;

  @observable.ref
  data?: TData;

  @observable.ref
  error?: unknown;

  staleAt?: number;

  constructor(state: QueryState<TData>) {
    makeObservable(this);

    this.key = state.key;
    this.isLoading = state.isLoading;
    this.isLoaded = state.isLoaded;
    this.data = state.data;
    this.error = state.error;
    this.staleAt = state.staleAt;
  }

  @action
  readonly update = (data: TData) => {
    this.data = data;
    this.isLoaded = true;
  };

  static empty = <TData>(key: string): Query<TData> => {
    return new Query<TData>({ key, isLoaded: false, isLoading: false });
  };

  static dehydrate = <TData>(query: Pick<Query<TData>, keyof QueryState>): QueryState<TData> => {
    return {
      key: query.key,
      isLoading: query.isLoading,
      isLoaded: query.isLoaded,
      data: query.data,
      error: query.error,
      staleAt: query.staleAt,
    };
  };
}
