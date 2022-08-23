import classNames from 'classnames';
import React, { FC } from 'react';

import { LikeCoinWalletConnectorMethodType } from '../types';

import { AlertIcon } from './icons/alert';
import { OpenInNewIcon } from './icons/open-in-new';

import { ConnectionMethodIcon } from './connection-method-icon';

export interface Props {
  type?: LikeCoinWalletConnectorMethodType;
  name?: string;
  description?: string;
  url?: string;
  isMobile?: boolean;
  onPress?: () => void;
}

/**
 * Button for a connection method
 */
export const ConnectionMethodButton: FC<Props> = ({
  type,
  name,
  description: defaultDescription,
  url,
  isMobile = false,
  onPress,
}) => {
  const isUninstalled = React.useMemo(() => {
    switch (type) {
      case LikeCoinWalletConnectorMethodType.Keplr:
        return !isMobile && !window.keplr;
      case LikeCoinWalletConnectorMethodType.Cosmostation:
        return !isMobile && !window.cosmostation;
      default:
        return false;
    }
  }, [type, isMobile]);

  const description = React.useMemo(() => {
    if (isUninstalled) {
      return `You haven't installed.`;
    }
    if (isMobile) {
      return 'Click to open the app';
    }
    return defaultDescription;
  }, [isUninstalled, isMobile, defaultDescription]);

  const Tag = isUninstalled ? 'a' : 'button';

  const props = isUninstalled
    ? {
        href: url,
        target: '_blank',
        rel: 'noreferrer noopener',
      }
    : {
        onClick: onPress,
      };
  return (
    <>
      <Tag
        className="lk-block lk-w-full lk-border-[4px] lk-border-solid lk-border-gray-light hover:lk-border-like-cyan-light active:lk-bg-like-cyan-lightest lk-rounded-[16px] lk-p-[24px] lk-transition-colors lk-cursor-pointer lk-group"
        {...props}
      >
        <div className="lk-flex lk-items-center group-hover:lk-text-like-green lk-transition-colors">
          <ConnectionMethodIcon type={type} />
          <div className="lk-ml-[12px] lk-text-[16px] sm:lk-text-[20px]">
            {!!isUninstalled && <span>Install </span>}
            <span className="lk-font-bold">{name}</span>
          </div>
          {!!isUninstalled && (
            <OpenInNewIcon className="lk-ml-[8px] lk-w-[12px] lk-h-[12px]" />
          )}
        </div>
        <div
          className={classNames(
            'lk-mt-[16px] lk-text-[14px] sm:lk-text-[16px] lk-text-left lk-shrink-1',
            { 'lk-text-red': isUninstalled }
          )}
        >{description}</div>
      </Tag>
      {type === LikeCoinWalletConnectorMethodType.Keplr && (
        <div className="lk-flex lk-items-center lk-gap-x-[16px] lk-mt-[12px] lk-text-gray lk-px-[16px">
          <AlertIcon className="lk-w-[16px]" />
          <span className="lk-grow lk-text-[14px] lk-leading-[1.25]">
            Ledger is not yet supported.
          </span>
        </div>
      )}
    </>
  );
};
