import {
  CosmjsOfflineSigner,
  connectSnap,
  getSnap,
  suggestChain,
} from '@leapwallet/cosmos-snap-provider';

import {
  OfflineSigner,
  LikeCoinWalletConnectorInitResponse,
  LikeCoinWalletConnectorOptions,
} from '../types';

export async function initMetaMaskLeap(
  options: LikeCoinWalletConnectorOptions,
  trys = 0
): Promise<LikeCoinWalletConnectorInitResponse> {
  if (!window.ethereum || !window.ethereum.isMetaMask) {
    if (trys < options.initAttemptCount) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return initMetaMaskLeap(options, trys + 1);
    }
    throw new Error('METAMASK_NOT_INSTALLED');
  }

  const snapInstalled = await getSnap();
  if (!snapInstalled) {
    connectSnap();
  }
  try {
    // Some MetaMask Leap Snap configs not support empty string
    const coinGeckoId = options.coinGeckoId || undefined;

    await suggestChain(
      {
        chainId: options.chainId,
        chainName: options.chainName,
        rpc: options.rpcURL,
        rest: options.restURL,
        stakeCurrency: {
          coinDenom: options.coinDenom,
          coinMinimalDenom: options.coinMinimalDenom,
          coinDecimals: options.coinDecimals,
          coinGeckoId,
        },
        bip44: {
          coinType: options.coinType,
        },
        bech32Config: {
          bech32PrefixAccAddr: options.bech32PrefixAccAddr,
          bech32PrefixAccPub: options.bech32PrefixAccPub,
          bech32PrefixValAddr: options.bech32PrefixValAddr,
          bech32PrefixValPub: options.bech32PrefixValPub,
          bech32PrefixConsAddr: options.bech32PrefixConsAddr,
          bech32PrefixConsPub: options.bech32PrefixConsPub,
        },
        currencies: [
          {
            coinDenom: options.coinDenom,
            coinMinimalDenom: options.coinMinimalDenom,
            coinDecimals: options.coinDecimals,
            coinGeckoId,
          },
        ],
        feeCurrencies: [
          {
            coinDenom: options.coinDenom,
            coinMinimalDenom: options.coinMinimalDenom,
            coinDecimals: options.coinDecimals,
            coinGeckoId,
            gasPriceStep: {
              low: options.gasPriceStepLow,
              average: options.gasPriceStepAverage,
              high: options.gasPriceStepHigh,
            },
          },
        ],

        image: 'https://static.like.co/edm/likecoin-logo.png',
      },
      { force: false }
    );
  } catch (error) {
    console.error(error);
    throw new Error('METAMASK_SNAP_INIT_FAILED');
  }

  const offlineSigner = new CosmjsOfflineSigner(options.chainId);
  const accounts = await offlineSigner.getAccounts();

  let signer: OfflineSigner = offlineSigner;
  return {
    accounts: [...accounts],
    offlineSigner: signer,
  };
}
