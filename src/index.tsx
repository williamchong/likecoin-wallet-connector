import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AccountData } from '@cosmjs/proto-signing';
import { IQRCodeModal } from '@walletconnect/legacy-types';
import EventEmitter from 'events';

import { AuthcoreDialog } from './components/authcore-dialog';
import { ConnectionMethodSelectionDialog } from './components/connection-method-selection-dialog';
import { WalletConnectQRCodeDialog } from './components/walletconnect-dialog';

import {
  initCosmostation,
  listenCosmostationAccountChange,
  removeCosmostationAccountChangeListener,
} from './utils/cosmostation';
import {
  checkIsInCosmostationMobileInAppBrowser,
  onCosmostationMobileDisconnect,
  initCosmostationMobile,
} from './utils/cosmostation-mobile';
import {
  initWalletConnectV2Connector,
  onWalletConnectV2Disconnect,
  listenWalletConnectV2StoreChange,
} from './utils/wallet-connect-v2';
import { initMetaMaskLeap } from './utils/metamask-leap';
import {
  checkIsInKeplrMobileInAppBrowser,
  initKeplr,
  listenKeplrKeyStoreChange,
  removeKeplrKeyStoreChangeListener,
} from './utils/keplr';
import { onKeplrMobileDisconnect, initKeplrMobile } from './utils/keplr-mobile';
import {
  checkIsInLikerLandAppInAppBrowser,
  onLikerLandAppDisconnect,
  initLikerLandApp,
} from './utils/liker-land-app';
import {
  initLeap,
  listenLeapKeyStoreChange,
  removeLeapKeyStoreChangeListener,
} from './utils/leap';
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
import { IntlProvider } from './i18n';
import { handleAuthcoreRedirect, initAuthcore } from './utils/authcore';

export * from './types';

const CONTAINER_ID = 'likecoin-wallet-connector';
const SESSION_KEY = 'likecoin_wallet_connector_session';

const WC_BRIGDE = 'https://bridge.walletconnect.org';

const SOCIAL_LOGIN_OPTIONS = {
  HIDE_SOCIAL: 'likecoin-app-hidesocial',
  DEFAULT: 'likecoin-app',
};

export class LikeCoinWalletConnector {
  public options: LikeCoinWalletConnectorOptions;

  public sessionAccounts: AccountData[];
  public sessionMethod?: LikeCoinWalletConnectorMethodType;

  private _events: EventEmitter;

  private _renderingRoot: Root;

  private _isConnectionMethodSelectDialogOpen = false;
  private _isWalletConnectQRCodeDialogOpen = false;

  private _accountChangeListener?: () => void;

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
      coinGeckoId: options.coinGeckoId || '',
      bech32PrefixAccAddr: options.bech32PrefixAccAddr,
      bech32PrefixAccPub: options.bech32PrefixAccPub,
      bech32PrefixValAddr: options.bech32PrefixValAddr,
      bech32PrefixValPub: options.bech32PrefixValPub,
      bech32PrefixConsAddr: options.bech32PrefixConsAddr,
      bech32PrefixConsPub: options.bech32PrefixConsPub,
      gasPriceStepLow: options.gasPriceStepLow || 1000,
      gasPriceStepAverage: options.gasPriceStepAverage || 10000,
      gasPriceStepHigh: options.gasPriceStepHigh || 1000000,
      walletURLForStaking: options.walletURLForStaking || '',
      initAttemptCount: options.initAttemptCount || 3,
      availableMethods: options.availableMethods || [
        LikeCoinWalletConnectorMethodType.Keplr,
        LikeCoinWalletConnectorMethodType.KeplrMobile,
        LikeCoinWalletConnectorMethodType.LikerId,
        LikeCoinWalletConnectorMethodType.LikerLandApp,
        LikeCoinWalletConnectorMethodType.Cosmostation,
        LikeCoinWalletConnectorMethodType.WalletConnectV2,
      ],
      keplrSignOptions: options.keplrSignOptions || {},
      keplrMobileWCBridge: options.keplrMobileWCBridge || WC_BRIGDE,
      keplrInstallURLOverride: options.keplrInstallURLOverride || '',
      keplrInstallCTAPreset: options.keplrInstallCTAPreset || 'origin',
      likerLandAppWCBridge: options.likerLandAppWCBridge || WC_BRIGDE,
      cosmostationAppWCBridge: options.cosmostationAppWCBridge || WC_BRIGDE,
      cosmostationDirectSignEnabled:
        options.cosmostationDirectSignEnabled || false,
      walletConnectProjectId: options.walletConnectProjectId || '',
      walletConnectMetadata: options.walletConnectMetadata || {
        description: 'LikeCoin Wallet Connect Lib',
        url: 'https://like.co',
        icons: ['https://like.co/logo.png'],
        name: 'LikeCoin Wallet Connect',
      },
      connectWalletTitle: options.connectWalletTitle || '',
      connectWalletMobileWarning: options.connectWalletMobileWarning || '',
      isShowMobileWarning:
        options.isShowMobileWarning !== undefined
          ? !!options.isShowMobileWarning
          : true,

