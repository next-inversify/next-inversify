import { useService } from '@next-inversify/core/context';
import { Query } from '@next-inversify/query/query';
import { QueryStore } from '@next-inversify/query/query.store';
import { QueryCompleted } from '@next-inversify/query/query.types';
import { UseBaseQueryParams, useBaseQuery } from '@next-inversify/query/use-base-query';

import { GqlClient } from './gql.client';
import { GqlQueryParams, createQuery } from './gql.loader';
import { ExtractResult, QueryFn } from './query-types';

type UseGqlQueryParams<TData> = UseBaseQueryParams & GqlQueryParams<QueryFn<TData>>;

export function useGqlQuery<Q extends QueryFn>(
  fn: Q,
  params: UseGqlQueryParams<ExtractResult<Q>> & { suspense: false },
): Query<ExtractResult<Q>>;
export function useGqlQuery<Q extends QueryFn>(
  fn: Q,
  params: UseGqlQueryParams<ExtractResult<Q>> & { lazy: true },
): Query<ExtractResult<Q>>;
export function useGqlQuery<Q extends QueryFn>(
  fn: Q,
  params?: UseGqlQueryParams<ExtractResult<Q>>,
): QueryCompleted<ExtractResult<Q>>;

export function useGqlQuery<Q extends QueryFn>(fn: Q, params: UseGqlQueryParams<ExtractResult<Q>> = {}) {
  const { suspense = true, lazy = false, ...rest } = params;

  const gqlClient = useService(GqlClient);
  const queryStore = useService(QueryStore);

  const query = createQuery(fn, rest, queryStore, gqlClient);

  return useBaseQuery(query, { suspense, lazy });
}
