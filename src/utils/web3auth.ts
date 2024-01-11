import { DirectSecp256k1Wallet, OfflineSigner } from '@cosmjs/proto-signing';
import { Secp256k1Wallet } from '@cosmjs/amino';
import { Web3Auth, Web3AuthOptions } from '@web3auth/modal';
import { CHAIN_NAMESPACES } from '@web3auth/base';

import {
  LikeCoinWalletConnectorInitResponse,
  LikeCoinWalletConnectorOptions,
} from '../types';

let web3auth: Web3Auth | null = null;

export async function initWeb3Auth(
  options: LikeCoinWalletConnectorOptions
): Promise<LikeCoinWalletConnectorInitResponse> {
  const web3AuthOptions = {
    clientId: options.web3AuthClientId,
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.OTHER,
      chainId: options.chainId,
      rpcTarget: options.rpcURL,
      displayName: options.chainName,
      blockExplorer: options.blockExplorerURL,
      decimals: options.coinDecimals,
      ticker: options.coinMinimalDenom,
      tickerName: options.coinDenom,
    },
    web3AuthNetwork: options.web3AuthNetwork,
    authMode: 'DAPP',
    uiConfig: {
      appLogo: 'https://liker.land/favicon.ico',
      defaultLanguage: 'zh',
    },
  } as Web3AuthOptions;
  web3auth = new Web3Auth(web3AuthOptions);
  await web3auth.initModal();
  const provider = await web3auth.connect();
  if (!provider) {
    throw new Error('Failed to connect to wallet');
  }
  const privateKeyStr = await (provider as any).request({
    method: 'private_key',
  });
  const privateKey = Buffer.from(privateKeyStr, 'hex');
  const aminoSigner = await Secp256k1Wallet.fromKey(
    privateKey,
    options.bech32PrefixAccAddr
  );
  const directSigner = await DirectSecp256k1Wallet.fromKey(
    privateKey,
    options.bech32PrefixAccAddr
  );
  const accounts = [...(await aminoSigner.getAccounts())];
  if (!accounts.length) {
    throw new Error('WALLETCONNECT_ACCOUNT_NOT_FOUND');
  }
  const offlineSigner: OfflineSigner = {
    getAccounts: () => Promise.resolve(accounts),
    signAmino: aminoSigner.signAmino,
    signDirect: directSigner.signDirect,
  };

  return {
    accounts,
    offlineSigner,
  };
}

export async function disconnectWeb3Auth() {
  if (web3auth) {
    await web3auth.logout();
    web3auth = null;
  }
}
