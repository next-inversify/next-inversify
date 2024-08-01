import { useService } from '@next-inversify/core/context';
import { useEffect } from 'react';

import { QueryCache } from './query.cache';
import { QueryState } from './query.state';

type UseHydrateCacheParams = {
  data?: Record<string, QueryState>;
};

/**
  hydrates the cache after server actions
 **/
export const useHydrateCache = (params: UseHydrateCacheParams) => {
  const queryCache = useService(QueryCache);

  useEffect(() => {
    const hydrationData: Record<string, QueryState> = {};

    for (const [key, data] of Object.entries(params.data || {})) {
      const query = queryCache.get(key);
      /**
        hydrate in case:
          - query doesn't have a staleAt which means it wasn't loaded on the server by some reason (failed query, etc)
          - query has a fresh staleAt
      **/
      if (!data.staleAt || (query.staleAt && data.staleAt > query.staleAt)) {
        hydrationData[key] = data;
      }
    }

    if (Object.keys(hydrationData).length !== 0) {
      queryCache.hydrate(hydrationData);
    }
  }, [params.data]);
};
