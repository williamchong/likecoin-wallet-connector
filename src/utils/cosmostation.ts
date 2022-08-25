import { AccountData, OfflineSigner } from '@cosmjs/proto-signing';

import {
  LikeCoinWalletConnectorInitResponse,
  LikeCoinWalletConnectorOptions,
} from '../types';

export const getCosmostationExtensionOfflineSigner = (
  chainName: string
): OfflineSigner => ({
  getAccounts: async () => {
    const response = await window.cosmostation.cosmos.request({
      method: 'cos_account',
      params: { chainName },
    });
    return [
      {
        address: response.address,
        pubkey: response.publicKey,
        algo: 'secp256k1',
      },
    ];
  },
  signAmino: async (_, signDoc) => {
    const response = await window.cosmostation.cosmos.request({
      method: 'cos_signAmino',
      params: {
        chainName,
        doc: signDoc,
        isEditMemo: true,
        isEditFee: true,
      },
    });

    return {
      signed: response.signed_doc,
      signature: {
        pub_key: response.pub_key,
        signature: response.signature,
      },
    };
  },
  signDirect: async (_, signDoc) => {
    const response = await window.cosmostation.cosmos.request({
      method: 'cos_signDirect',
      params: {
        chainName,
        doc: {
          account_number: String(signDoc.accountNumber),
          auth_info_bytes: signDoc.authInfoBytes,
          body_bytes: signDoc.bodyBytes,
          chain_id: signDoc.chainId,
        },
      },
    });
    return {
      signed: {
        accountNumber: (response.signed_doc.account_number as unknown) as Long,
        chainId: response.signed_doc.chain_id,
        authInfoBytes: response.signed_doc.auth_info_bytes,
        bodyBytes: response.signed_doc.body_bytes,
      },
      signature: {
        pub_key: response.pub_key,
        signature: response.signature,
      },
    };
  },
});

export async function addChainToCosmostation(
  options: LikeCoinWalletConnectorOptions
) {
  await window.cosmostation.cosmos.request({
    method: 'cos_addChain',
    params: {
      chainId: options.chainId,
      chainName: options.chainName,
      addressPrefix: options.bech32PrefixAccAddr,
      baseDenom: options.coinMinimalDenom,
      displayDenom: options.coinDenom,
      restURL: options.restURL,
      coinType: options.coinType.toString(),
      decimals: options.coinDecimals,
      gasRate: {
        tiny: `${options.gasPriceStepLow}`,
        low: `${options.gasPriceStepAverage}`,
        average: `${options.gasPriceStepHigh}`,
      },
      sendGas: '350000',
    },
  });
}

export async function initCosmostation(
  options: LikeCoinWalletConnectorOptions,
  trys = 0
): Promise<LikeCoinWalletConnectorInitResponse> {
  if (!window.cosmostation) {
    if (trys < options.initAttemptCount) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return initCosmostation(options, trys + 1);
    }
    throw new Error('COSMOSTATION_NOT_INSTALLED');
  }

  const supportedChains: {
    official: string[];
    unofficial: string[];
  } = await window.cosmostation.cosmos.request({
    method: 'cos_supportedChainNames',
  });
  if (
    !Object.values(supportedChains).find(list =>
      list.find(
        chainName => chainName.toLowerCase() === options.chainName.toLowerCase()
      )
    )
  ) {
    await addChainToCosmostation(options);
  }

  const offlineSigner = getCosmostationExtensionOfflineSigner(
    options.chainName
  );
  let accounts: AccountData[] = [];
  try {
    accounts = [...(await offlineSigner.getAccounts())];
  } catch (error) {
    switch ((error as any).code) {
      case 4001:
        return undefined;

      case 4100:
        await addChainToCosmostation(options);
        accounts = [...(await offlineSigner.getAccounts())];
        break;

      default:
        throw error;
    }
  }
  if (!accounts.length) {
    throw new Error('COSMOSTATION_ACCOUNT_NOT_FOUND');
  }

  return {
    accounts,
    offlineSigner,
  };
}
