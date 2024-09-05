import {
  AccountData,
  OfflineSigner as CosmJSOfflineSigner,
} from '@cosmjs/proto-signing';
import { StdSignature } from '@cosmjs/amino';
import { KeplrSignOptions } from '@keplr-wallet/types';
import { SignClientTypes } from '@walletconnect/types';

export enum LikeCoinWalletConnectorMethodType {
  LikerId = 'liker-id',
  Keplr = 'keplr',
  KeplrMobile = 'keplr-mobile',
  Cosmostation = 'cosmostation',
  CosmostationMobile = 'cosmostation-mobile',
  LikerLandApp = 'likerland-app',
  Leap = 'leap',
  MetaMaskLeap = 'metamask-leap',
  WalletConnectV2 = 'walletconnect-v2',
}

export interface LikeCoinWalletConnectorMethodConfigurable {
  name?: string;
  tier?: number;
  isRecommended?: boolean;
  description?: string;
}

export type LikeCoinWalletConnectorMethodConfig =
  | LikeCoinWalletConnectorMethodType
  | [
      LikeCoinWalletConnectorMethodType,
      LikeCoinWalletConnectorMethodConfigurable
    ];

export interface LikeCoinWalletConnectorMethod
  extends LikeCoinWalletConnectorMethodConfigurable {
  type: LikeCoinWalletConnectorMethodType;
  isInstalled: boolean;
  isMobileOk: boolean;
  url: string;
}

export type KeplrInstallCTAPreset = 'origin' | 'simple-banner' | 'fancy-banner';

export type LikeCoinWalletConnectorEvent =
  | { type: 'toggle_collapsible_connection_method_list'; isCollapsed: boolean }
  | {
      type: 'select_connection_method';
      method: LikeCoinWalletConnectorMethodType;
    };

export type AuthCoreInitialScreen = 'signin' | 'register';

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

  walletConnectProjectId?: string;
  walletConnectMetadata?: SignClientTypes.Metadata;

  isShowMobileWarning?: boolean;

  availableMethods?: LikeCoinWalletConnectorMethodConfig[];

  connectWalletTitle?: string;
  connectWalletMobileWarning?: string;

  authcoreClientId?: string;
  authcoreApiHost?: string;
  authcoreRedirectUrl?: string;
  authcoreSocialLoginPanePosition?: 'top' | 'bottom';

  language?: string;

  onEvent?: (event: LikeCoinWalletConnectorEvent) => void;
}

export type LikeCoinWalletConnectorOptions = Required<
  LikeCoinWalletConnectorConfig
>;

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
  params?: any;
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
  params?: any;
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
