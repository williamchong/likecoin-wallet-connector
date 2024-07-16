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
      {isHideSocialLogin && (
        <div className="lk-flex lk-flex-col lk-flex-col lk-w-full lk-items-center lk-gap-y-2 lk-mt-[12px]">
          <p className="lk-text-like-gray lk-text-center lk-w-full lk-text-[12px]">
            <FormattedMessage
              id="wallet_connect_hint_reset_password"
              values={{
                span: chunks => <span className="lk-text-like-green">{chunks}</span>,
              }}
            />
          </p>
        </div>
      )}
    </Dialog>
  );
};
