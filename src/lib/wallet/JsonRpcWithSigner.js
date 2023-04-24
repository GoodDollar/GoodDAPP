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
    return this.send(request.method, request.params)
  }

  async send(method: string, params: []): Promise<any> {
    const { jsonRpcProvider, signer } = this
    const [transaction, data] = params || []

    switch (method) {
      case 'eth_sendTransaction': {
        const signedTransaction = await this.send('eth_signTransaction', [transaction])

        return jsonRpcProvider.send('eth_sendRawTransaction', [signedTransaction])
      }
      case 'eth_signTransaction': {
        let { gas, gasLimit, nonce, ...txData } = transaction || {}

        if (!nonce) {
          nonce = await signer.getTransactionCount()
          nonce = `0x${nonce.toString(16)}`
        }

        return signer.signTransaction({ ...txData, nonce, gasLimit: gas || gasLimit })
      }
      case 'personal_sign':
      case 'eth_sign': {
        return signer.signMessage(data)
      }
      case 'eth_accounts': {
        return [signer.address]
      }
      default: {
        if (method.startsWith('eth_signTypedData')) {
          const { domain, types, message } = data || {}

          return signer._signTypedData(domain, types, message)
        }
      }
    }

    return jsonRpcProvider.send(method, params)
  }
}
