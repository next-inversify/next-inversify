import { useService } from '@next-inversify/core/context';
import { QueryLoader } from '@next-inversify/query/query-loader';
import { QueryCache } from '@next-inversify/query/query.cache';
import { QueryCompleted } from '@next-inversify/query/query.types';
import { UseBaseQueryParams, useBaseQuery } from '@next-inversify/query/use-base-query';
import { useState } from 'react';

import { GqlClient } from './gql.client';
import { GqlQueryParams, createQueryLoader } from './gql.loader';
import { ExtractResult, QueryFn } from './query-types';

type UseGqlQueryParams<TData> = UseBaseQueryParams & GqlQueryParams<QueryFn<TData>>;

export function useGqlQuery<Q extends QueryFn>(
  fn: Q,
  params: UseGqlQueryParams<ExtractResult<Q>> & { suspense: false },
): QueryLoader<ExtractResult<Q>>;
export function useGqlQuery<Q extends QueryFn>(
  fn: Q,
  params: UseGqlQueryParams<ExtractResult<Q>> & { lazy: true },
): QueryLoader<ExtractResult<Q>>;
export function useGqlQuery<Q extends QueryFn>(
  fn: Q,
  params?: UseGqlQueryParams<ExtractResult<Q>>,
): QueryCompleted<ExtractResult<Q>>;

export function useGqlQuery<Q extends QueryFn>(fn: Q, params: UseGqlQueryParams<ExtractResult<Q>> = {}) {
  const { suspense = true, lazy = false, ...rest } = params;

  const gqlClient = useService(GqlClient);
  const queryCache = useService(QueryCache);

  const [loader] = useState(() => createQueryLoader(fn, rest, queryCache, gqlClient));

  return useBaseQuery(loader, { suspense, lazy });
}
