import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AccountData } from '@cosmjs/proto-signing';
import WalletConnect from '@walletconnect/client';
import { IQRCodeModal } from '@walletconnect/types';

import { ConnectionMethodSelectionDialog } from './components/connection-method-selection-dialog';
import { WalletConnectQRCodeDialog } from './components/walletconnect-dialog';

import { initCosmostation } from './utils/cosmostation';
import { initKeplr } from './utils/keplr';
import {
  getKeplrMobileWCConnector,
  initKeplrMobile,
} from './utils/keplr-mobile';
import {
  getLikerLandAppWCConnector,
  initLikerLandApp,
} from './utils/liker-land-app';
import { deserializePublicKey, serializePublicKey } from './utils/wallet';

import {
  LikeCoinWalletConnectorConfig,
  LikeCoinWalletConnectorConnectionResponse,
  LikeCoinWalletConnectorConnectionResult,
  LikeCoinWalletConnectorInitResponse,
  LikeCoinWalletConnectorMethodType,
  LikeCoinWalletConnectorOptions,
  LikeCoinWalletConnectorSession,
} from './types';

import './style.css';

export * from './types';

const CONTAINER_ID = 'likecoin-wallet-connector';
const SESSION_KEY = 'likecoin_wallet_connector_session';

const WC_BRIGDE = 'https://bridge.walletconnect.org';

export class LikeCoinWalletConnector {
  public options: LikeCoinWalletConnectorOptions;

  public sessionAccounts: AccountData[];
  public sessionMethod?: LikeCoinWalletConnectorMethodType;

  private _renderingRoot: Root;

  private _isConnectionMethodSelectDialogOpen = false;
  private _isWalletConnectQRCodeDialogOpen = false;

  constructor(options: LikeCoinWalletConnectorConfig) {
    this.options = {
      chainId: options.chainId,
      chainName: options.chainName,
      rpcURL: options.rpcURL,
      restURL: options.restURL,
      coinType: options.coinType,
      coinDenom: options.coinDenom,
      coinMinimalDenom: options.coinMinimalDenom,
      coinDecimals: options.coinDecimals,
      bech32PrefixAccAddr: options.bech32PrefixAccAddr,
      bech32PrefixAccPub: options.bech32PrefixAccPub,
      bech32PrefixValAddr: options.bech32PrefixValAddr,
      bech32PrefixValPub: options.bech32PrefixValPub,
      bech32PrefixConsAddr: options.bech32PrefixConsAddr,
      bech32PrefixConsPub: options.bech32PrefixConsPub,
      gasPriceStepLow: options.gasPriceStepLow || 1,
      gasPriceStepAverage: options.gasPriceStepAverage || 10,
      gasPriceStepHigh: options.gasPriceStepHigh || 1000,
      initAttemptCount: options.initAttemptCount || 3,
      availableMethods: options.availableMethods || [
        LikeCoinWalletConnectorMethodType.Keplr,
        LikeCoinWalletConnectorMethodType.KeplrMobile,
        LikeCoinWalletConnectorMethodType.LikerId,
        LikeCoinWalletConnectorMethodType.Cosmostation,
      ],
      keplrSignOptions: options.keplrSignOptions || {},
      keplrMobileWCBridge: options.keplrMobileWCBridge || WC_BRIGDE,
      likerLandAppWCBridge: options.likerLandAppWCBridge || WC_BRIGDE,
    };

    this.sessionAccounts = [];

    const container = document.createElement('div');
    container.setAttribute('id', CONTAINER_ID);
    document.body.appendChild(container);
    this._renderingRoot = createRoot(container);
  }

  /**
   * @deprecated Please use openConnectionMethodSelectionDialog() instead
   */
  openConnectWalletModal = () => this.openConnectionMethodSelectionDialog();

  openConnectionMethodSelectionDialog = () => {
    if (this._isConnectionMethodSelectDialogOpen)
      return Promise.resolve(undefined);

    return new Promise<LikeCoinWalletConnectorConnectionResponse>(resolve => {
      this._renderingRoot.render(
        <ConnectionMethodSelectionDialog
          methods={this.options.availableMethods}
          onClose={() => {
            this.closeDialog();
            resolve(undefined);
          }}
          onConnect={async method => {
            const result = await this.selectMethod(method);
            resolve(result);
          }}
        />
      );

      this._isConnectionMethodSelectDialogOpen = true;
    });
  };

