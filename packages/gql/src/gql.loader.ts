import { QueryStore } from '@next-inversify/query';
import { Query, QueryParams } from '@next-inversify/query/query';
import { QueryCompleted } from '@next-inversify/query/query.types';
import { getOperationAST } from 'graphql';
import { injectable } from 'inversify';

import { GqlClient } from './gql.client';
import { ExtractResult, ExtractVariables, QueryFn } from './query-types';

export type GqlQueryParams<Q> = Omit<QueryParams<ExtractResult<Q>>, 'fn' | 'key'> & {
  key?: any[];
  variables?: ExtractVariables<Q>;
  headers?: HeadersInit;
};

export const createQuery = <Q extends QueryFn>(
  queryFn: Q,
  params: GqlQueryParams<Q> | undefined,
  queryStore: QueryStore,
  gqlClient: GqlClient,
): Query<ExtractResult<Q>> => {
  const { key, variables, headers, ...restParams } = params || {};

  return queryFn(
    (document, ...rest) => {
      const name = getOperationAST(document)?.name?.value;

      if (!name) {
        throw new Error('Query must have a name');
      }

      const query = queryStore.getQuery({
        key: [name, variables],
        fn: () => gqlClient.query(document, ...rest),
        ...restParams,
      });

      return query;
    },
    variables,
    headers,
  );
};

@injectable()
export class GqlLoader {
  constructor(
    private readonly gqlClient: GqlClient,
    private readonly queryStore: QueryStore,
  ) {}

  readonly query = async <Q extends QueryFn>(
    fn: Q,
    params?: GqlQueryParams<Q>,
  ): Promise<QueryCompleted<ExtractResult<Q>>> => {
    const query = createQuery(fn, params, this.queryStore, this.gqlClient);

    return query.fetch();
  };
}
