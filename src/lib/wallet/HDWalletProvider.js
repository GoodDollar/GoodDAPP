import { first } from 'lodash'
import ProviderEngine from 'web3-provider-engine'
import FiltersSubprovider from 'web3-provider-engine/subproviders/filters.js'
import HookedSubprovider from 'web3-provider-engine/subproviders/hooked-wallet.js'
import RPCSubprovider from 'web3-provider-engine/subproviders/rpc'
import Transaction from 'ethereumjs-tx'

class HDWalletProvider {
  constructor(walletsFromHD, providerUrl) {
    this.wallets = walletsFromHD
    this.addresses = Object.keys(walletsFromHD)

    // eslint-disable-next-line camelcase
    const tmp_accounts = this.addresses
    // eslint-disable-next-line camelcase
    const tmp_wallets = this.wallets

    this.engine = new ProviderEngine()

    this.engine.addProvider(
      new HookedSubprovider({
        getAccounts(cb) {
          cb(null, tmp_accounts)
        },
        getPrivateKey(address, cb) {
          if (!tmp_wallets[address]) {
            return cb('Account not found')
          }

          cb(null, tmp_wallets[address].privateKey)
        },
        signTransaction(txParams, cb) {
          let pkey

          if (tmp_wallets[txParams.from]) {
            pkey = tmp_wallets[txParams.from].privateKey
          } else {
            cb('Account not found')
          }

          var tx = new Transaction(txParams)
          tx.sign(pkey)

          var rawTx = '0x' + tx.serialize().toString('hex')
          cb(null, rawTx)
        },
      }),
    )

    this.engine.addProvider(new FiltersSubprovider())
    this.engine.addProvider(new RPCSubprovider({ rpcUrl: providerUrl }))
    this.engine.start() // Required by the provider engine.
  }

  sendAsync() {
    this.engine.sendAsync.apply(this.engine, arguments)
  }

  send() {
    return this.engine.send.apply(this.engine, arguments)
  }

  // returns the address of the given address_index, first checking the cache
  getAddress(idx) {
    const { addresses } = this

    return idx ? addresses[idx] : first(addresses)
  }

  // returns the addresses cache
  getAddresses() {
    return this.addresses
  }
}

export default HDWalletProvider
