'use client';

import { GetCompany } from '@/core/api/get-company.gql.generated';
import { useGqlQuery } from '@next-inversify/gql/use-gql-query';
import { observer } from 'mobx-react-lite';
import { Suspense } from 'react';

import { EmbededQuery } from './embeded';

export default observer(function QueryPage() {
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
        </div>
        <div className="text-sm">{companyQuery.data.company.name}</div>
        <div className="text-sm">{companyQuery.data.company.founded}</div>
        <div className="text-sm">{companyQuery.data.company.founder}</div>
      </div>

      <Suspense fallback="Loading...">
        <EmbededQuery />
      </Suspense>
    </div>
  );
});
