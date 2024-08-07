import { Request } from '@next-inversify/gql/query-types';
import gql from 'graphql-tag';

export type GetCapsuleQueryVariables = {
  id: string;
};

export type GetCapsuleQuery = {
  __typename?: 'Query';
  capsule: {
    id: string;
    landings?: number | null;
    original_launch?: Date | null;
    reuse_count: number;
    status: string;
    type: string;
  };
};

export const GetCapsuleDocument = gql`
  query GetCapsule($id: ID!) {
    capsule(id: $id) {
      id
      landings
      original_launch
      reuse_count
      status
      type
    }
  }
`;

export function GetCapsule<R extends GetCapsuleQuery, V extends GetCapsuleQueryVariables>(
  request: Request<R, V>,
  variables: V,
  headers?: HeadersInit,
) {
  return request(GetCapsuleDocument, variables, headers);
}
