import { AccountData } from '@cosmjs/proto-signing';

import { WalletConnectAccountResponse } from '../types';

export function serializePublicKey(value: Uint8Array) {
  return Buffer.from(value).toString('hex');
}

export function deserializePublicKey(value: string) {
  return new Uint8Array(Buffer.from(value, 'hex'));
}

export function convertWalletConnectAccountResponse(
  account: WalletConnectAccountResponse
) {
  const { bech32Address, algo, pubKey: pubKeyInHex } = account;
  if (!bech32Address || !algo || !pubKeyInHex) {
    throw new Error('WALLETCONNECT_ACCOUNT_RESPONSE_INVALID');
  }
  const pubkey = deserializePublicKey(pubKeyInHex);
  return {
    address: bech32Address,
    pubkey,
    algo,
  } as AccountData;
}
