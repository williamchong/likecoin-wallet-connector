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

export function convertWalletConnectV2AccountResponse(account: any) {
  const { pubkey, ...accounts } = account;
  const isHex = pubkey.length === 66 && pubkey.match(/[0-9A-Fa-f]{6}/g);
  return {
    ...accounts,
    pubkey: Buffer.from(pubkey, isHex ? 'hex' : 'base64'),
  } as AccountData;
}
