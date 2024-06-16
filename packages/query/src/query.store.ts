import { injectable } from 'inversify';

import { Query, QueryParams } from './query';
import { QueryState } from './query.state';

@injectable()
export class QueryStore {
  private prefetched = new Map<string, QueryState>();

  private queries = new Map<string, Query<any>>();

  getQuery = <TData>(params: QueryParams<TData>): Query<TData> => {
    const key = Query.stringifyKey(params.key);

    let query = this.queries.get(key);

    if (!query) {
      query = new Query(params, this.prefetched.get(key));

      this.queries.set(key, query);
    }

    return query;
  };

  dehydrate = (): Record<string, QueryState> =>
    Object.fromEntries(Array.from(this.queries.entries()).map(([key, query]) => [key, Query.dehydrate(query)]));

  hydrate = (cache: Record<string, any>) => {
    for (const [key, data] of Object.entries(cache)) {
      this.prefetched.set(key, data);
    }
  };
}
