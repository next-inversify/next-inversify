import { useService } from '@next-inversify/core/context';
import { Query } from '@next-inversify/query/query';
import { QueryCache } from '@next-inversify/query/query.cache';
import { CompletedQuery } from '@next-inversify/query/query.types';
import { UseBaseQueryParams, useBaseQuery } from '@next-inversify/query/use-base-query';
import { useEffect, useState } from 'react';

import { GqlClient } from './gql.client';
import { GqlQueryParams, getParams } from './gql.loader';
import { ExtractResult, QueryFn } from './query-types';

type UseGqlQueryParams<Q extends QueryFn> = UseBaseQueryParams & GqlQueryParams<Q>;

export function useGqlQuery<Q extends QueryFn>(
  fn: Q,
  params: UseGqlQueryParams<Q> & { suspense: false },
): Query<ExtractResult<Q>>;
export function useGqlQuery<Q extends QueryFn>(
  fn: Q,
  params: UseGqlQueryParams<Q> & { lazy: true },
): Query<ExtractResult<Q>>;
export function useGqlQuery<Q extends QueryFn>(fn: Q, params?: UseGqlQueryParams<Q>): CompletedQuery<ExtractResult<Q>>;

export function useGqlQuery<Q extends QueryFn>(fn: Q, params: UseGqlQueryParams<Q> = {}) {
  const { suspense = true, lazy = false, ...rest } = params;

  const queryCache = useService(QueryCache);
  const gqlClient = useService(GqlClient);

  const [query, setQuery] = useState(() => queryCache.buildQuery(getParams(fn, rest, gqlClient)));

  useEffect(() => {
    const params = getParams(fn, rest, gqlClient);

    const newQuery = queryCache.buildQuery(params);

    if (newQuery !== query) {
      setQuery(newQuery);
    } else {
      query.setParams(params);
    }
  }, [params]);

  return useBaseQuery(query, queryCache, { suspense, lazy });
}
