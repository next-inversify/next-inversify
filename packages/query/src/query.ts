/* eslint-disable @typescript-eslint/no-explicit-any */
import { action, makeObservable, observable } from 'mobx';

import { QueryState } from './query.state';
import { QueryKey } from './query.types';

export type QueryParams<TData> = {
  key: QueryKey | QueryKey[];
  alias?: QueryKey | QueryKey[];
  fn: () => Promise<TData>;
  staleMs?: number;
  onSuccess?: (data: TData) => void;
  onError?: (query: Query<TData>) => void;
};

class NoQueryParams extends Error {
  constructor() {
    super('Query params not found');
  }
}

export class Query<TData> implements QueryState {
  private promise?: Promise<void>;

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

  constructor(
    private state?: QueryState<TData>,
    private params?: QueryParams<TData>,
  ) {
    makeObservable(this);

    this.key = this.buildKey();
    this.isLoading = state?.isLoading || false;
    this.isLoaded = state?.isLoaded || false;
    this.data = state?.data;
    this.error = state?.error;
    this.staleAt = state?.staleAt;
  }

  readonly fetch = (): Promise<void> => {
    if (!this.promise) {
      this.promise = this.fetcher();
    }

    return this.promise;
  };

  readonly setParams = (params: QueryParams<TData>) => {
    this.params = params;
  };

  private buildKey = (): string => {
    if (this.state?.key) return this.state.key;

    if (!this.params?.key) throw new NoQueryParams();

    return Query.stringifyKey(this.params.key);
  };

  private fetcher = async (): Promise<void> => {
    this.setLoading(true);

    try {
      if (!this.params) throw new NoQueryParams();

      const data = await this.params.fn();

      this.onSuccess(data);
    } catch (error) {
      this.onError(error);
    }

    this.promise = undefined;
  };

  get hasParams(): boolean {
    return !!this.params;
  }

  @action
  readonly update = (data: TData) => {
    this.data = data;
    this.isLoaded = true;
  };

  @action
  readonly reset = () => {
    this.data = undefined;
    this.isLoaded = false;
    this.isLoading = false;
    this.error = undefined;
    this.staleAt = undefined;
  };

  @action
  private onSuccess = (data: TData) => {
    if (!this.params) throw new NoQueryParams();

    this.data = data;
    this.isLoading = false;
    this.isLoaded = true;
    this.error = undefined;
    this.staleAt = Date.now() + (this.params.staleMs || 1000);

    this.params.onSuccess?.(data);
  };

  @action
  private onError = (error: unknown) => {
    this.error = error;
    this.isLoading = false;
    this.isLoaded = false;

    this.params?.onError?.(this);
  };

  @action
  private setLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
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
      staleAt: query.staleAt,
    };
  };

  static stringifyKey = (key: QueryKey | QueryKey[]): string => {
    if (!Array.isArray(key)) return key.toString();

    const allowedTypes = ['string', 'number', 'boolean'];

    const parts = key.map((part) => {
      if (allowedTypes.includes(typeof part)) {
        return part;
      }

      return JSON.stringify(part);
    });

    return parts.join(':');
  };

  static create = <TData>(params: QueryParams<TData>): Query<TData> => {
    return new Query<TData>(
      {
        key: Query.stringifyKey(params.key),
        isLoading: false,
        isLoaded: false,
      },
      params,
    );
  };
}
