import {
  AccountData,
  OfflineSigner as CosmJSOfflineSigner,
} from '@cosmjs/proto-signing';
import { StdSignature } from '@cosmjs/amino';
import { KeplrSignOptions } from '@keplr-wallet/types';

export enum LikeCoinWalletConnectorMethodType {
  Keplr = 'keplr',
  KeplrMobile = 'keplr-mobile',
  Cosmostation = 'cosmostation',
  CosmostationMobile = 'cosmostation-mobile',
  LikerId = 'liker-id',
}

export type KeplrInstallCTAPreset = 'origin' | 'simple-banner' | 'fancy-banner';

export interface LikeCoinWalletConnectorConfig {
  chainId: string;
  chainName: string;
  rpcURL: string;
  restURL: string;
  coinType: number;
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  coinGeckoId?: string;
  bech32PrefixAccAddr: string;
  bech32PrefixAccPub: string;
  bech32PrefixValAddr: string;
  bech32PrefixValPub: string;
  bech32PrefixConsAddr: string;
  bech32PrefixConsPub: string;
  gasPriceStepLow?: number;
  gasPriceStepAverage?: number;
  gasPriceStepHigh?: number;

  walletURLForStaking?: string;

  initAttemptCount?: number;

  /**
   * Usage: https://docs.keplr.app/api/#interaction-options
   */
  keplrSignOptions?: KeplrSignOptions;
  keplrMobileWCBridge?: string;
  keplrInstallURLOverride?: string;
  keplrInstallCTAPreset?: KeplrInstallCTAPreset;

  likerLandAppWCBridge?: string;

  cosmostationAppWCBridge?: string;
  cosmostationDirectSignEnabled?: boolean;

  isShowMobileWarning?: boolean;

  availableMethods?: LikeCoinWalletConnectorMethodType[];

  language?: string;
}

export type LikeCoinWalletConnectorOptions = Required<
  LikeCoinWalletConnectorConfig
>;

export interface LikeCoinWalletConnectorMethod {
  name: string;
  type: LikeCoinWalletConnectorMethodType;
  defaultTier: number;
  isInstalled: boolean;
  isMobileOk: boolean;
  url: string;
  description: string;
}

export interface ArbitrarySigner {
  signArbitrary?: (
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ) => Promise<StdSignature>;
}

export type OfflineSigner = CosmJSOfflineSigner & ArbitrarySigner;

export interface LikeCoinWalletConnectorSession {
  method: LikeCoinWalletConnectorMethodType;
  accounts: AccountData[];
}

export interface LikeCoinWalletConnectorConnectionResult
  extends LikeCoinWalletConnectorSession {
  offlineSigner: OfflineSigner;
}

export type LikeCoinWalletConnectorConnectionResponse =
  | LikeCoinWalletConnectorConnectionResult
  | undefined;

export interface LikeCoinWalletConnectorInitResult {
  accounts: AccountData[];
  offlineSigner: OfflineSigner;
}

export type LikeCoinWalletConnectorInitResponse =
  | LikeCoinWalletConnectorInitResult
  | undefined;

export interface WalletConnectAccountResponse {
  address: Uint8Array;
  algo: string;
  bech32Address: string;
  isNanoLedger: boolean;
  name: string;
  pubKey: string; // In hex
}
