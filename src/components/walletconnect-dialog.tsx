import React, { FC, HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  isMobile as isMobileDevice,
  isAndroid as isAndroidDevice,
  saveMobileLinkInfo,
} from '@walletconnect/browser-utils';

import { LikeCoinWalletConnectorMethodType } from '../types';

import { SignInIcon } from './icons/sign-in';

import { Alert } from './alert';
import { Dialog } from './dialog';

export interface WalletConnectQRCodeDialogProps
  extends HTMLAttributes<HTMLDivElement> {
  type: LikeCoinWalletConnectorMethodType;
  uri: string;
  onClose?: () => void;
}

/**
 * Connect wallet dialog
 */
export const WalletConnectQRCodeDialog: FC<WalletConnectQRCodeDialogProps> = ({
  type,
  uri,
  onClose,
}) => {
  const [isDialogOpen, setDialogOpen] = useState(true);

  const isMobile = useMemo(isMobileDevice, []);
  const isAndroid = useMemo(isAndroidDevice, []);

  const navigateToAppURL = useMemo(() => {
    if (!uri || !isMobile) {
      return '';
    }

    switch (type) {
      case LikeCoinWalletConnectorMethodType.Keplr:
        if (isAndroid) {
          saveMobileLinkInfo({
            name: 'Keplr',
            href:
              'intent://wcV1#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;',
          });

          return `intent://wcV1?${uri}#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;`;
        } else {
          saveMobileLinkInfo({
            name: 'Keplr',
            href: 'keplrwallet://wcV1',
          });

          return `keplrwallet://wcV1?${uri}`;
        }

      case LikeCoinWalletConnectorMethodType.LikerId:
        saveMobileLinkInfo({
          name: 'Liker Land App',
          href: 'com.oice://wcV1',
        });

        return `com.oice://wcV1?${uri}`;

      default:
        return '';
    }
  }, [isAndroid, isMobile, uri]);

  useEffect(() => {
    if (navigateToAppURL) {
      window.location.href = navigateToAppURL;
    }
  }, [navigateToAppURL]);

  function closeDialog() {
    setDialogOpen(false);
    if (onClose) onClose();
  }

  return (
    <Dialog isOpen={isDialogOpen} onClose={closeDialog}>
      <h1 className="lk-flex lk-items-center lk-gap-x-[12px] lk-text-[#28646e] lk-font-bold">
        <SignInIcon className="lk-w-[20px] lk-h-[20px] lk-shrink-0" />
        <span>{isMobile ? 'Open App' : 'Scan QR Code'}</span>
      </h1>
      <div className="lk-flex lk-flex-col lk-justify-center lk-items-center lk-mt-[24px]">
        {isMobile ? (
          <>
            <Alert>
              <p>
                Please approve the connection request in the app by clicking the
                button below.
              </p>
            </Alert>
            <button
              className="lk-mt-[16px] lk-px-[16px] lk-py-[8px] lk-bg-like-cyan-light lk-text-like-green lk-font-bold lk-rounded-[8px]"
              onClick={() => {
                if (navigateToAppURL) {
                  window.location.href = navigateToAppURL;
                }
              }}
            >
              Open App
            </button>
          </>
        ) : (
          <>
            <Alert>
              {type === LikeCoinWalletConnectorMethodType.LikerId && (
                <p>Please scan the QR code with Liker Land app</p>
              )}
              {type === LikeCoinWalletConnectorMethodType.KeplrMobile && (
                <p>Please scan the QR code with Keplr Mobile app</p>
              )}
            </Alert>
            <QRCodeSVG className="lk-w-full lk-mt-[16px]" value={uri} />
          </>
        )}
      </div>
    </Dialog>
  );
};
