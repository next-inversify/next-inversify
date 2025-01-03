import { useEffect } from 'react';

import { Query } from './query';
import { QueryCache } from './query.cache';
import { CompletedQuery } from './query.types';

export type UseBaseQueryParams = {
  suspense?: boolean;
  lazy?: boolean;
};

export type UseBaseQueryLazyParams = Omit<UseBaseQueryParams, 'lazy'> & {
  lazy: true;
};

export function useBaseQuery<TData>(
  query: Query<TData>,
  queryCache: QueryCache,
  params: UseBaseQueryParams,
): Query<TData> | CompletedQuery<TData> {
  const { suspense = true, lazy = false } = params;

  if (suspense && !lazy) {
    if (query.error) {
      throw query.error;
    }

    if (!query.isLoaded || query.isLoading) {
      throw query.fetch();
    }
  }

  useEffect(() => {
    if (!lazy && query.staleAt && query.staleAt < Date.now()) {
      query.fetch();
    }

    if (!suspense && !lazy) {
      query.fetch();
    }

    return queryCache.signal$.subscribe((signal) => {
      switch (signal.kind) {
        case 'refetchQueries':
          if (query.key.includes(signal.key)) {
            query.fetch();
          }
      }
    });
  }, [query.key]);

  return query;
}
