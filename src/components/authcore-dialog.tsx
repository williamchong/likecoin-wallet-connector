import React, { FC, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { Dialog } from './dialog';

const AUTHCORE_DIALOG_ID = 'authcore-dialog';

export interface AuthcoreDialogProps {
  onMount?: (payload: { containerId: string }) => void;
  onClose?: () => void;
  isHideSocialLogin?: boolean;
}

export const AuthcoreDialog: FC<AuthcoreDialogProps> = ({
  onMount,
  onClose,
  isHideSocialLogin,
}) => {
  const [isDialogOpen, setDialogOpen] = React.useState(true);
  const closeDialog = React.useCallback(() => {
    setDialogOpen(false);
    onClose?.();
  }, [onClose]);
  useEffect(() => {
    onMount?.({ containerId: AUTHCORE_DIALOG_ID });
  }, [onMount, onClose]);
  return (
    <Dialog
      isOpen={isDialogOpen}
      isNoHorizontalPadding={true}
      onClose={closeDialog}
    >
      <div id={AUTHCORE_DIALOG_ID} />

      <aside className="lk-mt-[12px] lk-px-[35px]">
        <div className="lk-flex lk-flex-col lk-items-center lk-gap-y-1 lk-w-full lk-p-[8px] lk-text-[#F6A721] lk-text-center lk-text-[12px] lk-bg-[#FFFBEB] lk-border lk-border-[#FEF0CF] lk-rounded-[3px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="lk-w-[20px]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>

          <p>
            <FormattedMessage id="wallet_connect_hint_browser_warning" />
          </p>
          {isHideSocialLogin && (
            <p>
              <FormattedMessage id="wallet_connect_hint_reset_password" />
            </p>
          )}
        </div>
      </aside>
    </Dialog>
  );
};
