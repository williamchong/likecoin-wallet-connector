import React, { FC, HTMLAttributes } from 'react';
import { isMobile as isMobileDevice } from '@walletconnect/browser-utils';

import {
  LikeCoinWalletConnectorMethod,
  LikeCoinWalletConnectorMethodType,
} from '../types';

import { AlertIcon } from './icons/alert';
import { SignInIcon } from './icons/sign-in';

import { ConnectionMethodList } from './connection-method-list';
import { Dialog } from './dialog';

const connectionMethodMap = [
  {
    type: LikeCoinWalletConnectorMethodType.Keplr,
    name: 'Keplr',
    tier: 1,
    isMobileOk: false,
    url:
      'https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap',
    description: 'Using Keplr browser extension',
  },
  {
    type: LikeCoinWalletConnectorMethodType.KeplrMobile,
    name: 'Keplr Mobile',
    tier: 2,
    isMobileOk: true,
    url: 'https://keplr.app/app',
    description: 'Scan QR code with Keplr Mobile app',
  },
  {
    type: LikeCoinWalletConnectorMethodType.LikerId,
    name: 'Liker ID',
    tier: 2,
    isMobileOk: true,
    url: 'https://liker.land/getapp',
    description: 'Scan QR code with Liker Land app',
  },
  {
    type: LikeCoinWalletConnectorMethodType.Cosmostation,
    name: 'Cosmostation',
    tier: 2,
    isMobileOk: false,
    url:
      'https://chrome.google.com/webstore/detail/cosmostation/fpkhgmpbidmiogeglndfbkegfdlnajnf',
    description: 'Using Cosmostation browser extension',
  },
].reduce(
  (map, method) => {
    map[method.type] = method;
    return map;
  },
  {} as {
    [type in LikeCoinWalletConnectorMethodType]: LikeCoinWalletConnectorMethod;
  }
);

export interface ConnectionMethodDialogProps
  extends HTMLAttributes<HTMLDivElement> {
  methods: LikeCoinWalletConnectorMethodType[];
  onClose?: () => void;
  onConnect?: (method: LikeCoinWalletConnectorMethodType) => void;
}

/**
 * Connect wallet dialog
 */
export const ConnectionMethodDialog: FC<ConnectionMethodDialogProps> = ({
  methods,
  onClose,
  onConnect,
}) => {
  const [isDialogOpen, setDialogOpen] = React.useState(true);

  const isMobile = React.useMemo(isMobileDevice, []);

  const tieredConnectionMethods = React.useMemo(() => {
    const tieredMethods = methods
      .filter(type => {
        const method = connectionMethodMap[type];
        return !!method && (!isMobile || (isMobile && method.isMobileOk));
      })
      .map(type => connectionMethodMap[type])
      .reduce((tieredMethods, method) => {
        if (!tieredMethods[method.tier]) {
          tieredMethods[method.tier] = new Array<
            LikeCoinWalletConnectorMethod
          >();
        }
        tieredMethods[method.tier].push(method);
        return tieredMethods;
      }, {} as { [tier: string]: LikeCoinWalletConnectorMethod[] });
    return Object.keys(tieredMethods)
      .sort()
      .map(key => tieredMethods[key]);
  }, [methods, isMobile]);

  function closeDialog() {
    setDialogOpen(false);
    if (onClose) onClose();
  }

  return (
    <Dialog isOpen={isDialogOpen} onClose={closeDialog}>
      <h1 className="lk-flex lk-items-center lk-gap-x-[12px] lk-text-like-green lk-font-bold">
        <SignInIcon className="lk-w-[20px] lk-h-[20px] lk-shrink-0" />
        <span>Connect a wallet</span>
      </h1>
      {isMobile && (
        <div className="lk-mt-[24px] lk-items-start lk-flex lk-rounded-[24px] lk-bg-gray-lightest lk-p-[16px] lk-text-gray-dark">
          <AlertIcon className="lk-shrink-0 lk-w-[16px] lk-h-[24px] lk-w-[16px] lk-mr-[8px]" />
          <p>
            WalletConnect in mobile is an experimental feature, please visit
            this site on desktop for a better experience.
          </p>
        </div>
      )}
      {tieredConnectionMethods.map((methods, index) => (
        <ConnectionMethodList
          className="lk-mt-[24px]"
          key={`group-${index}`}
          methods={methods}
          isMobile={isMobile}
          isCollapsible={index !== 0}
          collapsibleToggleButtonTitle="Other connection methods"
          onSelectMethod={onConnect}
        />
      ))}
    </Dialog>
  );
};
