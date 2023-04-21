<template>
  <v-app>
    <v-app-bar app>
      <template v-if="walletAddress">
        <v-chip label>{{ method }}</v-chip>
        <v-toolbar-title class="ml-4">{{ formattedWalletAddress }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          class="text-truncate"
          outlined
          style="max-width: 150px"
          @click="logout"
        >Logout</v-btn>
      </template>
      <template v-if="walletAddress" v-slot:extension>
        <v-tabs
          v-model="tab"
          grow
        >
          <v-tab key="send">Send</v-tab>
          <v-tab key="sign-arbitrary">Sign Arbitrary</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-main>
      <v-container v-if="!walletAddress" fill-height>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-btn
              :loading="isLoading"
              elevation="2"
              @click="connect"
            >Connect</v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-container v-else fill-height>
        <v-row>
          <v-col>
            <v-card
              :loading="isSending || isSigningArbitrary"
              class="mx-auto my-12"
              max-width="480"
              outlined
            >
              <v-tabs-items v-model="tab">

                <v-tab-item key="send">
                  <v-form
                    class="pa-4"
                    @submit.prevent="send"
                  >
                    <v-text-field
                      :value="walletAddress"
                      label="From address"
                      readonly
                    />
                    <v-text-field
                      v-model="toAddress"
                      label="To address"
                      :disabled="isSending"
                      required
                    />
                    <v-text-field
                      v-model="amount"
                      label="Amount"
                      type="number"
                      :disabled="isSending"
                      suffix="LIKE"
                      required
                    />
                    <v-text-field
                      v-model="fee"
                      label="Fee"
                      type="number"
                      :disabled="isSending"
                      suffix="nanolike"
                      required
                    />
                    <div class="d-flex justify-end">
                      <v-btn
                        type="submit"
                        :elevation="isSending ? 0 : 2"
                        :disabled="isSending"
                        :loading="isSending"
                      >Send</v-btn>
                    </div>
                  </v-form>
                </v-tab-item>

                <v-tab-item key="sign-arbitrary">
                  <v-form
                    class="pa-4"
                    @submit.prevent="signArbitrary"
                  >
                    <v-text-field
                      :value="signArbitraryMessage"
                      label="Message to sign"
                      required
                    />
                    <div class="d-flex justify-end">
                      <v-btn
                        type="submit"
                        :elevation="isSigningArbitrary ? 0 : 2"
                        :disabled="isSigningArbitrary"
                        :loading="isSigningArbitrary"
                      >Sign</v-btn>
                    </div>
                  </v-form>
                  <v-divider />
                  <v-textarea
                    class="mt-4 mx-4"
                    :value="signArbitraryResult"
                    label="Signature"
                    background-color="grey lighten-4"
                    placeholder="Result"
                    persistent-placeholder
                    outlined
                    readonly
                    auto-grow
                  />
                </v-tab-item>

              </v-tabs-items>
            </v-card>
            <v-alert
              v-model="isShowAlert"
              class="mx-auto"
              :type="error ? 'error' : 'success'"
              elevation="2"
              max-width="480"
              prominent
              dismissible
            >
              <div v-if="error">{{ error }}</div>
              <v-row
                v-else
                align="center"
              >
                <v-col class="grow">The transaction is broadcasted.</v-col>
                <v-col class="shrink">
                  <v-btn
                    :href="txURL"
                    color="white"
                    target="_blank"
                    rel="noreferrer noopener"
                    small
                    outlined
                  >Details</v-btn>
                </v-col>
              </v-row>
            </v-alert>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-footer app>
      <v-container>Demo of @likecoin/wallet-connector</v-container>
    </v-footer>
  </v-app>
</template>

<script>
import {
  assertIsDeliverTxSuccess,
  SigningStargateClient,
} from '@cosmjs/stargate';

import { LikeCoinWalletConnector, LikeCoinWalletConnectorMethodType } from '../../dist';

export default {
  data() {
    return {
      tab: 'send',
      isLoading: true,

      method: undefined,
      offlineSigner: undefined,
      walletAddress: '',

      toAddress: 'like145at6ratky0leykf43zqx8q33ramxhjclh0t9u',
      amount: 1,
      fee: 5000,

      signArbitraryMessage: 'Hello, @likecoin/wallet-connector!',
      signArbitraryResult: '',

      txHash: '',
      error: '',
      isSending: false,
      isSigningArbitrary: false,
      isShowAlert: false,
    };
  },
  computed: {
    formattedWalletAddress() {
      const address = this.walletAddress;
      const length = address.length;
      return `${address.substring(0, 8)}...${address.substring(length - 3, length)}`;
    },
    txURL() {
      return this.connector
        ? `${this.connector.options.restURL}/cosmos/tx/v1beta1/txs/${this.txHash}`
        : '';
    },
  },
  mounted() {
    this.connector = new LikeCoinWalletConnector({
      chainId: 'likecoin-mainnet-2',
      chainName: 'LikeCoin',
      rpcURL: 'https://mainnet-node.like.co/rpc/',
      restURL: 'https://mainnet-node.like.co',
      coinType: 118,
      coinDenom: 'LIKE',
      coinMinimalDenom: 'nanolike',
      coinDecimals: 9,
      coinGeckoId: 'likecoin',
      bech32PrefixAccAddr: 'like',
      bech32PrefixAccPub: 'likepub',
      bech32PrefixValAddr: 'likevaloper',
      bech32PrefixValPub: 'likevaloperpub',
      bech32PrefixConsAddr: 'likevalcons',
      bech32PrefixConsPub: 'likevalconspub',
      availableMethods: [
        LikeCoinWalletConnectorMethodType.Keplr,
        LikeCoinWalletConnectorMethodType.Cosmostation,
        LikeCoinWalletConnectorMethodType.LikerId,
        LikeCoinWalletConnectorMethodType.CosmostationMobile,
        LikeCoinWalletConnectorMethodType.KeplrMobile,
      ],
      keplrSignOptions: {
        disableBalanceCheck: true,
        preferNoSetFee: true,
        preferNoSetMemo: true,
      },
      keplrInstallURLOverride: 'https://www.keplr.app/download',
      keplrInstallCTAPreset: 'fancy-banner',
      cosmostationDirectSignEnabled: true,

      language: 'zh',
    });
    const session = this.connector.restoreSession();
    this.handleConnection(session);
    this.isLoading = false;
  },
  watch: {
    txHash(value) {
      if (value) {
        this.isShowAlert = true;
      }
    },
    error(value) {
      if (value) {
        this.isShowAlert = true;
      }
    },
  },
  methods: {
    reset() {
      this.offlineSigner = undefined;
      this.walletAddress = '';
      this.signArbitraryResult = '';

      this.txHash = '';
      this.error = '';
      this.isSending = false;
      this.isShowAlert = false;
    },
    handleConnection(connection) {
      if (!connection) return;
      const { method, accounts: [account], offlineSigner } = connection;
      this.method = method;
      this.walletAddress = account.address;
      this.offlineSigner = offlineSigner;
      this.connector.once('account_change', this.handleAccountChange);
    },
    async connect() {
      const connection = await this.connector.openConnectWalletModal();
      this.handleConnection(connection);
    },
    logout() {
      this.connector.disconnect();
      this.reset();
    },
    async handleAccountChange(method) {
      const connection = await this.connector.init(method);
      this.handleConnection(connection);
    },

    async send() {
      try {
        this.txHash = '';
        this.error = '';
        this.isShowAlert = false;

        const connection = await this.connector.initIfNecessary();
        if (!connection) return;
        const { method, accounts: [account], offlineSigner } = connection;
        this.method = method;
        this.walletAddress = account.address;
        this.offlineSigner = offlineSigner;

        this.isSending = true;
        const client = await SigningStargateClient.connectWithSigner(
          this.connector.options.rpcURL,
          this.offlineSigner
        );

        const denom = this.connector.options.coinMinimalDenom;
        const amount = [
          {
            amount: `${this.amount * Math.pow(10, this.connector.options.coinDecimals)}`,
            denom,
          },
        ];
        const fee = {
          amount: [
            {
              amount: `${this.fee}`,
              denom,
            },
          ],
          gas: '200000',
        };
        const result = await client.sendTokens(
          this.walletAddress,
          this.toAddress,
          amount,
          fee,
          ''
        );
        assertIsDeliverTxSuccess(result);

        if (result.code === 0) {
          this.txHash = result.transactionHash;
        } else {
          this.error = result.rawLog;
        }
      } catch (error) {
        this.error = `${error.message || error.name || error}`;
        console.error(error);
      } finally {
        this.isSending = false;
      }
    },
    async signArbitrary() {
      try {
        this.error = '';
        this.isShowAlert = false;
        this.signArbitraryResult = '';

        const connection = await this.connector.initIfNecessary();
        if (!connection) return;
        const { method, accounts: [account], offlineSigner, signArbitrary } = connection;
        this.method = method;
        this.walletAddress = account.address;
        this.offlineSigner = offlineSigner;
        if (!offlineSigner.signArbitrary) {
          throw new Error('signArbitrary not supported');
        }

        this.isSigningArbitrary = true;

        const result = await offlineSigner.signArbitrary(
          this.connector.options.chainId,
          account.address,
          this.signArbitraryMessage,
        );
        this.signArbitraryResult = JSON.stringify(result);
      } catch (error) {
        this.error = `${error.message || error.name || error}`;
        console.error(error);
      } finally {
        this.isSigningArbitrary = false;
      }
    },
  },
};
</script>
