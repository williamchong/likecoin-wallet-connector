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
