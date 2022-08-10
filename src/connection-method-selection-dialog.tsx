import React, { FC, HTMLAttributes } from 'react';
import Modal from 'react-modal';

import { ConnectionMethodButton } from './components/connection-method-button';
import { LikeCoinWalletConnectorMethod } from './types';

const modalStyle = {
  overlay: {
    zIndex: 999,
    backdropFilter: 'blur(16px)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 440,
    borderRadius: 24,
    border: '',
    boxShadow: '2px 4px 8px rgba(0, 0, 0, 0.25)',
  },
};
const connectionMethodMap = {
  [LikeCoinWalletConnectorMethod.Keplr]: {
    name: 'Keplr',
    description: 'Using Keplr browser extension',
  },
  [LikeCoinWalletConnectorMethod.KeplrMobile]: {
    name: 'Keplr Mobile',
    description: 'Using Keplr Mobile app',
  },
  [LikeCoinWalletConnectorMethod.LikerId]: {
    name: 'Liker ID',
    description: 'Using Liker Land app',
  },
  [LikeCoinWalletConnectorMethod.Cosmostation]: {
    name: 'Cosmostation',
    description: 'Using Cosmostation browser extension',
  },
};
export interface Props extends HTMLAttributes<HTMLDivElement> {
  methods: LikeCoinWalletConnectorMethod[];
  onClose?: () => void;
  onSelectConnectionMethod?: (method: LikeCoinWalletConnectorMethod) => void;
}

/**
 * Connect wallet dialog
 */
export const ConnectionMethodSelectionDialog: FC<Props> = ({
  methods,
  onClose,
  onSelectConnectionMethod,
}) => {
  const [isModalOpen, setModalOpen] = React.useState(true);

  const connectionMethods = React.useMemo(
    () =>
      methods
        .filter(type => !!connectionMethodMap[type])
        .map(type => ({
          type,
          ...connectionMethodMap[type],
        })),
    [methods]
  );

  function handleConnectionMethodSelection(
    method: LikeCoinWalletConnectorMethod
  ) {
    if (onSelectConnectionMethod) onSelectConnectionMethod(method);
  }

  function closeModal() {
    setModalOpen(false);
    if (onClose) onClose();
  }

  return (
    <Modal
      isOpen={isModalOpen}
      ariaHideApp={false}
      style={modalStyle}
      onRequestClose={closeModal}
    >
      <div>
        <button
          className="lk-text-[#28646e] lk-rounded lk-flex lk-justify-center lk-align-center"
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
      <div className="lk-py-[32px] lk-px-[24px]">
        <h1 className="lk-text-[#28646e] lk-font-bold">
          Please choose your connection method
        </h1>
        <ul className="lk-grid lk-grid-flow-row lk-gap-[12px] lk-mt-[24px]">
          {connectionMethods.map(method => (
            <li key={method.type}>
              <ConnectionMethodButton
                type={method.type}
                name={method.name}
                description={method.description}
                onPress={() => handleConnectionMethodSelection(method.type)}
              />
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};
