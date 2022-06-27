import * as React from 'react';
import * as ReactDOM from 'react-dom';
import WalletConnect from '@walletconnect/client';
import { payloadId } from '@walletconnect/utils';
import { AccountData, OfflineSigner } from '@cosmjs/proto-signing';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { CosmostationDirectSigner } from './utils/cosmostation';

import { ConnectionMethodSelectionDialog } from './connection-method-selection-dialog';

import './style.css';
import { IWalletConnectOptions } from '@walletconnect/types';

const WRAPPER_ID = 'likecoin-wallet-connector';

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

  onInit?: (result: { accounts: any; offlineSigner: any }) => void;
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

  private _onInit?: (result: { accounts: any; offlineSigner: any }) => void;

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

    if (options.onInit) {
      this._onInit = options.onInit;
    }
  }

  openConnectWalletModal() {
    if (this._isConnectionMethodSelectDialogOpen) return;
    const wrapper = document.createElement('div');
    wrapper.setAttribute('id', WRAPPER_ID);
    document.body.appendChild(wrapper);

    ReactDOM.render(
      <ConnectionMethodSelectionDialog
        onClose={this.closeConnectWalletModal}
        onSelectConnectionMethod={this.selectMethod}
      />,
      wrapper
    );

    this._isConnectionMethodSelectDialogOpen = true;
  }

  closeConnectWalletModal = () => {
    const wrapper = document.getElementById(WRAPPER_ID);
    if (wrapper) {
      document.body.removeChild(wrapper);
    }
    const modalWrappers = document.getElementsByClassName('ReactModalPortal');
    if (modalWrappers && modalWrappers.length > 0) {
      document.body.removeChild(modalWrappers[0]);
    }
    this._isConnectionMethodSelectDialogOpen = false;
  };

  selectMethod = async (method?: string) => {
    this.closeConnectWalletModal();

    let initiator: Promise<
      | {
          accounts: any;
          offlineSigner: any;
        }
      | undefined
    >;
    switch (method) {
      case 'keplr':
        initiator = this.initKeplr();
        break;

      case 'cosmostation':
        initiator = this.initCosmostation();
        break;

      case 'liker-id':
        initiator = this.initLikerID();
        break;

      default:
        throw new Error('METHOD_NOT_SUPPORTED');
    }

    const result = await initiator;
    if (!result) throw new Error('ACCOUNT_INIT_FAILED');

    if (!this._onInit) return;
    this._onInit(result);
  };

  initKeplr = async (trys = 0) => {
    const w = window as any;

    if (!w.keplr) {
      if (trys < 3) {
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
          low: 0.01,
          average: 0.025,
          high: 0.04,
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
      if (trys < 3) {
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
            tiny: '1',
            low: '10',
            average: '1000',
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

  initLikerID = async () => {
    const wcConnectOptions: IWalletConnectOptions = {
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: {
        open(uri) {
          console.log(uri);
        },
        close() {
          // TODO
        },
      },
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
