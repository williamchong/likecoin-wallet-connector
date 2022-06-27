<template>
  <v-app>
    <v-app-bar class="d-flex justify-end" app>
      <v-btn v-if="walletAddress" outlined @click="logout">{{ walletAddress }}</v-btn>
    </v-app-bar>

    <v-main>
      <v-container fill-height>
        <v-col class="d-flex justify-center">
          <v-btn v-if="!walletAddress" elevation="2" @click="connect">Connect</v-btn>
        </v-col>
      </v-container>
    </v-main>
    <v-footer app>
      <v-container>
        An example app
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
import { LikeCoinWalletConnector } from '../../dist';

export default {
  data() {
    return {
      walletAddress: '',
    };
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
      onInit: ({ accounts }) => {
        this.walletAddress = accounts[0].address;
      },
    });
  },
  methods: {
    connect() {
      this.connector.openConnectWalletModal();
    },
    logout() {
      this.walletAddress = '';
    },
  },
};
</script>
