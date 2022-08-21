import { OfflineSigner } from '@cosmjs/proto-signing';

export const getCosmostationExtensionOfflineSigner = (
  chainName: string
): OfflineSigner => ({
  getAccounts: async () => {
    const response = await window.cosmostation.cosmos.request({
      method: 'cos_account',
      params: { chainName },
    });
    return [
      {
        address: response.address,
        pubkey: response.publicKey,
        algo: 'secp256k1',
      },
    ];
  },
  signAmino: async (_, signDoc) => {
    const response = await window.cosmostation.cosmos.request({
      method: 'cos_signAmino',
      params: {
        chainName,
        doc: signDoc,
        isEditMemo: true,
        isEditFee: true,
      },
    });

    return {
      signed: response.signed_doc,
      signature: {
        pub_key: response.pub_key,
        signature: response.signature,
      },
    };
  },
  signDirect: async (_, signDoc) => {
    const response = await window.cosmostation.cosmos.request({
      method: 'cos_signDirect',
      params: {
        chainName,
        doc: {
          account_number: String(signDoc.accountNumber),
          auth_info_bytes: signDoc.authInfoBytes,
          body_bytes: signDoc.bodyBytes,
          chain_id: signDoc.chainId,
        },
      },
    });
    return {
      signed: {
        accountNumber: (response.signed_doc.account_number as unknown) as Long,
        chainId: response.signed_doc.chain_id,
        authInfoBytes: response.signed_doc.auth_info_bytes,
        bodyBytes: response.signed_doc.body_bytes,
      },
      signature: {
        pub_key: response.pub_key,
        signature: response.signature,
      },
    };
  },
});
