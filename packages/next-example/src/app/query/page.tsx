'use client';

import { useService } from '@next-inversify/core/src/context';
import { QueryCache } from '@next-inversify/query/query.cache';
import { useQuery } from '@next-inversify/query/use-query';
import { observer } from 'mobx-react-lite';
import { Suspense } from 'react';

import { EmbededQuery } from './embeded';
import { EmbededLazyQuery } from './lazy-query';

export default observer(function QueryPage() {
  const queryCache = useService(QueryCache);

  const catsFactQuery = useQuery({
    key: ['fact'],
    fn: async () => {
      const result = await fetch('https://catfact.ninja/fact').catch((error) => ({
        ok: false,
        statusText: error.message,
      }));

      if (!result.ok) throw new Error(result.statusText);

      const json: { fact: string } = await (result as Response).json();

      return json;
    },
    onSuccess: (data) => {
      console.log('onFetchSuccess', data);
    },
  });

  return (
    <div className="h-lvh m-8 flex flex-col gap-4">
      <div className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl rounded-xl border bg-gray-200 p-4">
        <div className="flex gap-2 items-center mb-2">
          <div className="text-md">Page query</div>
          <button
            className="rounded-md bg-sky-600 py-1 px-3 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
            onClick={() => catsFactQuery.fetch()}
          >
            refetch
          </button>
          <button
            className="rounded-md bg-sky-600 py-1 px-3 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
            onClick={() => queryCache.refetchQueries('fact')}
          >
            refetch with signal
          </button>
        </div>
        <div className="text-sm">{catsFactQuery.data.fact}</div>
      </div>

      <Suspense fallback="Loading...">
        <EmbededQuery />
      </Suspense>

      <EmbededLazyQuery />
    </div>
  );
});
