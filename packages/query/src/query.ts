import { action, makeObservable, observable } from 'mobx';

import { QueryState } from './query.state';
import { QueryCompleted } from './query.types';

export type QueryParams<TData> = {
  key: any[];
  fn: () => Promise<TData>;
  staleTimeMs?: number;
  onFetchSuccess?: (data: TData) => void;
  onFetchError?: (query: Query<TData>) => void;
};

export class Query<TData> implements QueryState {
  private loadingPromise?: Promise<QueryCompleted<TData>>;

  key: string;

  @observable
  isLoading: boolean = false;

  @observable
  isLoaded: boolean = false;

  @observable
  data?: TData;

  @observable.ref
  error?: unknown;

  staleAt?: number;

  constructor(
    private readonly params: QueryParams<TData>,
    prefetchedState?: QueryState<TData>,
  ) {
    makeObservable(this);

    this.key = Query.stringifyKey(params.key);

    if (prefetchedState) {
      this.hydrate(prefetchedState);
    }
  }

  readonly fetch = () => {
    if (!this.loadingPromise) {
      this.loadingPromise = this.load();
    }

    return this.loadingPromise;
  };

  @action
  readonly update = (data: TData) => {
    this.data = data;
    this.isLoaded = true;
  };

  private load = async () => {
    this.setLoading(true);

    try {
      const data = await this.params.fn();

      this.onQueryFetchSuccess(data);
    } catch (error) {
      this.onQueryFetchError(error);
    }

    delete this.loadingPromise;

    return this as QueryCompleted<TData>;
  };

  @action
  private setLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  @action
  private onQueryFetchSuccess = (data: TData) => {
    this.data = data;
    this.isLoading = false;
    this.isLoaded = true;
    this.error = undefined;
    this.staleAt = Date.now() + (this.params.staleTimeMs || 1000);

    if (this.params.onFetchSuccess) {
      this.params.onFetchSuccess(data);
    }
  };

  @action
  private onQueryFetchError = (error: unknown) => {
    this.error = error;
    this.isLoading = false;
    this.isLoaded = false;

    if (this.params.onFetchError) {
      this.params.onFetchError(this);
    }
  };

  @action
  private hydrate = (state: QueryState<TData>) => {
    this.isLoading = state.isLoading;
    this.isLoaded = state.isLoaded;
    this.data = state.data;
    this.error = state.error;
    this.staleAt = state.staleAt;
  };

  static stringifyKey = (key: any[]): string => {
    const allowedTypes = ['string', 'number', 'boolean'];

    const parts = key.map((part) => {
      if (allowedTypes.includes(typeof part)) {
        return part;
      }

      return JSON.stringify(part);
    });

    return parts.join(':');
  };

  static dehydrate = (query: Query<any>): QueryState => {
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
