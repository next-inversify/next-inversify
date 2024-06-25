import { useService } from '@next-inversify/core/context';
import { useState } from 'react';

import { QueryLoader, QueryLoaderParams } from './query-loader';
import { QueryCache } from './query.cache';
import { QueryCompleted } from './query.types';
import { UseBaseQueryParams, useBaseQuery } from './use-base-query';

export type UseQueryParams<TData> = UseBaseQueryParams & QueryLoaderParams<TData>;

export function useQuery<TData>(params: UseQueryParams<TData> & { suspense: false }): QueryLoader<TData>;
export function useQuery<TData>(params: UseQueryParams<TData> & { lazy: true }): QueryLoader<TData>;
export function useQuery<TData>(params: UseQueryParams<TData>): QueryCompleted<TData>;

export function useQuery<TData>(params: UseQueryParams<TData>) {
  const { suspense, lazy, ...rest } = params;

  const queryCache = useService(QueryCache);

  const [loader] = useState(() => new QueryLoader(queryCache, rest));

  return useBaseQuery(loader, { suspense, lazy });
}
