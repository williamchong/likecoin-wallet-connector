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

export function getCosmostationMobileWCConnector(
  options: Partial<IWalletConnectOptions> = {}
) {
  return new WalletConnect({
    signingMethods: [
      'cosmostation_wc_accounts_v1',
      'cosmostation_wc_sign_tx_v1',
    ],
    ...options,
  });
}

export async function initCosmostationMobile(
  options: LikeCoinWalletConnectorOptions,
  qrcodeModal: IQRCodeModal,
  sessionMethod?: LikeCoinWalletConnectorMethodType,
  sessionAccounts: AccountData[] = []
): Promise<LikeCoinWalletConnectorInitResponse> {
  const wcConnector = getCosmostationMobileWCConnector({
    bridge: options.cosmostationAppWCBridge,
    qrcodeModal,
  });
  let accounts: AccountData[] = [];
  if (
    wcConnector.connected &&
    sessionMethod === LikeCoinWalletConnectorMethodType.CosmostationMobile &&
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
      method: 'cosmostation_wc_accounts_v1',
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
      const [result] = await wcConnector.sendCustomRequest({
        id: payloadId(),
        jsonrpc: '2.0',
        method: 'cosmostation_wc_sign_tx_v1',
        params: [options.chainId, signerBech32Address, signDoc],
      });
      return result;
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
