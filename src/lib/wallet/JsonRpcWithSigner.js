// @flow
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

export class JsonRpcProviderWithSigner extends JsonRpcProvider {
  constructor(url: string, privateKey: string) {
    super(url)
    this.signer = new Wallet(privateKey, this)
  }

  // eslint-disable-next-line require-await
  async request(request): Promise<any> {
    return this.send(request.method, request.params)
  }

  async send(method: string, params: []): Promise<any> {
    if (method === 'eth_sendTransaction') {
      const transaction = params[0]
      const signedTransaction = await this.signer.signTransaction(transaction)
      return super.send('eth_sendRawTransaction', [signedTransaction])
    }
    if (method === 'eth_signTransaction') {
      const transaction = params[0]
      const signedTransaction = await this.signer.signTransaction(transaction)
      return signedTransaction
    } else if (method === 'eth_sign') {
      const message = params[1]
      return this.signer.signMessage(message)
    } else if (method.startsWith('eth_signTypedData')) {
      const typedData = params[1]
      return this.signer._signTypedData(typedData.domain, typedData.types, typedData.message)
    } else if (method === 'eth_accounts') {
      return [this.signer.address]
    }
    return super.send(method, params)
  }
}
