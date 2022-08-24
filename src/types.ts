import { AccountData, OfflineSigner } from '@cosmjs/proto-signing';

export enum LikeCoinWalletConnectorMethodType {
  Keplr = 'keplr',
  KeplrMobile = 'keplr-mobile',
  Cosmostation = 'cosmostation',
  LikerId = 'liker-id',
}

export interface LikeCoinWalletConnectorMethod {
  name: string;
  type: LikeCoinWalletConnectorMethodType;
  tier: number;
  isMobileOk: boolean;
  url: string;
  description: string;
}

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
