import {
  OfflineSigner,
  LikeCoinWalletConnectorInitResponse,
  LikeCoinWalletConnectorOptions,
} from '../types';

export async function initKeplr(
  options: LikeCoinWalletConnectorOptions,
  trys = 0
): Promise<LikeCoinWalletConnectorInitResponse> {
  if (!window.keplr || !window.getOfflineSignerAuto) {
    if (trys < options.initAttemptCount) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return initKeplr(options, trys + 1);
    }
    throw new Error('KEPLR_NOT_INSTALLED');
  }

  if (!window.keplr.experimentalSuggestChain) {
    throw new Error('KEPLR_VERSION_OUTDATED');
  }

  try {
    // Some Keplr configs not support empty string
    const coinGeckoId = options.coinGeckoId || undefined;
    const walletUrlForStaking = options.walletURLForStaking || undefined;

    await window.keplr.experimentalSuggestChain({
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
      walletUrlForStaking,
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
      coinType: options.coinType,
      features: ['ibc-go', 'ibc-transfer', 'no-legacy-stdTx', 'stargate'],
    });
  } catch (error) {
    console.error(error);
    throw new Error('KEPLR_INIT_FAILED');
  }

  await window.keplr.enable(options.chainId);

  const offlineSigner = await window.getOfflineSignerAuto(options.chainId);
  const accounts = await offlineSigner.getAccounts();

  let signer: OfflineSigner = offlineSigner;
  if (window.keplr.signArbitrary) {
    signer.signArbitrary = window.keplr.signArbitrary.bind(window.keplr);
  }
  return {
    accounts: [...accounts],
    offlineSigner: signer,
  };
}

export function listenKeplrKeyStoreChange(
  handler?: EventListenerOrEventListenerObject
) {
  if (!handler) return;
  window.addEventListener('keplr_keystorechange', handler);
}

export function removeKeplrKeyStoreChangeListener(
  handler?: EventListenerOrEventListenerObject
) {
  if (!handler) return;
  window.removeEventListener('keplr_keystorechange', handler);
}
