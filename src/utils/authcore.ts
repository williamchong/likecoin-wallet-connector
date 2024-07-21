import { AminoSignResponse } from '@cosmjs/amino';
import {
  AccountData,
  DirectSignResponse,
  OfflineSigner,
  makeSignBytes,
} from '@cosmjs/proto-signing';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import {
  AuthcoreCosmosProvider,
  AuthcoreVaultClient,
} from '@likecoin/secretd-js';
import { AuthCoreAuthClient, AuthCoreWidgets } from '@likecoin/authcore-js';

import {
  LikeCoinWalletConnectorInitResponse,
  LikeCoinWalletConnectorOptions,
  AuthCoreInitialScreen,
} from '../types';
import { convertAddressPrefix } from './wallet';

let cosmosProvider: any | null = null;
let keyVaultClient: any | null = null;

export async function initAuthcore(
  options: LikeCoinWalletConnectorOptions,
  {
    accessToken,
    containerId,
    initialScreen = 'signin',
  }: {
    accessToken?: string;
    containerId?: string;
    initialScreen?: AuthCoreInitialScreen;
  } = {}
): Promise<LikeCoinWalletConnectorInitResponse> {
  const authcoreApiHost = options.authcoreApiHost;

  let accounts: AccountData[] = [];
  if (accessToken) {
    keyVaultClient = await new AuthcoreVaultClient({
      apiBaseURL: authcoreApiHost,
      accessToken,
    });
    cosmosProvider = await new AuthcoreCosmosProvider({
      client: keyVaultClient,
    });
    const addresses = await cosmosProvider.getAddresses();
    accounts = addresses.map((address: string) => {
      const likeAddress = convertAddressPrefix(address);
      const pubkey = {
        type: 'tendermint/PubKeySecp256k1',
        value: cosmosProvider.wallets[0].publicKey,
      };
      const pubkeyBytes = Buffer.from(pubkey.value, 'base64');
      return {
        algo: 'secp256k1',
        address: likeAddress,
        pubkey: pubkeyBytes,
      };
    });
  } else {
    if (!containerId) {
      throw new Error('containerId is required for initAuthcore');
    }

    new AuthCoreWidgets.Login({
      clientId: options.authcoreClientId,
      primaryColour: '#28646e',
      container: containerId,
      root: `${authcoreApiHost}/widgets`,
      initialScreen: initialScreen,
      socialLoginPaneStyle: 'top',
      socialLoginPaneOption: 'grid',
      internal: true,
      language: options.language?.toLowerCase().includes('zh') ? 'zh-hk' : 'en',
      fixedContact: false,
      successRedirectUrl: options.authcoreRedirectUrl,
    });
    return;
  }
  const offlineSigner: OfflineSigner = {
    getAccounts: async () => Promise.resolve(accounts),
    signAmino: async (signerBech32Address, data) => {
      const { signatures, ...signed } = await cosmosProvider.sign(
        data,
        signerBech32Address
      );
      return { signed, signature: signatures[0] } as AminoSignResponse;
    },
    signDirect: async (signerBech32Address, signDoc) => {
      const dataToSign = makeSignBytes(signDoc);
      const { signed, signatures } = await cosmosProvider.directSign(
        dataToSign,
        signerBech32Address
      );
      const decodedSigned = SignDoc.decode(signed);
      return {
        signed: decodedSigned,
        signature: signatures[0],
      } as DirectSignResponse;
    },
  };

  return {
    accounts,
    offlineSigner,
    params: { accessToken },
  };
}

export async function handleAuthcoreRedirect(
  options: LikeCoinWalletConnectorOptions,
  { code }: { code: string }
) {
  const authClient = await new AuthCoreAuthClient({
    apiBaseURL: options.authcoreApiHost,
  });
  const token = await authClient.createAccessToken(code);
  const { access_token: accessToken, id_token: idToken } = token;
  await authClient.setAccessToken(accessToken);
  const user = await authClient.getCurrentUser();
  return { accessToken, user, idToken };
}
