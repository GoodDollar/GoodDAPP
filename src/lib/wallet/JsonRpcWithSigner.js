// @flow
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

export class JsonRpcProviderWithSigner extends JsonRpcProvider {
  constructor(jsonRpcProvider, privateKey: string) {
    super()
    this.signer = new Wallet(privateKey, this)
    this.jsonRpcProvider = jsonRpcProvider
  }

  // eslint-disable-next-line require-await
  async request(request): Promise<any> {
    const res = await this.send(request.method, request.params)
    return res
  }

  async send(method: string, params: []): Promise<any> {
    if (method === 'eth_sendTransaction') {
      const transaction = params[0]
      const signedTransaction = await this.request({ method: 'eth_signTransaction', params: [transaction] })
      return this.jsonRpcProvider.send('eth_sendRawTransaction', [signedTransaction])
    }
    if (method === 'eth_signTransaction') {
      const transaction = params[0]
      if (transaction.gas) {
        transaction.gasLimit = transaction.gas
        delete transaction.gas
      }
      if (!transaction.nonce) {
        transaction.nonce = await this.signer.getTransactionCount().then(_ => `0x${_.toString(16)}`)
      }
      const signedTransaction = await this.signer.signTransaction(transaction)
      return signedTransaction
    } else if (method === 'eth_sign' || method === 'personal_sign') {
      const message = params[1]
      return this.signer.signMessage(message)
    } else if (method.startsWith('eth_signTypedData')) {
      const typedData = params[1]
      return this.signer._signTypedData(typedData.domain, typedData.types, typedData.message)
    } else if (method === 'eth_accounts') {
      return [this.signer.address]
    }
    return this.jsonRpcProvider.send(method, params)
  }
}
