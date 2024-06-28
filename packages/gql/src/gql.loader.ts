/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryLoader, QueryLoaderParams } from '@next-inversify/query/query-loader';
import { QueryCache } from '@next-inversify/query/query.cache';
import { getOperationAST } from 'graphql';

import { GqlClient } from './gql.client';
import { ExtractResult, ExtractVariables, QueryFn } from './query-types';

export type GqlQueryParams<Q extends QueryFn> = Omit<QueryLoaderParams<ExtractResult<Q>>, 'fn' | 'key'> & {
  key?: any[];
  variables?: ExtractVariables<Q>;
  headers?: HeadersInit;
};

export const getKey = <Q extends QueryFn>(queryFn: Q, params: GqlQueryParams<Q> | undefined): any[] => {
  const { key, variables } = params || {};

  return queryFn((document) => {
    const name = getOperationAST(document)?.name?.value;

    if (!name) {
      throw new Error('Query must have a name');
    }

    return key || [name, variables];
  }, variables);
};

export const createQueryLoader = <Q extends QueryFn>(
  queryFn: Q,
  params: GqlQueryParams<Q> | undefined,
  queryCache: QueryCache,
  gqlClient: GqlClient,
): QueryLoader<ExtractResult<Q>> => {
  const { key, variables, headers, ...restParams } = params || {};

  return queryFn(
    (document, ...rest) => {
      const name = getOperationAST(document)?.name?.value;

      if (!name) {
        throw new Error('Query must have a name');
      }

      return new QueryLoader(queryCache, {
        key: key || getKey(queryFn, params),
        fn: () => gqlClient.query(document, ...rest) as Promise<ExtractResult<Q>>,
        ...restParams,
      });
    },
    variables,
    headers,
  );
};
