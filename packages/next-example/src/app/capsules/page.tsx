'use client';

import { GetCapsules } from '@/core/api/get-capsules.gql.generated';
import { useGqlQuery } from '@next-inversify/gql/use-gql-query';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';

export default observer(function Page() {
  const { data } = useGqlQuery(GetCapsules);

  return (
    <div>
      <h1>Capsules</h1>
      <ul>
        {data?.capsules.map((capsule) => (
          <li key={capsule.id}>
            <Link href={`/capsules/${capsule.id}`}>
              {capsule.id} - {capsule.status} - {capsule.type}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});
