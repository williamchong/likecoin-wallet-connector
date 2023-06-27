const config = {
  transformIgnorePatterns: [
    'node_modules/(?!(@walletconnect/modal|@web3modal/core)/.*)',
  ],
};

module.exports = config;