import { DocumentNode, getOperationAST, print } from 'graphql';
import { BatchRequestDocument, GraphQLClient, Variables } from 'graphql-request';
import { injectable } from 'inversify';

import { ScalarExchangeResult } from './custom-scalar.exchange';
import { Logger } from './logger';

type BatchedRequest = {
  promise: Promise<BatchedResult>;
  documents: BatchRequestDocument[];
  headers?: HeadersInit;
};

type Result = {
  data: any;
};

type BatchedResult = [Result, ...Result[]];

type Config = {
  url: string;
  scalarExchange?: ScalarExchangeResult;
  getAuthHeaders?: () => Promise<HeadersInit>;
  batch?: false | { timeMs?: number };
  logger?: Logger;
};

@injectable()
export class GqlClient {
  readonly client: GraphQLClient;

  private readonly batchedRequests: BatchedRequest[] = [];

  constructor(private readonly config: Config) {
    this.client = new GraphQLClient(config.url);
  }

  readonly query = async <R, Variables extends Record<string, unknown>>(
    query: DocumentNode,
    variables?: Variables,
    headers?: HeadersInit,
  ): Promise<R> => {
    const name = getOperationAST(query)?.name?.value;

    const authHeaders = await this.config.getAuthHeaders?.();

    const requestHeaders = {
      ...authHeaders,
      ...headers,
    };

    this.config.logger?.debug(`[Query - ${name}]`, variables);

    const result = await (this.config.batch
      ? this.queryWithBatch<R>(query, variables, requestHeaders)
      : this.client.request<R>(query, variables, requestHeaders));

    const parsed = this.config.scalarExchange
      ? this.config.scalarExchange.parse({
          operation: {
            query,
          },
          data: result,
        }).data
      : result;

    this.config.logger?.debug(`[Query Result - ${name}]`, parsed);

    return parsed;
  };

  readonly upload = async <Result, Variables = never>(
    query: DocumentNode,
    variables?: Variables,
    headers?: HeadersInit,
  ): Promise<Result> => {
    const formData = new FormData();
    formData.append(
      'operations',
      JSON.stringify({
        query: print(query),
        variables,
      }),
    );

    const files: unknown[] = [];
    const fileMap: Record<string, string[]> = {};

    // todo: support multiple files upload
    if (typeof variables === 'object' && variables !== null && 'file' in variables) {
      files.push(variables.file);
      variables.file = null;
    }

    files.forEach((file, index) => {
      fileMap[index] = ['variables.file'];
      formData.append(index.toString(), file as File);
    });

    formData.append('map', JSON.stringify(fileMap));

    const authHeaders = await this.config.getAuthHeaders?.();

    const result = await fetch(this.config.url, {
      method: 'POST',
      body: formData,
      headers: { ...authHeaders, ...headers },
    });

    const data = await result.json();

    const parsed = this.config.scalarExchange
      ? this.config.scalarExchange.parse({
          operation: {
            query,
          },
          data,
        }).data
      : data;

    return parsed;
  };

  private runTimer = (ms: number): Promise<BatchedResult> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const batchedRequest = this.batchedRequests.shift();

        if (!batchedRequest) {
          return reject();
        }

        const { documents, headers } = batchedRequest;

        this.client
          .batchRequests(documents, headers)
          .then((result) => resolve(result))
          .catch((error) => reject(error));
      }, ms);
    });
  };

  private queryWithBatch = async <R>(
    document: DocumentNode,
    variables?: Variables,
    headers?: HeadersInit,
  ): Promise<R> => {
    if (!this.config.batch) throw new Error('Batching is not enabled');

    const id = this.batchedRequests.length ? this.batchedRequests.length - 1 : 0;

    const batchedRequest = this.batchedRequests[id] || {
      promise: this.runTimer(this.config.batch.timeMs || 50),
      documents: [],
    };

    batchedRequest.documents.push({ document, variables });

    if (headers) {
      batchedRequest.headers = headers;
    }

    this.batchedRequests[id] = batchedRequest;

    const index = batchedRequest.documents.length - 1;

    return batchedRequest.promise.then((result) => result[index] as R);
  };
}
