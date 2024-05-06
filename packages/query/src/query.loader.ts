import { injectable } from 'inversify';
import { action, makeObservable, observable } from 'mobx';

type QueryFetcher<T> = () => Promise<T>;

const defaultRevalidateIn = 5000; // 5 sec

export type QueryOptions<T = unknown> = {
  key: string;
  fetcher: QueryFetcher<T>;
  revalidateIn?: number; // ms
};

export type QueryData<T = unknown> = {
  key: string;
  data: T;
};

export type QueryResult<T = unknown> = QueryData<T> & {
  isLoading: boolean;
  isLoaded: boolean;
  error?: any;
  invalidateAt: number;
};

@injectable()
export class QueryLoader {
  @observable.ref
  queries: Map<string, QueryResult> = new Map();

  constructor() {
    makeObservable(this);
  }

  @action
  private setQueryResult = <T>(query: string, result: QueryResult<T>) => {
    this.queries.set(query, result);
  };

  @action
  query = async <T>(options: QueryOptions<T>): Promise<QueryResult<T> & { data: T }> => {
    const { fetcher, ...rest } = options;

    if (!this.shouldSuspend(options.key)) {
      return this.getResult(options.key);
    }

    const revalidateIn = options.revalidateIn ?? defaultRevalidateIn;

    const now = Date.now();

    this.setQueryResult<null>(options.key, {
      ...rest,
      isLoading: true,
      isLoaded: false,
      data: null,
      invalidateAt: now + revalidateIn,
    });

    try {
      const result = await fetcher();
      const queryResult: QueryResult<T> = {
        ...rest,
        isLoading: false,
        isLoaded: true,
        data: result,
        invalidateAt: Date.now() + revalidateIn,
      };

      this.setQueryResult(options.key, queryResult);

      return queryResult;
    } catch (e) {
      const queryResult: QueryResult<null> = {
        ...rest,
        isLoading: false,
        isLoaded: false,
        invalidateAt: now,
        error: e,
        data: null,
      };

      this.setQueryResult(options.key, queryResult);

      throw queryResult;
    }
  };

  querySuspense = <T>(options: QueryOptions<T>): QueryResult<T> => {
    if (this.shouldSuspend(options.key)) {
      throw this.query(options);
    } else {
      return this.getResult(options.key);
    }
  };

  querySuspenseMultiple = <T>(...options: QueryOptions<T>[]): QueryResult<T>[] => {
    const promises: Promise<unknown>[] = [];

    options.forEach((option) => {
      if (this.shouldSuspend(option.key)) {
        promises.push(this.query(option));
      }
    });

    if (promises.length > 0) {
      throw Promise.all(promises);
    }

    return options.map((option) => this.getResult(option.key));
  };

  private getResult = <T>(key: string): QueryResult<T> => {
    const query = this.queries.get(key);

    if (!query) {
      throw new Error(`Query with key ${key} not found`);
    }

    if (query.error) {
      throw query.error;
    }

    return query as QueryResult<T>;
  };

  private shouldSuspend = (key: string): boolean => {
    const query = this.queries.get(key);

    if (query?.error) return false;

    return !query || query.isLoading || Date.now() > query.invalidateAt;
  };

  readonly dehydrate = (): Record<string, QueryResult<unknown>> => {
    return Object.fromEntries(this.queries);
  };

  @action
  readonly hydrate = (cache: Record<string, QueryResult<unknown>>) => {
    this.queries = new Map(Object.entries(cache));
  };
}
