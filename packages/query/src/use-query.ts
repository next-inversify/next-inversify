import { useService } from '@next-inversify/core/context';
import { useEffect, useRef, useState } from 'react';

import { QueryLoader, QueryLoaderParams } from './query-loader';
import { QueryCache } from './query.cache';
import { CompletedQuery } from './query.types';
import { UseBaseQueryParams, useBaseQuery } from './use-base-query';

export type UseQueryParams<TData> = UseBaseQueryParams & QueryLoaderParams<TData>;

export function useQuery<TData>(params: UseQueryParams<TData> & { suspense: false }): QueryLoader<TData>;
export function useQuery<TData>(params: UseQueryParams<TData> & { lazy: true }): QueryLoader<TData>;
export function useQuery<TData>(params: UseQueryParams<TData>): CompletedQuery<TData>;

export function useQuery<TData>(params: UseQueryParams<TData>) {
  const { suspense, lazy, ...rest } = params;

  const keyRef = useRef<string | boolean>();

  const queryCache = useService(QueryCache);

  const [loader, setLoader] = useState(() => {
    keyRef.current = QueryCache.stringifyKey(Array.isArray(rest.key) ? rest.key : [rest.key]);

    return new QueryLoader(queryCache, rest);
  });

  const key = QueryCache.stringifyKey(Array.isArray(rest.key) ? rest.key : [rest.key]);

  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;

      const loader = new QueryLoader(queryCache, rest);
      setLoader(loader);
      loader.fetch();
    }
  }, [key]);

  return useBaseQuery(loader, { suspense, lazy });
}
