import { DocumentNode, ExecutionResult, getOperationAST, print } from 'graphql';
import { Client, createClient } from 'graphql-ws';
import { injectable } from 'inversify';
import { Observable, filter, map, retry, share } from 'rxjs';

import { ScalarExchangeResult } from './custom-scalar.exchange';
import { Disposable } from '@next-inversify/core/utils';
import { Logger } from './logger';
import { RetryStrategy } from './retry-strategy';

type Config = {
  scalarExchange?: ScalarExchangeResult;
  wsUrl: string;
  wsTeardown$?: Observable<unknown>;
  getAuthHeaders: () => Promise<Record<string, string>>;
  logger?: Logger;
};

@injectable()
export class GqlWSClient extends Disposable {
  private readonly clientWS: Client;

  private activeSocket?: WebSocket;

  private timedout?: NodeJS.Timeout;

  constructor(private readonly config: Config) {
    super();

    this.clientWS = createClient({
      url: config.wsUrl,
      keepAlive: 5000,
      connectionParams: this.config.getAuthHeaders,
      on: {
        connected: (socket) => {
          this.activeSocket = socket as WebSocket;
        },
        ping: (received) => {
          this.config.logger?.debug('Ping received', received);
          if (!received)
            this.timedout = setTimeout(() => {
              if (this.activeSocket?.readyState === WebSocket.OPEN) {
                this.config.logger?.debug('Ping timeout, closing connection');
                this.activeSocket.close(4408, 'Request Timeout');
              } else {
                this.config.logger?.debug('Ping timeout, connection already closed', this.activeSocket?.readyState);
              }
            }, 2000);
        },
        pong: (received) => {
          this.config.logger?.debug('Pong received', received);
          if (received) {
            clearTimeout(this.timedout);
          }
        },
      },
    });

    if (this.config.wsTeardown$) {
      this.autoDispose(
        this.config.wsTeardown$.subscribe(() => {
          if (this.clientWS) {
            this.clientWS.terminate();
          }
        }),
      );
    }
  }

  readonly getSubscription = <R, V = never>(subscription: DocumentNode, variables?: V): Observable<R> => {
    const name = getOperationAST(subscription)?.name?.value;

    return new Observable<ExecutionResult<R, unknown>>((subscriber) => {
      this.config.logger?.debug(`[Subscription - ${name}]`, variables);

      return this.clientWS.subscribe<R>(
        {
          query: print(subscription),
          variables: variables as Record<string, unknown>,
        },
        subscriber,
      );
    }).pipe(
      retry(
        RetryStrategy({
          eagerDelayMs: 1000,
          label: `[Subscription - ${name}] connection lost`,
        }),
      ),
      map(
        ({ data }) =>
          this.config.scalarExchange?.parse({
            operation: {
              query: subscription,
            },
            data,
          }).data,
      ),
      filter((data): data is R => Boolean(data)),
      share({
        resetOnComplete: false,
        resetOnError: false,
        resetOnRefCountZero: true,
      }),
    );
  };
}
