import { QueryLoader } from './query-loader';

type Overwrite<T1, T2> = {
  [P in Exclude<keyof T1, keyof T2>]: T1[P];
} & T2;

export type CompletedQuery<TData> = Overwrite<
  QueryLoader<TData>,
  {
    data: TData;
  }
>;

export type QueryKey = string | number | boolean | object;
