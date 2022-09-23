import React, { FC, HTMLAttributes } from 'react';
import { isMobile as isMobileDevice } from '@walletconnect/browser-utils';

import {
  KeplrInstallCTAPreset,
  LikeCoinWalletConnectorMethod,
  LikeCoinWalletConnectorMethodType,
} from '../types';

import { SignInIcon } from './icons/sign-in';

import { Alert } from './alert';
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
  {
    type: LikeCoinWalletConnectorMethodType.CosmostationMobile,
    name: 'Cosmostation App',
    tier: 2,
    isMobileOk: true,
    url: 'https://www.cosmostation.io/wallet',
    description: 'Using Cosmostation Mobile Wallet',
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

export interface ConnectionMethodSelectionDialogProps
  extends HTMLAttributes<HTMLDivElement> {
  methods: LikeCoinWalletConnectorMethodType[];
  isShowMobileWarning?: boolean;
  keplrInstallURLOverride?: string;
  keplrInstallCTAPreset?: KeplrInstallCTAPreset;
  onClose?: () => void;
  onConnect?: (method: LikeCoinWalletConnectorMethodType) => void;
}

/**
 * Connection Method Selection Dialog
 */
export const ConnectionMethodSelectionDialog: FC<ConnectionMethodSelectionDialogProps> = ({
  methods,
  isShowMobileWarning = true,
  keplrInstallURLOverride,
  keplrInstallCTAPreset,
  onClose,
  onConnect,
}) => {
  const [isDialogOpen, setDialogOpen] = React.useState(true);

  const isMobile = React.useMemo(isMobileDevice, []);

  const isKeplrNotInstalled = !isMobile && !window.keplr;

  const tieredConnectionMethods = React.useMemo(() => {
    const tieredMethods = methods
      .filter(type => {
        const method = connectionMethodMap[type];
        return !!method && (!isMobile || (isMobile && method.isMobileOk));
      })
      .map(type => {
        const method = { ...connectionMethodMap[type] };
        if (
          type === LikeCoinWalletConnectorMethodType.Keplr &&
          keplrInstallURLOverride
        ) {
          method.url = keplrInstallURLOverride;
        }
        return method;
      })
      .reduce((tieredMethods, method) => {
        if (!tieredMethods[method.tier]) {
          tieredMethods[method.tier] = new Array<
            LikeCoinWalletConnectorMethod
          >();
        }
        tieredMethods[method.tier].push(method);
        return tieredMethods;
      }, {} as { [tier: number]: LikeCoinWalletConnectorMethod[] });
    // The returned array will be sorted by key i.e. `method.tier`
    return Object.values(tieredMethods);
  }, [methods, isMobile, keplrInstallURLOverride]);

  function closeDialog() {
    setDialogOpen(false);
    if (onClose) onClose();
  }

  return (
    <Dialog isOpen={isDialogOpen} onClose={closeDialog}>
      {!(isKeplrNotInstalled && keplrInstallCTAPreset === 'fancy-banner') && (
        <h1 className="lk-flex lk-items-center lk-gap-x-[12px] lk-text-like-green lk-font-bold lk-mb-[24px]">
          <SignInIcon className="lk-w-[20px] lk-h-[20px] lk-shrink-0" />
          <span>Connect a wallet</span>
        </h1>
      )}
      {isMobile && isShowMobileWarning && (
        <Alert className="lk-mb-[24px]">
          <p>
            WalletConnect in mobile is an experimental feature, please visit
            this site on desktop for a better experience.
          </p>
        </Alert>
      )}
      {tieredConnectionMethods.map((methods, index) => (
        <ConnectionMethodList
          key={`group-${index}`}
          methods={methods}
          isMobile={isMobile}
          keplrInstallCTAPreset={keplrInstallCTAPreset}
          isCollapsible={index !== 0}
          collapsibleToggleButtonTitle="Other connection methods"
          onSelectMethod={onConnect}
        />
      ))}
    </Dialog>
  );
};
