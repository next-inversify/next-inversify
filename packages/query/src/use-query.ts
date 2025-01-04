import { useService } from '@next-inversify/core/context';

import { Query, QueryParams } from './query';
import { QueryCache } from './query.cache';
import { CompletedQuery } from './query.types';
import { UseBaseQueryParams, useBaseQuery } from './use-base-query';

export type UseQueryParams<TData> = UseBaseQueryParams & QueryParams<TData>;

export function useQuery<TData>(params: UseQueryParams<TData> & { suspense: false }): Query<TData>;
export function useQuery<TData>(params: UseQueryParams<TData> & { lazy: true }): Query<TData>;
export function useQuery<TData>(params: UseQueryParams<TData>): CompletedQuery<TData>;

export function useQuery<TData>(params: UseQueryParams<TData>) {
  const { suspense, lazy, ...rest } = params;

  const queryCache = useService(QueryCache);

  const query = queryCache.buildQuery(rest);

  query.setParams(rest);

  return useBaseQuery(query, queryCache, { suspense, lazy });
}
