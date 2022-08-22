import React, { FC, HTMLAttributes } from 'react';
import { Dialog } from '@headlessui/react';
import { isMobile as isMobileDevice } from '@walletconnect/browser-utils';

import AlertIcon from './components/icons/alert';
import SignInIcon from './components/icons/sign-in';

import {
  LikeCoinWalletConnectorMethod,
  LikeCoinWalletConnectorMethodType,
} from './types';
import { ConnectionMethodList } from './components/connection-method-list';

const connectionMethodMap = [
  {
    type: LikeCoinWalletConnectorMethodType.Keplr,
    name: 'Keplr',
    tier: 1,
    isMobileOk: false,
    url: 'https://keplr.app',
    description: 'Using Keplr browser extension',
  },
  {
    type: LikeCoinWalletConnectorMethodType.KeplrMobile,
    name: 'Keplr Mobile',
    tier: 2,
    isMobileOk: true,
    url: 'https://keplr.app/app',
    description: 'Scanning QR code with Keplr Mobile app',
  },
  {
    type: LikeCoinWalletConnectorMethodType.LikerId,
    name: 'Liker ID',
    tier: 2,
    isMobileOk: true,
    url: 'https://liker.land/getapp',
    description: 'Scanning QR code with Liker Land app',
  },
  {
    type: LikeCoinWalletConnectorMethodType.Cosmostation,
    name: 'Cosmostation',
    tier: 2,
    isMobileOk: false,
    url: 'https://cosmostation.io/wallet/#extension',
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

export interface ConnectionMethodSelectionDialogProps
  extends HTMLAttributes<HTMLDivElement> {
  methods: LikeCoinWalletConnectorMethodType[];
  onClose?: () => void;
  onSelectConnectionMethod?: (
    method: LikeCoinWalletConnectorMethodType
  ) => void;
}

/**
 * Connect wallet dialog
 */
export const ConnectionMethodSelectionDialog: FC<ConnectionMethodSelectionDialogProps> = ({
  methods,
  onClose,
  onSelectConnectionMethod,
}) => {
  const [isModalOpen, setModalOpen] = React.useState(true);

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
  }, [methods]);

  function closeModal() {
    setModalOpen(false);
    if (onClose) onClose();
  }

  return (
    <Dialog
      open={isModalOpen}
      className="lk-relative lk-z-[9999]"
      onClose={closeModal}
    >
      {/* Backdrop */}
      <div className="lk-fixed lk-inset-0 lk-bg-black/30" aria-hidden="true" />
      {/* Full-screen scrollable container */}
      <div className="lk-fixed lk-inset-0 lk-overflow-y-auto">
        {/* Container to center the panel */}
        <div className="lk-flex lk-items-center lk-justify-center lk-min-h-screen lk-px-[12px] sm:lk-px-[24px] lk-py-[24px] ">
          {/* The actual dialog panel  */}
          <Dialog.Panel className="lk-mx-auto lk-max-w-[400px] lk-w-full lk-drop-shadow-xl">
            <div>
              <button
                className="lk-text-[#28646e] lk-bg-[#ebebeb] hover:lk-bg-[#e6e6e6] active:lk-bg-[#9b9b9b] lk-transition-colors lk-rounded-full lk-flex lk-justify-center lk-items-center p-[14px] lk-w-[48px] lk-h-[48px]"
                onClick={closeModal}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.8383 3.74744C15.2289 3.35691 15.862 3.35691 16.2525 3.74744C16.6431 4.13796 16.6431 4.77113 16.2525 5.16165L11.4142 10L16.2525 14.8383C16.6431 15.2289 16.6431 15.862 16.2525 16.2526C15.862 16.6431 15.2289 16.6431 14.8383 16.2526L9.99998 11.4142L5.16164 16.2526C4.77111 16.6431 4.13795 16.6431 3.74742 16.2526C3.3569 15.862 3.3569 15.2289 3.74742 14.8383L8.58577 10L3.74742 5.16165C3.3569 4.77113 3.3569 4.13796 3.74742 3.74744C4.13795 3.35691 4.77111 3.35691 5.16164 3.74744L9.99998 8.58578L14.8383 3.74744Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <div className="lk-py-[24px] sm:lk-py-[32px] lk-px-[16px] sm:lk-px-[24px] lk-rounded-[16px] sm:lk-rounded-[24px] lk-bg-[#fff] lk-mt-[8px]">
              <h1 className="lk-flex lk-items-center lk-gap-x-[12px] lk-text-[#28646e] lk-font-bold">
                <SignInIcon className="lk-w-[20px] lk-h-[20px] lk-shrink-0" />
                <span>Connect a wallet</span>
              </h1>
              {isMobile && (
                <div className="lk-mt-[24px] lk-items-start lk-flex lk-rounded-[24px] lk-bg-[#f7f7f7] lk-p-[16px] lk-text-[#4a4a4a]">
                  <AlertIcon className="lk-shrink-0 lk-w-[16px] lk-h-[24px] lk-w-[16px] lk-mr-[8px]" />
                  <p>
                    WalletConnect in mobile is an experimental feature, please
                    visit this site on desktop for a better experience.
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
                  onSelectMethod={onSelectConnectionMethod}
                />
              ))}
              <div className="lk-flex lk-items-center lk-gap-x-[16px] lk-mt-[16px] lk-text-[#9b9b9b] lk-px-[16px">
                <AlertIcon className="lk-w-[16px]" />
                <span className="lk-grow lk-text-[14px] lk-leading-[1.25]">
                  Ledger is not yet supported.
                </span>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
