import { useService } from '@next-inversify/core/context';

import { Query, QueryParams } from './query';
import { QueryStore } from './query.store';
import { QueryCompleted } from './query.types';
import { UseBaseQueryParams, useBaseQuery } from './use-base-query';

export type UseQueryParams<TData> = UseBaseQueryParams & QueryParams<TData>;

export function useQuery<TData>(params: UseQueryParams<TData> & { suspense: false }): Query<TData>;
export function useQuery<TData>(params: UseQueryParams<TData> & { lazy: true }): Query<TData>;
export function useQuery<TData>(params: UseQueryParams<TData>): QueryCompleted<TData>;

export function useQuery<TData>(params: UseQueryParams<TData>) {
  const { suspense, lazy, ...rest } = params;

  const { getQuery } = useService(QueryStore);

  const query = getQuery(rest);

  return useBaseQuery(query, { suspense, lazy });
}
