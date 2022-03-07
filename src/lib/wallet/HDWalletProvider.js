var ProviderEngine = require('web3-provider-engine')
var FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js')
var HookedSubprovider = require('web3-provider-engine/subproviders/hooked-wallet.js')
var RPCSubprovider = require('web3-provider-engine/subproviders/rpc')
var Transaction = require('ethereumjs-tx')

function HDWalletProvider(walletsFromHD, providerUrl) {
  this.wallets = walletsFromHD
  this.addresses = Object.keys(walletsFromHD)

  // eslint-disable-next-line camelcase
  const tmp_accounts = this.addresses
  // eslint-disable-next-line camelcase
  const tmp_wallets = this.wallets

  this.engine = new ProviderEngine()
  this.engine.addProvider(
    new HookedSubprovider({
      getAccounts: function(cb) {
        cb(null, tmp_accounts)
      },
      getPrivateKey: function(address, cb) {
        if (!tmp_wallets[address]) {
          return cb('Account not found')
        }
        cb(null, tmp_wallets[address].privateKey)
      },
      signTransaction: function(txParams, cb) {
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

HDWalletProvider.prototype.sendAsync = function() {
  this.engine.sendAsync.apply(this.engine, arguments)
}

HDWalletProvider.prototype.send = function() {
  return this.engine.send.apply(this.engine, arguments)
}

// returns the address of the given address_index, first checking the cache
HDWalletProvider.prototype.getAddress = function(idx) {
  if (!idx) {
    return this.addresses[0]
  }
  return this.addresses[idx]
}

// returns the addresses cache
HDWalletProvider.prototype.getAddresses = function() {
  return this.addresses
}

module.exports = HDWalletProvider
