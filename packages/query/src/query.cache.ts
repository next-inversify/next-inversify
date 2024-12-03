/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from 'inversify';
import { action, makeObservable, observable } from 'mobx';

import { Query } from './query';
import { SignalObservable, createSignal } from './query.signal';
import { QueryState } from './query.state';
import { QueryKey } from './query.types';

@injectable()
export class QueryCache {
  private signal$$ = createSignal<QueryCacheSignal>();

  readonly signal$: SignalObservable<QueryCacheSignal>;

  @observable.shallow
  private cache = new Map<string, Query<any>>();

  constructor() {
    makeObservable(this);

    this.signal$ = this.signal$$.asObservable();
  }

  get<TData>(key: QueryKey | QueryKey[], alias?: QueryKey | QueryKey[]): Query<TData> {
    const stringKey = Array.isArray(key) ? QueryCache.stringifyKey(key) : key.toString();
    const aliasKey = Array.isArray(alias) ? QueryCache.stringifyKey(alias) : alias?.toString();

    let query = this.cache.get(stringKey);

    if (!query) {
      query = Query.empty<TData>(stringKey);

      this.set(stringKey, query);
    }

    if (aliasKey) {
      this.set(aliasKey, query);
    }

    return query;
  }

  readonly refetchQueries = (key: QueryKey | QueryKey[]) => {
    const stringKey = Array.isArray(key) ? QueryCache.stringifyKey(key) : key.toString();

    this.signal$$.next({ kind: 'refetchQueries', key: stringKey });
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

  static stringifyKey = (key: QueryKey[]): string => {
    const allowedTypes = ['string', 'number', 'boolean'];

    const parts = key.map((part) => {
      if (allowedTypes.includes(typeof part)) {
        return part;
      }

      return JSON.stringify(part);
    });

    return parts.join(':');
  };
}

export type QueryCacheSignal = {
  kind: 'refetchQueries';
  key: string;
};
