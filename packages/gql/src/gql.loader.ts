/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryParams } from '@next-inversify/query/query';
import { QueryKey } from '@next-inversify/query/query.types';
import { DocumentNode, getOperationAST } from 'graphql';

import { GqlClient } from './gql.client';
import { ExtractResult, ExtractVariables, QueryFn } from './query-types';

export type GqlQueryParams<Q extends QueryFn> = Omit<QueryParams<ExtractResult<Q>>, 'fn' | 'key'> & {
  key?: QueryKey | QueryKey[];
  variables?: ExtractVariables<Q>;
  headers?: HeadersInit;
};

export const getKey = <Q extends QueryFn>(queryFn: Q, params: GqlQueryParams<Q> | undefined): QueryKey | QueryKey[] => {
  const [key] = extractFn(queryFn, params);

  return key;
};

export const extractFn = <Q extends QueryFn>(
  queryFn: Q,
  params: GqlQueryParams<Q> | undefined,
): [key: QueryKey | QueryKey[], document: DocumentNode] => {
  const { key, variables } = params || {};

  return queryFn((document) => {
    const name = getOperationAST(document)?.name?.value;

    if (!name) {
      throw new Error('Query must have a name');
    }

    return [key || [name, variables], document];
  }, variables);
};

export const getParams = <Q extends QueryFn>(
  queryFn: Q,
  params: GqlQueryParams<Q> | undefined,
  gqlClient: GqlClient,
): QueryParams<ExtractResult<Q>> => {
  const { key: keyOverride, variables, headers, ...restParams } = params || {};

  const [key, document] = extractFn(queryFn, params);

  return {
    key: keyOverride || key,
    fn: () => gqlClient.query(document, variables, headers) as Promise<ExtractResult<Q>>,
    ...restParams,
  };
};
