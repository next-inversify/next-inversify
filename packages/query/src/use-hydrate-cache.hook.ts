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

    for (const [key, newState] of Object.entries(params.data || {})) {
      const cachedState = queryCache.get(key);
      /**
        hydrate in case:
          - new query doesn't have a staleAt which means it wasn't loaded on the server by some reason (failed query, etc) - cleans data
          - old query doesn't have a staleAt which means (new query was loaded on the server) - inserts data
          - new query has a staleAt which is fresher than the one in the cache - updates data
      **/
      if (!newState.staleAt || !cachedState.staleAt || newState.staleAt > cachedState.staleAt) {
        hydrationData[key] = newState;
      }
    }

    if (Object.keys(hydrationData).length !== 0) {
      queryCache.hydrate(hydrationData);
    }
  }, [params.data]);
};
