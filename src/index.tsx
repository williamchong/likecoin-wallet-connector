import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { OfflineAminoSigner } from '@cosmjs/amino';
import { AccountData, OfflineSigner } from '@cosmjs/proto-signing';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { payloadId } from '@walletconnect/utils';
import { IWalletConnectOptions } from '@walletconnect/types';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { CosmostationDirectSigner } from './utils/cosmostation';

import { ConnectionMethodSelectionDialog } from './connection-method-selection-dialog';
import { LikeCoinWalletConnectorMethod } from './types';

import './style.css';

export * from './types';

const CONTAINER_ID = 'likecoin-wallet-connector';
const SESSION_KEY = 'likecoin_wallet_connector_session';

export interface LikeCoinWalletConnectorOptions {
  chainId: string;
  chainName: string;
  rpcURL: string;
  restURL: string;
  coinType: number;
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  bech32PrefixAccAddr: string;
  bech32PrefixAccPub: string;
  bech32PrefixValAddr: string;
  bech32PrefixValPub: string;
  bech32PrefixConsAddr: string;
  bech32PrefixConsPub: string;
  gasPriceStepLow: number;
  gasPriceStepAverage: number;
  gasPriceStepHigh: number;

  initAttemptCount: number;
  availableMethods?: LikeCoinWalletConnectorMethod[];
}

export class LikeCoinWalletConnector {
  public chainId: string;
  public chainName: string;
  public rpcURL: string;
  public restURL: string;
  public coinType: number;
  public coinDenom: string;
  public coinMinimalDenom: string;
  public coinDecimals: number;
  public bech32PrefixAccAddr: string;
  public bech32PrefixAccPub: string;
  public bech32PrefixValAddr: string;
  public bech32PrefixValPub: string;
  public bech32PrefixConsAddr: string;
  public bech32PrefixConsPub: string;
  public gasPriceStepLow: number;
  public gasPriceStepAverage: number;
  public gasPriceStepHigh: number;

  public initAttemptCount: number;
  public availableMethods: LikeCoinWalletConnectorMethod[];

  private _renderingRoot: Root;

  private _isConnectionMethodSelectDialogOpen = false;

  constructor(options: LikeCoinWalletConnectorOptions) {
    this.chainId = options.chainId;
    this.chainName = options.chainName;
    this.rpcURL = options.rpcURL;
    this.restURL = options.restURL;
    this.coinType = options.coinType;
    this.coinDenom = options.coinDenom;
    this.coinMinimalDenom = options.coinMinimalDenom;
    this.coinDecimals = options.coinDecimals;
    this.bech32PrefixAccAddr = options.bech32PrefixAccAddr;
    this.bech32PrefixAccPub = options.bech32PrefixAccPub;
    this.bech32PrefixValAddr = options.bech32PrefixValAddr;
    this.bech32PrefixValPub = options.bech32PrefixValPub;
    this.bech32PrefixConsAddr = options.bech32PrefixConsAddr;
    this.bech32PrefixConsPub = options.bech32PrefixConsPub;
    this.gasPriceStepLow = options.gasPriceStepLow || 1;
    this.gasPriceStepAverage = options.gasPriceStepAverage || 10;
    this.gasPriceStepHigh = options.gasPriceStepHigh || 1000;
    this.initAttemptCount = options.initAttemptCount || 3;
    this.availableMethods = options.availableMethods || [
      LikeCoinWalletConnectorMethod.Keplr,
      LikeCoinWalletConnectorMethod.KeplrMobile,
      LikeCoinWalletConnectorMethod.LikerId,
      LikeCoinWalletConnectorMethod.Cosmostation,
    ];

    const container = document.createElement('div');
    container.setAttribute('id', CONTAINER_ID);
    document.body.appendChild(container);
    this._renderingRoot = createRoot(container);
  }

  openConnectWalletModal() {
    if (this._isConnectionMethodSelectDialogOpen)
      return Promise.resolve(undefined);

    return new Promise<{ accounts: any; offlineSigner: any } | undefined>(
      resolve => {
        this._renderingRoot.render(
          <ConnectionMethodSelectionDialog
            methods={this.availableMethods}
            onClose={() => {
              this.closeConnectWalletModal();
              resolve(undefined);
            }}
            onSelectConnectionMethod={async method => {
              const result = await this.selectMethod(method);
              resolve(result);
            }}
          />
        );

        this._isConnectionMethodSelectDialogOpen = true;
      }
    );
  }

  closeConnectWalletModal = () => {
    this._renderingRoot.render(null);
    const modalWrappers = document.getElementsByClassName('ReactModalPortal');
    if (modalWrappers && modalWrappers.length > 0) {
      document.body.removeChild(modalWrappers[0]);
    }
    this._isConnectionMethodSelectDialogOpen = false;
  };

  selectMethod = async (method: LikeCoinWalletConnectorMethod) => {
    this.closeConnectWalletModal();

    return this.init(method);
  };

