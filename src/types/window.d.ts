import { Window as KeplrWindow } from '@keplr-wallet/types';

declare global {
  interface Window extends KeplrWindow {
    cosmostation: {
      cosmos: {
        request: (message: { method: string; params?: unknown }) => Promise<T>;
        on: (
          eventName: string,
          eventHandler: (event?: unknown) => void
        ) => unknown;
        off: (handler: unknown) => void;
      };
    };
  }
}
