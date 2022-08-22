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
  description: string;
}

export interface LikeCoinWalletConnectorSession {
  method: LikeCoinWalletConnectorMethodType;
  accounts: readonly AccountData[];
}

export interface LikeCoinWalletConnectorConnectionResult
  extends LikeCoinWalletConnectorSession {
  offlineSigner: OfflineSigner;
}

export type LikeCoinWalletConnectorConnectionResponse =
  | LikeCoinWalletConnectorConnectionResult
  | undefined;

export interface LikeCoinWalletConnectorInitResult {
  accounts: readonly AccountData[];
  offlineSigner: OfflineSigner;
}

export type LikeCoinWalletConnectorInitResponse =
  | LikeCoinWalletConnectorInitResult
  | undefined;
