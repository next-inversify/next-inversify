/* eslint-disable @typescript-eslint/no-explicit-any */
import { action, computed, makeObservable } from 'mobx';

import { Query } from './query';
import { QueryCache } from './query.cache';
import { QueryState } from './query.state';

export type QueryLoaderParams<TData> = {
  key: any[];
  fn: () => Promise<TData>;
  staleMs?: number;
  onSuccess?: (data: TData) => void;
  onError?: (query: QueryLoader<TData>) => void;
};

export class QueryLoader<TData> implements QueryState {
  constructor(
    private readonly cache: QueryCache,
    private readonly params: QueryLoaderParams<TData>,
  ) {
    makeObservable(this);
  }

  fetch = async (): Promise<void> => {
    this.setLoading(true);

    try {
      const data = await this.params.fn();

      this.onSuccess(data);
    } catch (error) {
      this.onError(error);
    }
  };

  @computed
  private get state(): Query<TData> {
    return this.cache.get<TData>(this.params.key);
  }

  @computed
  get key(): string {
    return this.state.key;
  }

  @computed
  get isLoading(): boolean {
    return this.state.isLoading;
  }

  @computed
  get isLoaded(): boolean {
    return this.state.isLoaded;
  }

  @computed
  get data(): TData | undefined {
    return this.state.data;
  }

  @computed
  get error(): unknown | undefined {
    return this.state.error;
  }

  @computed
  get staleAt(): number | undefined {
    return this.state.staleAt;
  }

  @action
  private onSuccess = (data: TData) => {
    this.state.data = data;
    this.state.isLoading = false;
    this.state.isLoaded = true;
    this.state.error = undefined;
    this.state.staleAt = Date.now() + (this.params.staleMs || 1000);

    this.params.onSuccess?.(data);
  };

  @action
  private onError = (error: unknown) => {
    this.state.error = error;
    this.state.isLoading = false;
    this.state.isLoaded = false;

    this.params.onError?.(this);
  };

  @action
  private setLoading = (isLoading: boolean) => {
    this.state.isLoading = isLoading;
  };
}