  private openWalletConnectQRCodeDialog = (
    type: LikeCoinWalletConnectorMethodType,
    uri: string
  ) => {
    if (this._isWalletConnectQRCodeDialogOpen)
      return Promise.resolve(undefined);

    return new Promise<LikeCoinWalletConnectorConnectionResponse>(resolve => {
      this._renderingRoot.render(
        <WalletConnectQRCodeDialog
          type={type}
          uri={uri}
          onClose={() => {
            this.closeDialog();
            resolve(undefined);
          }}
        />
      );

      this._isWalletConnectQRCodeDialogOpen = true;
    });
  };

  closeDialog = () => {
    this._renderingRoot.render(null);
    this._isConnectionMethodSelectDialogOpen = false;
    this._isWalletConnectQRCodeDialogOpen = false;
  };

  private selectMethod = async (method: LikeCoinWalletConnectorMethodType) => {
    this.closeDialog();

    return this.init(method);
  };

  disconnect = async () => {
    const session = this.loadSession();
    if (session) {
      let wcConnector: WalletConnect | undefined;
      switch (session.method) {
        case LikeCoinWalletConnectorMethodType.KeplrMobile:
          wcConnector = getKeplrMobileWCConnector({
            bridge: this.options.keplrMobileWCBridge,
          });
          break;

        case LikeCoinWalletConnectorMethodType.LikerId:
          wcConnector = getLikerLandAppWCConnector({
            bridge: this.options.likerLandAppWCBridge,
          });
          break;

        default:
          break;
      }
      if (wcConnector) {
        await wcConnector.killSession();
      }
    }
    this.deleteSession();
  };

  private getQRCodeDialog: (
    methodType: LikeCoinWalletConnectorMethodType
  ) => IQRCodeModal = (methodType: LikeCoinWalletConnectorMethodType) => ({
    open: uri => {
      this.openWalletConnectQRCodeDialog(methodType, uri);
    },
    close: () => {
      this.closeDialog();
    },
  });

  init = async (methodType: LikeCoinWalletConnectorMethodType) => {
    let initiator: Promise<LikeCoinWalletConnectorInitResponse>;
    switch (methodType) {
      case LikeCoinWalletConnectorMethodType.Keplr:
        initiator = initKeplr(this.options);
        break;

      case LikeCoinWalletConnectorMethodType.KeplrMobile:
        initiator = initKeplrMobile(
          this.options,
          this.getQRCodeDialog(LikeCoinWalletConnectorMethodType.KeplrMobile),
          this.sessionMethod,
          this.sessionAccounts
        );
        break;

      case LikeCoinWalletConnectorMethodType.Cosmostation:
        initiator = initCosmostation(this.options);
        break;

      case LikeCoinWalletConnectorMethodType.LikerId:
        initiator = initLikerLandApp(
          this.options,
          this.getQRCodeDialog(LikeCoinWalletConnectorMethodType.LikerId),
          this.sessionMethod,
          this.sessionAccounts
        );
        break;

      default:
        throw new Error('METHOD_NOT_SUPPORTED');
    }

    const result = await initiator;
    if (!result) throw new Error('ACCOUNT_INIT_FAILED');

    this.saveSession({
      method: methodType,
      accounts: [...result.accounts],
    });

    return {
      method: methodType,
      ...result,
    } as LikeCoinWalletConnectorConnectionResult;
  };

  initIfNecessary: () => Promise<
    LikeCoinWalletConnectorConnectionResponse
  > = async () => {
    const session = this.restoreSession();
    return session?.method ? this.init(session.method) : undefined;
  };

  private saveSession = ({
    method,
    accounts,
  }: LikeCoinWalletConnectorSession) => {
    this.sessionAccounts = accounts;
    this.sessionMethod = method;
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        method,
        accounts: accounts.map(account => ({
          ...account,
          pubkey: serializePublicKey(account.pubkey),
        })),
      })
    );
  };

  private loadSession = () => {
    try {
      const serializedSession = window.localStorage.getItem(SESSION_KEY);
      if (serializedSession) {
        const { method, accounts = [] } = JSON.parse(serializedSession);
        if (
          Object.values(LikeCoinWalletConnectorMethodType).includes(method) &&
          Array.isArray(accounts)
        ) {
          return {
            method,
            accounts: accounts.map(account => ({
              ...account,
              pubkey: deserializePublicKey(account.pubkey),
            })),
          } as LikeCoinWalletConnectorSession;
        }
      }
    } catch {
      // Unable to decode session
    }
    return undefined;
  };

  restoreSession = () => {
    const session = this.loadSession();
    if (session) {
      this.sessionAccounts = session.accounts;
      this.sessionMethod = session.method;
    }
    return session;
  };

  private deleteSession = () => {
    this.sessionAccounts = [];
    this.sessionMethod = undefined;
    window.localStorage.removeItem(SESSION_KEY);
  };
}
