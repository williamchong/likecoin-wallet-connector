import { AminoSignResponse } from '@cosmjs/amino';
import {
  AccountData,
  DirectSignResponse,
  OfflineSigner,
} from '@cosmjs/proto-signing';
import WalletConnect from '@walletconnect/client';
import { IQRCodeModal, IWalletConnectOptions } from '@walletconnect/types';
import { payloadId } from '@walletconnect/utils';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import {
  LikeCoinWalletConnectorInitResponse,
  LikeCoinWalletConnectorMethodType,
  LikeCoinWalletConnectorOptions,
} from '../types';

import { convertWalletConnectAccountResponse } from './wallet';

export function getLikerLandAppWCConnector(
  options: Partial<IWalletConnectOptions> = {}
) {
  return new WalletConnect({
    bridge: 'https://bridge.walletconnect.org',
    signingMethods: ['cosmos_getAccounts', 'cosmos_signAmino'],
    ...options,
  });
}

export async function initLikerLandApp(
  options: LikeCoinWalletConnectorOptions,
  qrcodeModal: IQRCodeModal,
  sessionMethod?: LikeCoinWalletConnectorMethodType,
  sessionAccounts: AccountData[] = []
): Promise<LikeCoinWalletConnectorInitResponse> {
  const wcConnector = getLikerLandAppWCConnector({ qrcodeModal });
  let accounts: AccountData[] = [];
  if (
    wcConnector.connected &&
    sessionMethod === LikeCoinWalletConnectorMethodType.LikerId &&
    sessionAccounts.length > 0
  ) {
    accounts = sessionAccounts;
  } else {
    if (wcConnector.connected) {
      await wcConnector.killSession();
    }
    await wcConnector.connect();
    const [account] = await wcConnector.sendCustomRequest({
      id: payloadId(),
      jsonrpc: '2.0',
      method: 'cosmos_getAccounts',
      params: [options.chainId],
    });
    accounts = [convertWalletConnectAccountResponse(account)];
  }
  if (!accounts.length) {
    throw new Error('WALLETCONNECT_ACCOUNT_NOT_FOUND');
  }

  const offlineSigner: OfflineSigner = {
    getAccounts: () => Promise.resolve(accounts),
    signAmino: async (signerBech32Address, signDoc) => {
      const signedTx: AminoSignResponse[] = await wcConnector.sendCustomRequest(
        {
          id: payloadId(),
          jsonrpc: '2.0',
          method: 'cosmos_signAmino',
          params: [options.chainId, signerBech32Address, signDoc],
        }
      );
      return signedTx[0];
    },
    signDirect: async (signerBech32Address, signDoc) => {
      const {
        signed: signedInJSON,
        signature,
      } = await wcConnector.sendCustomRequest({
        id: payloadId(),
        jsonrpc: '2.0',
        method: 'cosmos_signDirect',
        params: [signerBech32Address, SignDoc.toJSON(signDoc)],
      });
      return {
        signed: SignDoc.fromJSON(signedInJSON),
        signature,
      } as DirectSignResponse;
    },
  };

  return {
    accounts,
    offlineSigner,
  };
}
