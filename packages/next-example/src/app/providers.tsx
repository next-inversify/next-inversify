'use client';

import { appContainer } from '@/core/app.container';
import { IOCProvider } from '@next-inversify/core/context';
import { QueryCacheProvider } from '@next-inversify/query/query-cache.provider';
import { QueryState } from '@next-inversify/query/query.state';

type ProvidersProps = Readonly<{
  children: React.ReactNode;
  cacheData?: Record<string, QueryState>;
}>;

export function Providers(props: ProvidersProps) {
  const container = appContainer();

  return (
    <IOCProvider container={container}>
      <QueryCacheProvider cacheData={props.cacheData}>{props.children}</QueryCacheProvider>
    </IOCProvider>
  );
}
