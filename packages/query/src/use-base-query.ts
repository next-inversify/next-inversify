import { useEffect } from 'react';

import { Query } from './query';
import { QueryCompleted } from './query.types';

export type UseBaseQueryParams = {
  suspense?: boolean;
  lazy?: boolean;
};

export type UseBaseQueryLazyParams = Omit<UseBaseQueryParams, 'lazy'> & {
  lazy: true;
};

export function useBaseQuery<TData>(
  query: Query<TData>,
  params: UseBaseQueryParams,
): Query<TData> | QueryCompleted<TData> {
  const { suspense = true, lazy = false } = params;

  if (suspense && !lazy) {
    if (query.error) {
      throw query.error;
    }

    if (!query.isLoaded) {
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
  }, [query.key]);

  return query;
}
