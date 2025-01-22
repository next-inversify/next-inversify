/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from 'inversify';
import { action, makeObservable, observable } from 'mobx';

import { Query, QueryParams } from './query';
import { QueryState } from './query.state';
import { QueryKey } from './query.types';

@injectable()
export class QueryCache {
  @observable.shallow
  private cache = new Map<string, Query<any>>();

  constructor() {
    makeObservable(this);
  }

  get<TData>(key: QueryKey | QueryKey[], alias?: QueryKey | QueryKey[]): Query<TData> {
    const stringKey = Query.stringifyKey(key);

    const hasQuery = this.cache.has(stringKey);

    if (!hasQuery) {
      this.set(stringKey, Query.empty<TData>(stringKey));
    }

    const query = this.cache.get(stringKey)!;

    if (typeof alias !== 'undefined') {
      this.set(Query.stringifyKey(alias), query);
    }

    return query;
  }

  readonly buildQuery = <TData>(params: QueryParams<TData>) => {
    const key = Query.stringifyKey(params.key);

    const hasQuery = this.cache.has(key);

    if (!hasQuery) {
      this.set(key, Query.create<TData>(params));
    }

    const query = this.cache.get(key)!;

    if (typeof params.alias !== 'undefined') {
      this.set(Query.stringifyKey(params.alias), query);
    }

    return query;
  };

  readonly refetchQueries = (key: QueryKey | QueryKey[]) => {
    const stringKey = Array.isArray(key) ? Query.stringifyKey(key) : key.toString();

    const queries = Array.from(this.cache.values());

    queries.forEach((query) => {
      if (query.key.includes(stringKey) && query.hasParams) {
        query.fetch();
      }
    });
  };

  @action
  private set = <TData>(key: string, query: Query<TData>) => {
    this.cache.set(key, query);
  };

  readonly dehydrate = (): Record<string, QueryState> =>
    Object.fromEntries(Array.from(this.cache.entries()).map(([key, query]) => [key, Query.dehydrate(query)]));

  @action
  readonly hydrate = (cache: Record<string, QueryState>) => {
    for (const [key, data] of Object.entries(cache)) {
      this.cache.set(key, new Query(data));
    }
  };
}
