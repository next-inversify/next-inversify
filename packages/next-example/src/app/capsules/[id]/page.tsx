'use client';

import { GetCapsule, GetCapsuleQuery } from '@/core/api/get-capsule.gql.generated';
import { useService } from '@next-inversify/core/src/context';
import { useGqlQuery } from '@next-inversify/gql/use-gql-query';
import { QueryCache } from '@next-inversify/query/query.cache';
import { observer } from 'mobx-react-lite';

type CapsulePageProps = {
  params: {
    id: string;
  };
};

export default observer(function Page(props: CapsulePageProps) {
  useGqlQuery(GetCapsule, { variables: { id: props.params.id }, alias: ['capsule'] });

  const queryCache = useService(QueryCache);

  const { data } = queryCache.get<GetCapsuleQuery>(['capsule']);

  if (!data) {
    // won't happen because it's a suspense query
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Capsule</h1>

      <div>
        <h2>{data.capsule.id}</h2>
        <p>{data.capsule.landings}</p>
        <p>{data.capsule.original_launch?.toString()}</p>
        <p>{data.capsule.reuse_count}</p>
        <p>{data.capsule.status}</p>
        <p>{data.capsule.type}</p>
      </div>
    </div>
  );
});
