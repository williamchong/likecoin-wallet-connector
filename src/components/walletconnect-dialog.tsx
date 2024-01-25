import React, { FC, HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { QRCodeSVG } from 'qrcode.react';
import {
  isMobile as isMobileDevice,
  isAndroid as isAndroidDevice,
  saveMobileLinkInfo,
} from '@walletconnect/browser-utils';

import { LikeCoinWalletConnectorMethodType } from '../types';
import { checkIsInLikerLandAppInAppBrowser } from '../utils/liker-land-app';

import { SignInIcon } from './icons/sign-in';
import { DownloadIcon } from './icons/download';

import { Alert } from './alert';
import { Button } from './button';
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
  const intl = useIntl();

  const isInLikerLandApp = useMemo(checkIsInLikerLandAppInAppBrowser, []);
  // Do not show WC dialog for app open if in Liker Land App
  const [isDialogOpen, setDialogOpen] = useState(!isInLikerLandApp);

  const isMobile = useMemo(isMobileDevice, []);
  const isAndroid = useMemo(isAndroidDevice, []);

  const navigateToAppURL = useMemo(() => {
    if (!uri || !isMobile) {
      return '';
    }

    switch (type) {
      case LikeCoinWalletConnectorMethodType.KeplrMobile:
        if (isAndroid) {
          saveMobileLinkInfo({
            name: 'Keplr',
            href:
              'intent://wcV2#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;',
          });

          return `intent://wcV2?${uri}#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;`;
        } else {
          saveMobileLinkInfo({
            name: 'Keplr',
            href: 'keplrwallet://wcV2',
          });

          return `keplrwallet://wcV2?${uri}`;
        }

      case LikeCoinWalletConnectorMethodType.CosmostationMobile:
        if (isAndroid) {
          saveMobileLinkInfo({
            name: 'Cosmostation',
            href:
              'intent://wc#Intent;package=wannabit.io.cosmostaion;scheme=cosmostation;end;',
          });
          return `intent://wc?${uri}#Intent;package=wannabit.io.cosmostaion;scheme=cosmostation;end;`;
        } else {
          saveMobileLinkInfo({
            name: 'Cosmostation',
            href: 'cosmostation://wc',
          });
          return `cosmostation://wc?${uri}`;
        }

      case LikeCoinWalletConnectorMethodType.LikerLandApp:
        if (isAndroid) {
          saveMobileLinkInfo({
            name: 'Liker Land App',
            href: 'intent://wc#Intent;package=com.oice;scheme=com.oice;end;',
          });

          return `intent://wc?${uri}#Intent;package=com.oice;scheme=com.oice;end;`;
        } else {
          saveMobileLinkInfo({
            name: 'Liker Land App',
            href: 'com.oice://wc',
          });
          return `com.oice://wc?${uri}`;
        }

      default:
        return '';
    }
  }, [type, isAndroid, isMobile, uri]);

  const downloadAppURL = useMemo(() => {
    switch (type) {
      case LikeCoinWalletConnectorMethodType.KeplrMobile:
        if (isAndroid) {
          return 'https://play.google.com/store/apps/details?id=com.chainapsis.keplr';
        } else {
          return 'https://apps.apple.com/app/keplr-wallet/id1567851089';
        }

      case LikeCoinWalletConnectorMethodType.CosmostationMobile:
        if (isAndroid) {
          return 'https://play.google.com/store/apps/details?id=wannabit.io.cosmostaion';
        } else {
          return 'https://apps.apple.com/app/cosmostation/id1459830339';
        }

      case LikeCoinWalletConnectorMethodType.LikerLandApp:
        return 'https://likecoin.page.link/likerland?utm_campaign=&utm_source=&utm_medium=getapp_page';

      default:
        return '';
    }
  }, [type, isAndroid]);

  const hintLabelText = React.useMemo(() => {
    switch (type) {
      case LikeCoinWalletConnectorMethodType.KeplrMobile:
        return intl.formatMessage({
          id: 'wallet_connect_hint_scan_qrcode_keplr_mobile',
        });

      case LikeCoinWalletConnectorMethodType.CosmostationMobile:
        return intl.formatMessage({
          id: 'wallet_connect_hint_scan_qrcode_cosmostation_mobile',
        });

      case LikeCoinWalletConnectorMethodType.LikerLandApp:
        return intl.formatMessage({
          id: 'wallet_connect_hint_scan_qrcode_liker_land_app',
        });

      default:
        return '';
    }
  }, [type, intl]);

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
        <span>
          <FormattedMessage
            id={
              isMobile
                ? 'wallet_connect_header_title_open_app'
                : 'wallet_connect_header_title_scan_qrcode'
            }
          />
        </span>
      </h1>
      <div className="lk-flex lk-flex-col lk-justify-center lk-items-center lk-mt-[24px]">
        {isMobile ? (
          <>
            <Alert>
              <p>
                <FormattedMessage id="wallet_connect_hint_approve" />
              </p>
            </Alert>
            <nav className="lk-flex lk-flex-wrap lk-justify-center lk-items-center lk-gap-[12px] lk-mt-[16px]">
              <Button
                onClick={() => {
                  if (navigateToAppURL) {
                    window.location.href = navigateToAppURL;
                  }
                }}
              >
                <FormattedMessage id="wallet_connect_button_open_app" />
              </Button>
              {downloadAppURL && (
                <Button
                  tag="a"
                  preset="secondary"
                  href={downloadAppURL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <DownloadIcon />
                  <FormattedMessage id="wallet_connect_button_download_app" />
                </Button>
              )}
            </nav>
          </>
        ) : (
          <>
            {!!hintLabelText && (
              <Alert>
                <p>{hintLabelText}</p>
              </Alert>
            )}
            <QRCodeSVG
              className="lk-w-full lk-mt-[16px]"
              value={uri}
              width="100%"
              height="100%"
            />
          </>
        )}
      </div>
    </Dialog>
  );
};
