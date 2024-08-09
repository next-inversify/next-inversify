import { useService } from '@next-inversify/core/context';
import { QueryLoader } from '@next-inversify/query/query-loader';
import { QueryCache } from '@next-inversify/query/query.cache';
import { CompletedQuery } from '@next-inversify/query/query.types';
import { UseBaseQueryParams, useBaseQuery } from '@next-inversify/query/use-base-query';
import { useEffect, useRef, useState } from 'react';

import { GqlClient } from './gql.client';
import { GqlQueryParams, createQueryLoader } from './gql.loader';
import { ExtractResult, QueryFn } from './query-types';

type UseGqlQueryParams<Q extends QueryFn> = UseBaseQueryParams & GqlQueryParams<Q>;

export function useGqlQuery<Q extends QueryFn>(
  fn: Q,
  params: UseGqlQueryParams<Q> & { suspense: false },
): QueryLoader<ExtractResult<Q>>;
export function useGqlQuery<Q extends QueryFn>(
  fn: Q,
  params: UseGqlQueryParams<Q> & { lazy: true },
): QueryLoader<ExtractResult<Q>>;
export function useGqlQuery<Q extends QueryFn>(fn: Q, params?: UseGqlQueryParams<Q>): CompletedQuery<ExtractResult<Q>>;

export function useGqlQuery<Q extends QueryFn>(fn: Q, params: UseGqlQueryParams<Q> = {}) {
  const { suspense = true, lazy = false, ...rest } = params;

  const mountedRef = useRef(false);

  const gqlClient = useService(GqlClient);
  const queryCache = useService(QueryCache);

  const [loader, setLoader] = useState(() => createQueryLoader(fn, rest, queryCache, gqlClient));

  const variableKey = params.variables && QueryCache.stringifyKey([params.variables]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;

      return;
    }

    const loader = createQueryLoader(fn, rest, queryCache, gqlClient);
    setLoader(loader);
    loader.fetch();
  }, [variableKey]);

  return useBaseQuery(loader, { suspense, lazy });
}
