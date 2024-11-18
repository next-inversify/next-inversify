import { injectable, preDestroy } from 'inversify';

import { Callback, Subscription } from './types';

export type DisposerLike = Callback<void> | Subscription;

@injectable()
export class Disposable {
  private bag: DisposerLike[] = [];

  @preDestroy()
  protected disposeHook = (): void => {
    this.dispose();
    this.bag = [];
  };

  public dispose = (): void => {
    this.bag.forEach((disposer) => {
      if ('unsubscribe' in disposer) {
        disposer.unsubscribe();
      } else {
        disposer();
      }
    });
  };

  public autoDispose = (disposer: DisposerLike): void => {
    this.bag.push(disposer);
  };
}
