import { QueryLoader } from '@next-inversify/query';
import { getOperationAST } from 'graphql';
import { injectable } from 'inversify';

import { GqlClient } from './gql.client';
import { ExtractResult, ExtractVariables, QueryFn } from './query-types';

@injectable()
export class GqlLoader {
  constructor(
    private readonly gqlClient: GqlClient,
    private readonly queryLoader: QueryLoader,
  ) {}

  readonly query = async <Q extends QueryFn>(
    queryFn: Q,
    variables?: ExtractVariables<Q>,
    headers?: HeadersInit,
  ): Promise<ExtractResult<Q>> =>
    queryFn(
      async (document, ...rest) => {
        const name = getOperationAST(document)?.name?.value;

        if (!name) {
          throw new Error('Query must have a name');
        }

        const { data } = await this.queryLoader.query({
          key: name,
          fetcher: () => this.gqlClient.query(document, ...rest),
        });

        return data;
      },
      variables,
      headers,
    );

  readonly querySuspense = <Q extends QueryFn>(
    queryFn: Q,
    variables?: ExtractVariables<Q>,
    headers?: HeadersInit,
  ): ExtractResult<Q> =>
    queryFn(
      (document, ...rest) => {
        const name = getOperationAST(document)?.name?.value;

        if (!name) {
          throw new Error('Query must have a name');
        }

        return this.queryLoader.querySuspense({
          key: name,
          fetcher: () => this.gqlClient.query(document, ...rest),
        });
      },
      variables,
      headers,
    );
}
