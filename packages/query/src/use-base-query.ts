import { useEffect } from 'react';

import { QueryLoader } from './query-loader';
import { CompletedQuery } from './query.types';

export type UseBaseQueryParams = {
  suspense?: boolean;
  lazy?: boolean;
};

export type UseBaseQueryLazyParams = Omit<UseBaseQueryParams, 'lazy'> & {
  lazy: true;
};

export function useBaseQuery<TData>(
  queryLoader: QueryLoader<TData>,
  params: UseBaseQueryParams,
): QueryLoader<TData> | CompletedQuery<TData> {
  const { suspense = true, lazy = false } = params;

  if (suspense && !lazy) {
    if (queryLoader.error) {
      throw queryLoader.error;
    }

    if (!queryLoader.isLoaded) {
      throw queryLoader.fetch();
    }
  }

  useEffect(() => {
    if (!lazy && queryLoader.staleAt && queryLoader.staleAt < Date.now()) {
      queryLoader.fetch();
    }

    if (!suspense && !lazy) {
      queryLoader.fetch();
    }
  }, [queryLoader.key]);

  return queryLoader;
}
