/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from 'inversify';
import { action, makeObservable, observable } from 'mobx';

import { Query } from './query';
import { QueryState } from './query.state';
import { QueryKey } from './query.types';

@injectable()
export class QueryCache {
  @observable.shallow
  private cache = new Map<string, Query<any>>();

  constructor() {
    makeObservable(this);
  }

  get<TData>(key: QueryKey): Query<TData>;
  get<TData>(key: QueryKey[]): Query<TData>;
  get<TData>(key: any): Query<TData> {
    const stringKey = Array.isArray(key) ? QueryCache.stringifyKey(key) : key;

    let query = this.cache.get(stringKey);

    if (!query) {
      query = Query.empty<TData>(stringKey);

      this.set(stringKey, query);
    }

    return query;
  }

  @action
  private set = <TData>(key: string, query: Query<TData>) => {
    this.cache.set(key, query);
  };

  dehydrate = (): Record<string, QueryState> =>
    Object.fromEntries(Array.from(this.cache.entries()).map(([key, query]) => [key, Query.dehydrate(query)]));

  @action
  hydrate = (cache: Record<string, QueryState>) => {
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
