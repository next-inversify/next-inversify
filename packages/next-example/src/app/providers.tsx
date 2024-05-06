'use client';

import { appContainer } from '@/core/app.container';
import { IOCProvider } from '@next-inversify/core';
import { QueryCacheProvider } from '@next-inversify/query/query-cache.provider';

type ProvidersProps = Readonly<{
  children: React.ReactNode;
}>;

export function Providers(props: ProvidersProps) {
  return (
    <IOCProvider container={appContainer()}>
      <QueryCacheProvider>{props.children}</QueryCacheProvider>
    </IOCProvider>
  );
}