      language: options.language || 'en',
      authcoreClientId: options.authcoreClientId || SOCIAL_LOGIN_OPTIONS.DEFAULT,
      authcoreApiHost: options.authcoreApiHost || 'https://authcore.like.co',
      authcoreRedirectUrl: options.authcoreRedirectUrl || '',

      onEvent: options.onEvent || (() => {}),
    };

    this.sessionAccounts = [];

    this._events = new EventEmitter();

    const container = document.createElement('div');
    container.setAttribute('id', CONTAINER_ID);
    document.body.appendChild(container);
    this._renderingRoot = createRoot(container);
  }

  async handleRedirect(method: LikeCoinWalletConnectorMethodType, params: any) {
    switch (method) {
      case LikeCoinWalletConnectorMethodType.LikerId:
        const { user, idToken, accessToken } = await handleAuthcoreRedirect(
          this.options,
          params
        );
        const result = await this.init(method, { accessToken });
        return { user, idToken, ...result };
    }
    return null;
  }

  /**
   * @deprecated Please use openConnectionMethodSelectionDialog() instead
   */
  openConnectWalletModal = () => this.openConnectionMethodSelectionDialog();

  openConnectionMethodSelectionDialog = ({
    language = this.options.language,
    connectWalletTitle = this.options.connectWalletTitle,
    connectWalletMobileWarning = this.options.connectWalletMobileWarning,
    onEvent = this.options.onEvent,
  } = {}) => {
    if (this.options.language !== language) {
      this.options.language = language;
    }
    if (this.options.connectWalletTitle !== connectWalletTitle) {
      this.options.connectWalletTitle = connectWalletTitle;
    }
    if (
      this.options.connectWalletMobileWarning !== connectWalletMobileWarning
    ) {
      this.options.connectWalletMobileWarning = connectWalletMobileWarning;
    }
    if (onEvent) {
      this.options.onEvent = onEvent;
    }

    return new Promise<LikeCoinWalletConnectorConnectionResponse>(
      async resolve => {
        const connectWithMethod = async (
          method: LikeCoinWalletConnectorMethodType,
          params?: any
        ) => {
          this.options.onEvent?.({ type: 'select_connection_method', method });
          const result = await this.selectMethod(method, params);
          resolve(result);
        };
        if (checkIsInLikerLandAppInAppBrowser()) {
          connectWithMethod(LikeCoinWalletConnectorMethodType.LikerLandApp);
        } else if (checkIsInCosmostationMobileInAppBrowser()) {
          connectWithMethod(
            LikeCoinWalletConnectorMethodType.CosmostationMobile
          );
        } else if (checkIsInKeplrMobileInAppBrowser()) {
          connectWithMethod(LikeCoinWalletConnectorMethodType.Keplr);
        } else if (this._isConnectionMethodSelectDialogOpen) {
          resolve(undefined);
        } else {
          this._renderingRoot.render(
            <IntlProvider language={language}>
              <ConnectionMethodSelectionDialog
                methods={this.options.availableMethods}
                isShowMobileWarning={this.options.isShowMobileWarning}
                keplrInstallURLOverride={this.options.keplrInstallURLOverride}
                keplrInstallCTAPreset={this.options.keplrInstallCTAPreset}
                title={this.options.connectWalletTitle}
                mobileWarning={this.options.connectWalletMobileWarning}
                onToggleCollapsibleList={isCollapsed => {
                  this.options.onEvent?.({
                    type: 'toggle_collapsible_connection_method_list',
                    isCollapsed,
                  });
                }}
                onClose={() => {
                  this.closeDialog();
                  resolve(undefined);
                }}
                onConnect={connectWithMethod}
              />
            </IntlProvider>
          );
          this._isConnectionMethodSelectDialogOpen = true;
        }
      }
    );
  };

  private openWalletConnectQRCodeDialog = (
    type: LikeCoinWalletConnectorMethodType,
    uri: string,
    { language = this.options.language } = {}
  ) => {
    if (this._isWalletConnectQRCodeDialogOpen)
      return Promise.resolve(undefined);

    if (this.options.language !== language) {
      this.options.language = language;
    }

    return new Promise<LikeCoinWalletConnectorConnectionResponse>(resolve => {
      this._renderingRoot.render(
        <IntlProvider language={language}>
          <WalletConnectQRCodeDialog
            type={type}
            uri={uri}
            onClose={() => {
              this.closeDialog();
              resolve(undefined);
            }}
          />
        </IntlProvider>
      );

      this._isWalletConnectQRCodeDialogOpen = true;
    });
  };

  closeDialog = () => {
    this._renderingRoot.render(null);
    this._isConnectionMethodSelectDialogOpen = false;
    this._isWalletConnectQRCodeDialogOpen = false;
  };

  private selectMethod = async (
    method: LikeCoinWalletConnectorMethodType,
    params?: any
  ) => {
    this.closeDialog();

    return this.init(method, params);
  };

  disconnect = async () => {
    const session = this.loadSession();
    if (session) {
      switch (session.method) {
        case LikeCoinWalletConnectorMethodType.Keplr:
          removeKeplrKeyStoreChangeListener(this._accountChangeListener);
          break;

        case LikeCoinWalletConnectorMethodType.KeplrMobile:
          await onKeplrMobileDisconnect();
          break;

        case LikeCoinWalletConnectorMethodType.Cosmostation:
          removeCosmostationAccountChangeListener();
          break;

        case LikeCoinWalletConnectorMethodType.CosmostationMobile:
          await onCosmostationMobileDisconnect();
          break;

        case LikeCoinWalletConnectorMethodType.LikerLandApp:
          await onLikerLandAppDisconnect();
          break;

        case LikeCoinWalletConnectorMethodType.Leap:
          removeLeapKeyStoreChangeListener(this._accountChangeListener);
          break;

        case LikeCoinWalletConnectorMethodType.WalletConnectV2:
          await onWalletConnectV2Disconnect();
          break;

        default:
          break;
      }
    }
    this.deleteSession();
    this._events.removeAllListeners();
  };

  private getWCQRCodeDialog: (
    methodType: LikeCoinWalletConnectorMethodType,
    params?: any
  ) => IQRCodeModal = (
    methodType: LikeCoinWalletConnectorMethodType,
    params?: any
  ) => ({
    open: uri => {
      if (
        methodType === LikeCoinWalletConnectorMethodType.LikerLandApp &&
        params?.goToGetApp
      ) {
        window.location.href = `https://liker.land/getapp?action=wc&uri=${encodeURIComponent(
          uri
        )}`;
        return;
      }
      this.openWalletConnectQRCodeDialog(methodType, uri);
    },
    close: () => {
      this.closeDialog();
    },
  });

  init = async (
    methodType: LikeCoinWalletConnectorMethodType,
    params?: any,
    language = this.options.language
  ) => {
    let initiator: Promise<LikeCoinWalletConnectorInitResponse>;

    switch (methodType) {
      case LikeCoinWalletConnectorMethodType.LikerId:
        const { accessToken } = params || {};
        if (!accessToken) {
          initiator = new Promise(resolve => {
            this._renderingRoot.render(
              <IntlProvider language={language}>
                <AuthcoreDialog
                  onMount={({ containerId }) => {
                    initAuthcore(this.options, { containerId });
                  }}
                  onClose={() => {
                    this.closeDialog();
                    resolve(undefined);
                    this._events.emit('authcore_auth_closed');
                  }}
                  isHideSocialLogin={
                    !!(
                      this.options.authcoreClientId ===
                      SOCIAL_LOGIN_OPTIONS.HIDE_SOCIAL
                    )
                  }
                />
              </IntlProvider>
            );
          });
        } else {
          initiator = initAuthcore(this.options, { accessToken });
        }
        break;

      case LikeCoinWalletConnectorMethodType.Keplr:
        initiator = initKeplr(this.options);
        break;

      case LikeCoinWalletConnectorMethodType.KeplrMobile:
        initiator = initKeplrMobile(
          this.options,
          this.getWCQRCodeDialog(LikeCoinWalletConnectorMethodType.KeplrMobile),
          this.sessionMethod,
          this.sessionAccounts
        );
        break;

      case LikeCoinWalletConnectorMethodType.Cosmostation:
        initiator = initCosmostation(this.options);
        break;

      case LikeCoinWalletConnectorMethodType.CosmostationMobile:
        initiator = initCosmostationMobile(
          this.options,
          this.getWCQRCodeDialog(
            LikeCoinWalletConnectorMethodType.CosmostationMobile
          ),
          this.sessionMethod,
          this.sessionAccounts
        );
        break;

      case LikeCoinWalletConnectorMethodType.LikerLandApp:
        const { goToGetApp } = params || {};
        initiator = initLikerLandApp(
          this.options,
          this.getWCQRCodeDialog(
            LikeCoinWalletConnectorMethodType.LikerLandApp,
            {
              goToGetApp,
            }
          ),
          this.sessionMethod,
          this.sessionAccounts
        );
        break;

      case LikeCoinWalletConnectorMethodType.Leap:
        initiator = initLeap(this.options);
        break;

      case LikeCoinWalletConnectorMethodType.MetaMaskLeap:
        initiator = initMetaMaskLeap(this.options);
        break;

      case LikeCoinWalletConnectorMethodType.WalletConnectV2:
        initiator = initWalletConnectV2Connector(
          this.options,
          this.sessionMethod,
          this.sessionAccounts
        );
        break;

      default:
        this._accountChangeListener = undefined;
        throw new Error('METHOD_NOT_SUPPORTED');
    }

    const result = await initiator;
    if (!result) {
      this._events.emit('account_init_stopped', methodType);
      return;
    }

    this._accountChangeListener = () => {
      this.handleAccountChange(methodType);
    };

    switch (methodType) {
      case LikeCoinWalletConnectorMethodType.Keplr:
        listenKeplrKeyStoreChange(this._accountChangeListener);
        break;

      case LikeCoinWalletConnectorMethodType.Cosmostation:
        listenCosmostationAccountChange(this._accountChangeListener);
        break;

      case LikeCoinWalletConnectorMethodType.Leap:
        listenLeapKeyStoreChange(this._accountChangeListener);
        break;

      case LikeCoinWalletConnectorMethodType.WalletConnectV2:
        listenWalletConnectV2StoreChange(this._accountChangeListener);
        break;

      default:
        break;
    }

    this.saveSession({
      method: methodType,
      accounts: [...result.accounts],
      params: result.params,
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
    return session?.method
      ? this.init(session.method, session.params)
      : undefined;
  };

  /**
   * Session
   */
  private saveSession = ({
    method,
    accounts,
    params,
  }: LikeCoinWalletConnectorSession) => {
    this.sessionAccounts = accounts;
    this.sessionMethod = method;
    try {
      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          method,
          accounts: accounts.map(account => ({
            ...account,
            pubkey: serializePublicKey(account.pubkey),
          })),
          params,
        })
      );
    } catch (error) {
      console.warn(error);
    }
  };

  private loadSession = () => {
    try {
      const serializedSession = window.localStorage.getItem(SESSION_KEY);
      if (serializedSession) {
        const { method, accounts = [], params } = JSON.parse(serializedSession);
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
            params,
          } as LikeCoinWalletConnectorSession;
        }
      }
    } catch (error) {
      // Not allow to access local storage/unable to decode session
      console.warn(error);
    }
    return undefined;
  };

  restoreSession = () => {
    const session = this.loadSession();
    if (session) {
      this.sessionAccounts = session.accounts;
      this.sessionMethod = session.method;
      this._accountChangeListener = () => {
        this.handleAccountChange(session.method);
      };
      switch (session.method) {
        case LikeCoinWalletConnectorMethodType.Keplr:
          listenKeplrKeyStoreChange(this._accountChangeListener);
          break;
        default:
          break;
      }
    }
    return session;
  };

  private deleteSession = () => {
    this.sessionAccounts = [];
    this.sessionMethod = undefined;
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.warn(error);
    }
  };

  /**
   * Event
   */
  on = (name: string, listener: (...args: any[]) => void) => {
    return this._events.on(name, listener);
  };

  once = (name: string, listener: (...args: any[]) => void) => {
    return this._events.once(name, listener);
  };

  off = (name: string, listener: (...args: any[]) => void) => {
    return this._events.off(name, listener);
  };

  removeListener = (name: string, listener: (...args: any[]) => void) => {
    return this._events.removeListener(name, listener);
  };

  private handleAccountChange = (
    methodType: LikeCoinWalletConnectorMethodType
  ) => {
    this._events.emit('account_change', methodType);
  };
}
