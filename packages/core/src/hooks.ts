import { interfaces } from 'inversify';
import { useMemo } from 'react';

import { useIOCContext } from './ioc.context';

export const useService = <T>(id: interfaces.ServiceIdentifier<T>): T => {
  const { container } = useIOCContext();
  return useMemo(() => container.get<T>(id), [container, id]);
};

export const useAllServices = <T>(id: interfaces.ServiceIdentifier<T>): T[] => {
  const { container } = useIOCContext();
  return useMemo(() => container.getAll<T>(id), [container, id]);
};

export const useNamedService = <T>(id: interfaces.ServiceIdentifier<T>, named: string | number | symbol): T => {
  const { container } = useIOCContext();
  return useMemo(() => container.getNamed<T>(id, named), [container, id, named]);
};

export const useAllNamedService = <T>(id: interfaces.ServiceIdentifier<T>, named: string | number | symbol): T[] => {
  const { container } = useIOCContext();
  return useMemo(() => container.getAllNamed<T>(id, named), [container, id, named]);
};

export const useTaggedService = <T>(
  id: interfaces.ServiceIdentifier<T>,
  key: string | number | symbol,
  value: any,
): T => {
  const { container } = useIOCContext();
  return useMemo(() => container.getTagged<T>(id, key, value), [container, key, value]);
};

export const useAllTaggedService = <T>(
  id: interfaces.ServiceIdentifier<T>,
  key: string | number | symbol,
  value: any,
): T[] => {
  const { container } = useIOCContext();
  return useMemo(() => container.getAllTagged<T>(id, key, value), [container, key, value]);
};

export const useResolve = <T>(constructor: interfaces.Newable<T>): T => {
  const { container } = useIOCContext();
  return useMemo(() => container.resolve<T>(constructor), [constructor, container]);
};
