import type { DocumentNode } from 'graphql';
import type { Observable } from 'rxjs';

export type ExtractVariables<Q> =
  Q extends QueryFn<any, infer V> ? V : Q extends SubscriptionFn<any, infer V> ? V : never;

export type ExtractResult<Q> = Q extends QueryFn<infer R, any> ? R : Q extends SubscriptionFn<infer R, any> ? R : never;

export type GetSubscription<R, V> = (document: DocumentNode, variables?: V) => Observable<R>;

export type Request<R, V> = (document: DocumentNode, variables: V | undefined, headers?: HeadersInit) => Promise<R> | R;

export type QueryFn<R = any, V = any> = (request: Request<R, V>, variables: V, headers?: HeadersInit) => Promise<R> | R;

export type SubscriptionFn<R = any, V = any> = (
  getSubscription: GetSubscription<R, V>,
  variables: V,
  headers?: HeadersInit,
) => Observable<R>;
