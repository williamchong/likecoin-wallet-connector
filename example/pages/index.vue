<template>
  <v-app>
    <v-app-bar class="d-md-flex justify-end" app>
      <v-btn
        v-if="walletAddress"
        class="text-truncate"
        outlined
        style="max-width: 150px"
        @click="logout"
        >{{ formattedWalletAddress }}</v-btn
      >
    </v-app-bar>

    <v-main>
      <v-container v-if="!walletAddress" fill-height>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-btn elevation="2" @click="connect">Connect</v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-container v-else fill-height>
        <v-row>
          <v-col>
            <v-card
              :loading="isSending"
              class="mx-auto my-12 pa-4"
              max-width="480"
              outlined
            >
              <v-form>
                <v-text-field
                  v-model="toAddress"
                  label="To address"
                  :disabled="isSending"
                  required
                />
                <v-text-field
                  v-model="amount"
                  label="Amount"
                  :disabled="isSending"
                  required
                />
                <div class="d-flex justify-end">
                  <v-btn
                    :elevation="isSending ? 0 : 2"
                    :disabled="isSending"
                    :loading="isSending"
                    @click="send"
                  >Send</v-btn>
                </div>
              </v-form>
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
              <pre v-if="error">{{ error }}</pre>
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
      <v-container>An example app</v-container>
    </v-footer>
  </v-app>
</template>

<script>
import {
  assertIsDeliverTxSuccess,
  SigningStargateClient,
} from '@cosmjs/stargate';

import { LikeCoinWalletConnector, LikeCoinWalletConnectorMethod } from '../../dist';

export default {
  data() {
    return {
      offlineSigner: undefined,
      walletAddress: '',
      toAddress: 'like145at6ratky0leykf43zqx8q33ramxhjclh0t9u',
      amount: 1,
      isSending: false,
      isShowAlert: false,
      txHash: '',
      error: '',
    };
  },
  computed: {
    formattedWalletAddress() {
      return (
        this.walletAddress.split(`1`)[0] + `…` + this.walletAddress.slice(-4)
      );
    },
    txURL() {
      return this.connector
        ? `${this.connector.restURL}/cosmos/tx/v1beta1/txs/${this.txHash}`
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
      bech32PrefixAccAddr: 'like',
      bech32PrefixAccPub: 'likepub',
      bech32PrefixValAddr: 'likevaloper',
      bech32PrefixValPub: 'likevaloperpub',
      bech32PrefixConsAddr: 'likevalcons',
      bech32PrefixConsPub: 'likevalconspub',
      availableMethods: [
        LikeCoinWalletConnectorMethod.Keplr,
        LikeCoinWalletConnectorMethod.KeplrMobile,
        LikeCoinWalletConnectorMethod.LikerId,
        LikeCoinWalletConnectorMethod.Cosmostation,
      ],
      onInit: ({ accounts: [account], offlineSigner }) => {
        this.offlineSigner = offlineSigner;
        this.walletAddress = account.bech32Address || account.address;
      },
    });
    const session = this.connector.restoreSession();
    if (session?.accounts) {
      const { accounts: [account] } = session;
      this.walletAddress = account.bech32Address || account.address;
    }
  },
  watch: {
    error(error) {
      if (error) {
        this.isShowAlert = true;
      }
    },
  },
  methods: {
    connect() {
      this.connector.openConnectWalletModal();
    },
    logout() {
      this.connector.disconnect();
      this.walletAddress = '';
    },

    async send() {
      await this.connector.initIfNecessary();
      this.error = false;
      this.txHash = '';
      this.isSending = true;
      const client = await SigningStargateClient.connectWithSigner(
        this.connector.rpcURL,
        this.offlineSigner
      );

      const denom = this.connector.coinMinimalDenom;
      const amount = [
        {
          amount: `${this.amount * Math.pow(10, this.connector.coinDecimals)}`,
          denom,
        },
      ];
      const fee = {
        amount: [
          {
            amount: '5000',
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
      this.isSending = false;

      if (result.code === 0) {
        this.txHash = result.code;
      } else {
        this.error = result.rawLog;
      }
    },
  },
};
</script>
