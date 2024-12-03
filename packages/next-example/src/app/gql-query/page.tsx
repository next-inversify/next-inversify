'use client';

import { GetCompany } from '@/core/api/get-company.gql.generated';
import { useService } from '@next-inversify/core/context';
import { getKey } from '@next-inversify/gql/gql.loader';
import { useGqlQuery } from '@next-inversify/gql/use-gql-query';
import { QueryCache } from '@next-inversify/query/query.cache';
import { observer } from 'mobx-react-lite';
import { Suspense } from 'react';

import { EmbededQuery } from './embeded';

export default observer(function QueryPage() {
  const queryCache = useService(QueryCache);
  const companyQuery = useGqlQuery(GetCompany);

  return (
    <div className="h-lvh m-8 flex flex-col gap-4">
      <div className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl rounded-xl border bg-gray-200 p-4">
        <div className="flex gap-2 items-center mb-2">
          <div className="text-md">Company query</div>
          <button
            className="rounded-md bg-sky-600 py-1 px-3 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
            onClick={() => companyQuery.fetch()}
          >
            refetch
          </button>
          <button
            className="rounded-md bg-sky-600 py-1 px-3 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
            onClick={() => queryCache.refetchQueries(getKey(GetCompany, {}))}
          >
            refetch with signal
          </button>
        </div>
        <div className="text-sm">{companyQuery.data.company.name}</div>
        <div className="text-sm">{companyQuery.data.company.founded}</div>
        <div className="text-sm">{companyQuery.data.company.founder}</div>

        <div className="text-sm mt-2">
          <pre>
            {JSON.stringify(
              {
                key: companyQuery.key,
                isLoading: companyQuery.isLoading,
                isLoaded: companyQuery.isLoaded,
                error: companyQuery.error,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>

      <Suspense fallback="Loading...">
        <EmbededQuery />
      </Suspense>
    </div>
  );
});
