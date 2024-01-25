import React, { FC, useEffect } from 'react';

import { Dialog } from './dialog';

const AUTHCORE_DIALOG_ID = 'authcore-dialog';

export interface AuthcoreDialogProps {
  onMount?: (payload: { containerId: string }) => void;
}

export const AuthcoreDialog: FC<AuthcoreDialogProps> = ({ onMount }) => {
  const [isDialogOpen, setDialogOpen] = React.useState(true);
  const closeDialog = React.useCallback(() => {
    setDialogOpen(false);
  }, []);
  useEffect(() => {
    onMount?.({ containerId: AUTHCORE_DIALOG_ID });
  }, [onMount]);
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