  disconnect = () => {
    this.deleteSession();
  };

  init = async (method: LikeCoinWalletConnectorMethod) => {
    let initiator: Promise<
      | {
          accounts: any;
          offlineSigner: any;
        }
      | undefined
    >;
    switch (method) {
      case LikeCoinWalletConnectorMethod.Keplr:
        initiator = this.initKeplr();
        break;

      case LikeCoinWalletConnectorMethod.KeplrMobile:
        initiator = this.initKeplrMobile();
        break;

      case LikeCoinWalletConnectorMethod.Cosmostation:
        initiator = this.initCosmostation();
        break;

      case LikeCoinWalletConnectorMethod.LikerId:
        initiator = this.initLikerID();
        break;

      default:
        throw new Error('METHOD_NOT_SUPPORTED');
    }

    const result = await initiator;
    if (!result) throw new Error('ACCOUNT_INIT_FAILED');

    this.saveSession({
      method,
      accounts: result.accounts,
    });

    return result;
  };

  initIfNecessary = () => {
    const session = this.restoreSession();
    if (session?.method) {
      return this.init(session.method as LikeCoinWalletConnectorMethod);
    }
    return undefined;
  };

  saveSession = ({
    method,
    accounts,
  }: {
    method: LikeCoinWalletConnectorMethod;
    accounts: any[];
  }) => {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        method,
        accounts,
      })
    );
  };

  restoreSession = () => {
    let session;
    try {
      const serializedSession = window.localStorage.getItem(SESSION_KEY);
      if (serializedSession) {
        session = JSON.parse(serializedSession);
      }
    } catch {
      // Unable to decode session
    }
    return session;
  };

  deleteSession = () => {
    window.localStorage.removeItem(SESSION_KEY);
  };

  initKeplr = async (trys = 0) => {
    const w = window as any;

    if (!w.keplr) {
      if (trys < this.initAttemptCount) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.initKeplr(trys + 1);
        return;
      }
      throw new Error('KEPLR_NOT_INSTALLED');
    }

    if (!w.keplr.experimentalSuggestChain) {
      throw new Error('KEPLR_VERSION_OUTDATED');
    }

    try {
      await w.keplr.experimentalSuggestChain({
        chainId: this.chainId,
        chainName: this.chainName,
        rpc: this.rpcURL,
        rest: this.restURL,
        stakeCurrency: {
          coinDenom: this.coinDenom,
          coinMinimalDenom: this.coinMinimalDenom,
          coinDecimals: this.coinDecimals,
        },
        bip44: {
          coinType: this.coinType,
        },
        bech32Config: {
          bech32PrefixAccAddr: this.bech32PrefixAccAddr,
          bech32PrefixAccPub: this.bech32PrefixAccPub,
          bech32PrefixValAddr: this.bech32PrefixValAddr,
          bech32PrefixValPub: this.bech32PrefixValPub,
          bech32PrefixConsAddr: this.bech32PrefixConsAddr,
          bech32PrefixConsPub: this.bech32PrefixConsPub,
        },
        currencies: [
          {
            coinDenom: this.coinDenom,
            coinMinimalDenom: this.coinMinimalDenom,
            coinDecimals: this.coinDecimals,
          },
        ],
        feeCurrencies: [
          {
            coinDenom: this.coinDenom,
            coinMinimalDenom: this.coinMinimalDenom,
            coinDecimals: this.coinDecimals,
          },
        ],
        coinType: this.coinType,
        gasPriceStep: {
          low: this.gasPriceStepLow,
          average: this.gasPriceStepAverage,
          high: this.gasPriceStepHigh,
        },
        features: ['ibc-go', 'ibc-transfer', 'no-legacy-stdTx', 'stargate'],
      });
    } catch {
      throw new Error('KEPLR_INIT_FAILED');
    }

    await w.keplr.enable(this.chainId);

    const offlineSigner = w.getOfflineSigner(this.chainId);
    const accounts = await offlineSigner.getAccounts();
    return {
      accounts,
      offlineSigner,
    };
  };

  initCosmostation = async (trys = 0) => {
    const w = window as any;

    if (!w.cosmostation) {
      if (trys < this.initAttemptCount) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.initCosmostation(trys + 1);
        return;
      }
      throw new Error('COSMOSTATION_NOT_INSTALLED');
    }

    const supportedChains = await w.cosmostation.tendermint.request({
      method: 'ten_supportedChainNames',
    });
    if (
      !supportedChains.official.includes(this.chainName) &&
      !supportedChains.unofficial.includes(this.chainName)
    ) {
      await w.cosmostation.tendermint.request({
        method: 'ten_addChain',
        params: {
          chainId: this.chainId,
          chainName: this.chainName,
          addressPrefix: this.bech32PrefixAccAddr,
          baseDenom: this.coinMinimalDenom,
          displayDenom: this.coinDenom,
          restURL: this.restURL,
          coinType: this.coinType.toString(),
          decimals: this.coinDecimals,
          gasRate: {
            tiny: `${this.gasPriceStepLow}`,
            low: `${this.gasPriceStepAverage}`,
            average: `${this.gasPriceStepHigh}`,
          },
          sendGas: '350000',
        },
      });
    }
    let account = await w.cosmostation.tendermint.request({
      method: 'ten_account',
      params: { chainName: this.chainName },
    });
    if (!account) {
      account = await w.cosmostation.tendermint.request({
        method: 'ten_requestAccount',
        params: { chainName: this.chainName },
      });
    }

    const offlineSigner = new CosmostationDirectSigner(this.chainName);

    return {
      accounts: [account],
      offlineSigner,
    };
  };

  initKeplrMobile = async () => {
    const wcConnectOptions: IWalletConnectOptions = {
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: QRCodeModal,
      qrcodeModalOptions: {
        desktopLinks: [],
        mobileLinks: [],
      },
      signingMethods: [
        'keplr_enable_wallet_connect_v1',
        'keplr_get_key_wallet_connect_v1',
        'keplr_sign_amino_wallet_connect_v1',
      ],
    };
    let wcConnector = new WalletConnect(wcConnectOptions);
    if (wcConnector?.connected) {
      await wcConnector.killSession();
      wcConnector = new WalletConnect(wcConnectOptions);
    }

    if (!wcConnector.connected) {
      await wcConnector.connect();
    }

    await wcConnector.sendCustomRequest({
      id: payloadId(),
      jsonrpc: '2.0',
      method: 'keplr_enable_wallet_connect_v1',
      params: [this.chainId],
    });

    const [account] = await wcConnector.sendCustomRequest({
      id: payloadId(),
      jsonrpc: '2.0',
      method: 'keplr_get_key_wallet_connect_v1',
      params: [this.chainId],
    });

    if (!account) {
      throw new Error('WALLETCONNECT_ACCOUNT_NOT_FOUND');
    }

    const { bech32Address, algo, pubKey: pubKeyInHex } = account;
    if (!bech32Address || !algo || !pubKeyInHex) {
      throw new Error('WALLETCONNECT_ACCOUNT_FORMAT_INVALID');
    }
    const pubkey = new Uint8Array(Buffer.from(pubKeyInHex, 'hex'));
    const accounts: readonly AccountData[] = [
      {
        address: bech32Address,
        algo,
        pubkey,
      },
    ];
    const offlineSigner: OfflineAminoSigner = {
      getAccounts: () => Promise.resolve(accounts),
      signAmino: async (signerBech32Address, signDoc) => {
        const [result] = await wcConnector.sendCustomRequest({
          id: payloadId(),
          jsonrpc: '2.0',
          method: 'keplr_sign_amino_wallet_connect_v1',
          params: [this.chainId, signerBech32Address, signDoc],
        });
        return result;
      },
    };

    return {
      accounts: [account],
      offlineSigner,
    };
  };

  initLikerID = async () => {
    const wcConnectOptions: IWalletConnectOptions = {
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: QRCodeModal,
      qrcodeModalOptions: {
        desktopLinks: [],
        mobileLinks: [],
      },
    };
    let wcConnector = new WalletConnect(wcConnectOptions);
    if (wcConnector?.connected) {
      await wcConnector.killSession();
      wcConnector = new WalletConnect(wcConnectOptions);
    }

    let account: any;
    if (!wcConnector.connected) {
      await wcConnector.connect();
      [account] = await wcConnector.sendCustomRequest({
        id: payloadId(),
        jsonrpc: '2.0',
        method: 'cosmos_getAccounts',
        params: [this.chainId],
      });
    }

    if (!account) {
      throw new Error('WALLETCONNECT_ACCOUNT_NOT_FOUND');
    }

    const { bech32Address, algo, pubKey: pubKeyInHex } = account;
    if (!bech32Address || !algo || !pubKeyInHex) {
      throw new Error('WALLETCONNECT_ACCOUNT_FORMAT_INVALID');
    }
    const pubkey = new Uint8Array(Buffer.from(pubKeyInHex, 'hex'));
    const accounts: readonly AccountData[] = [
      { address: bech32Address, pubkey, algo },
    ];
    const offlineSigner: OfflineSigner = {
      getAccounts: () => Promise.resolve(accounts),
      signDirect: async (signerBech32Address, signDoc) => {
        const signDocInJSON = SignDoc.toJSON(signDoc);
        const resInJSON = await wcConnector.sendCustomRequest({
          id: payloadId(),
          jsonrpc: '2.0',
          method: 'cosmos_signDirect',
          params: [signerBech32Address, signDocInJSON],
        });

        return {
          signed: SignDoc.fromJSON(resInJSON.signed),
          signature: resInJSON.signature,
        };
      },
    };

    return {
      accounts: [account],
      offlineSigner,
    };
  };
}
