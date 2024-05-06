'use client';

import { useService } from '@next-inversify/core';
import { QueryLoader } from '@next-inversify/query/query.loader';
import { Suspense } from 'react';
import { EmbededQuery } from './embeded';

export default function QueryPage() {
  const queryLoader = useService(QueryLoader);

  const { data } = queryLoader.querySuspense({
    fetcher: () => fetch('https://catfact.ninja/fact').then((res) => res.json()),
    key: 'fact',
  });

  return (
    <div className="h-lvh">
      <div>{data.fact}</div>

      <div className="border">
        <div>Embeded query</div>
        <Suspense fallback="Loading...">
          <EmbededQuery />
        </Suspense>
      </div>
    </div>
  );
}
