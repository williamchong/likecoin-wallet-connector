import React, { FC, HTMLAttributes } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
    description: 'connect_wallet_method_description_keplr',
  },
  {
    type: LikeCoinWalletConnectorMethodType.KeplrMobile,
    name: 'Keplr Mobile',
    tier: 2,
    isMobileOk: true,
    url: 'https://keplr.app/app',
    description: 'connect_wallet_method_description_keplr_mobile',
  },
  {
    type: LikeCoinWalletConnectorMethodType.LikerId,
    name: 'Liker ID',
    tier: 2,
    isMobileOk: true,
    url: 'https://liker.land/getapp',
    description: 'connect_wallet_method_description_liker_land_app',
  },
  {
    type: LikeCoinWalletConnectorMethodType.Cosmostation,
    name: 'Cosmostation',
    tier: 1,
    isMobileOk: false,
    url:
      'https://chrome.google.com/webstore/detail/cosmostation/fpkhgmpbidmiogeglndfbkegfdlnajnf',
    description: 'connect_wallet_method_description_cosmostation',
  },
  {
    type: LikeCoinWalletConnectorMethodType.CosmostationMobile,
    name: 'Cosmostation App',
    tier: 2,
    isMobileOk: true,
    url: 'https://www.cosmostation.io/wallet',
    description: 'connect_wallet_method_description_cosmostation_mobile',
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
  const intl = useIntl();
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
        method.description = intl.formatMessage({ id: method.description });
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
  }, [methods, isMobile, keplrInstallURLOverride, intl]);

  function closeDialog() {
    setDialogOpen(false);
    if (onClose) onClose();
  }

  return (
    <Dialog isOpen={isDialogOpen} onClose={closeDialog}>
      {!(isKeplrNotInstalled && keplrInstallCTAPreset === 'fancy-banner') && (
        <h1 className="lk-flex lk-items-center lk-gap-x-[12px] lk-text-like-green lk-font-bold lk-mb-[24px]">
          <SignInIcon className="lk-w-[20px] lk-h-[20px] lk-shrink-0" />
          <span>
            <FormattedMessage id="connect_wallet_title" />
          </span>
        </h1>
      )}
      {isMobile && isShowMobileWarning && (
        <Alert className="lk-mb-[24px]">
          <p>
            <FormattedMessage id="warning_wallet_connect_mobile" />
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
          collapsibleToggleButtonTitle={intl.formatMessage({
            id: 'connect_wallet_other_methods',
          })}
          onSelectMethod={onConnect}
        />
      ))}
    </Dialog>
  );
};
