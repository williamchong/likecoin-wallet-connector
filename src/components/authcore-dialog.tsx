import React, { FC, useEffect } from 'react';

import { Dialog } from './dialog';

const AUTHCORE_DIALOG_ID = 'authcore-dialog';

export interface AuthcoreDialogProps {
  onMount?: (payload: { containerId: string }) => void;
  onClose?: () => void;
}

export const AuthcoreDialog: FC<AuthcoreDialogProps> = ({
  onMount,
  onClose,
}) => {
  const [isDialogOpen, setDialogOpen] = React.useState(true);
  const closeDialog = React.useCallback(() => {
    setDialogOpen(false);
    onClose?.();
  }, []);
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
    </Dialog>
  );
};
