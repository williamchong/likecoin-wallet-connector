import { AminoSignResponse } from '@cosmjs/amino';
import {
  AccountData,
  DirectSignResponse,
  OfflineSigner,
} from '@cosmjs/proto-signing';
import { IQRCodeModal } from '@walletconnect/legacy-types';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import {
  LikeCoinWalletConnectorInitResponse,
  LikeCoinWalletConnectorMethodType,
  LikeCoinWalletConnectorOptions,
} from '../types';

import Client from '@walletconnect/sign-client';
import { SessionTypes } from '@walletconnect/types';
import {
  getWalletConnectV2Accounts,
  getWalletConnectV2Connector,
} from './wallet-connect-v2';

const LIKER_LAND_APP_USER_AGENT_KEY = 'LikeCoinApp';

// Ref: https://github.com/likecoin/likecoin-app/blob/b1109871821b20228bf54cf736c032a8e9fe6ed0/app/services/api/api-config.ts#L6-L7
export const checkIsInLikerLandAppInAppBrowser = () =>
  navigator.userAgent.includes(LIKER_LAND_APP_USER_AGENT_KEY);

let client: Client | null = null;
let session: SessionTypes.Struct | null = null;

export async function initLikerLandApp(
  options: LikeCoinWalletConnectorOptions,
  qrcodeModal: IQRCodeModal,
  sessionMethod?: LikeCoinWalletConnectorMethodType,
  sessionAccounts: AccountData[] = []
): Promise<LikeCoinWalletConnectorInitResponse> {
  const metadata = options.walletConnectMetadata;
  if (checkIsInLikerLandAppInAppBrowser()) {
    metadata.name = LIKER_LAND_APP_USER_AGENT_KEY;
  }
  const wcConnector = await getWalletConnectV2Connector({
    projectId: options.walletConnectProjectId,
    metadata,
  });
  client = wcConnector;
  // TODO: allow selecting sessions
  if (!session) {
    const currentSessions = wcConnector.session.getAll();
    const reuseSession = currentSessions
      .reverse()
      .find((session: SessionTypes.Struct) => {
        return session.peer.metadata.name.includes('LikerLand');
      });
    if (reuseSession) {
      session = reuseSession;
    }
  }
  let accounts: AccountData[] = [];
  if (
    client &&
    session &&
    sessionMethod === LikeCoinWalletConnectorMethodType.LikerLandApp &&
    sessionAccounts.length > 0
  ) {
    accounts = sessionAccounts;
  } else {
    let connectRes;
    try {
      connectRes = await wcConnector.connect({
        pairingTopic: session?.topic,
        requiredNamespaces: {
          cosmos: {
            methods: [
              'cosmos_getAccounts',
              'cosmos_signDirect',
              'cosmos_signAmino',
            ],
            chains: [`cosmos:${options.chainId}`],
            events: [],
          },
        },
      });
    } catch (err) {
      if (session) {
        console.error(err);
        session = null;
        connectRes = await wcConnector.connect({
          requiredNamespaces: {
            cosmos: {
              methods: [
                'cosmos_getAccounts',
                'cosmos_signDirect',
                'cosmos_signAmino',
              ],
              chains: [`cosmos:${options.chainId}`],
              events: [],
            },
          },
        });
      } else {
        throw err;
      }
    }
    const { uri, approval } = connectRes;
    if (uri) {
      qrcodeModal.open(uri, () => {});
    }

    session = await approval();

    accounts = await getWalletConnectV2Accounts(
      wcConnector,
      options.chainId,
      session.topic
    );
    qrcodeModal.close();
  }
  const offlineSigner: OfflineSigner = {
    getAccounts: async () => Promise.resolve(accounts),
    signAmino: async (signerBech32Address, signDoc) => {
      const result = await wcConnector.request({
        topic: session!.topic,
        chainId: `cosmos:${options.chainId}`,
        request: {
          method: 'cosmos_signAmino',
          params: {
            signerAddress: signerBech32Address,
            signDoc,
          },
        },
      });
      return result as AminoSignResponse;
    },
    signDirect: async (signerBech32Address, signDoc) => {
      const { signed: signedInJSON, signature } = (await wcConnector.request({
        topic: session!.topic,
        chainId: `cosmos:${options.chainId}`,
        request: {
          method: 'cosmos_signDirect',
          params: {
            signerAddress: signerBech32Address,
            signDoc: SignDoc.toJSON(signDoc),
          },
        },
      })) as any;
      return {
        signed: SignDoc.fromJSON(signedInJSON),
        signature,
      } as DirectSignResponse;
    },
  };

  return {
    accounts,
    offlineSigner,
  };
}

export async function onLikerLandAppDisconnect(topic = session?.topic) {
  if (topic) {
    if (!client) return;
    await client.disconnect({
      topic,
      reason: {
        code: 6000,
        message: 'USER_DISCONNECTED',
      },
    });
    session = null;
  }
}
