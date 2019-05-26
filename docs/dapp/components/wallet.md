---
description: Describes the wallet initialization and usage across relevant areas in the application
---

# Good Wallet

## High level description

The GoodWallet module is the main module which encapsulates all required wallet actions across the application, which can be grouped to the following concerns:
Token actions (like Send / Receieve / Claim GoodDollars, etc.), Identity concerns (is the user verified? is the user a citizen?, etc.), Blockchain status & events concerns (subscribe to events, unsbsribe, etc.) and Link payments concerns (generating a _one-time-payment_ (OTP) link,  withdraw link, etc.).

The wallet is initialzed as a singelton, and used across all application. It is always available under `global.wallet`.

{% hint style="info" %}
Note we have an [open issue](https://github.com/GoodDollar/GoodDAPP/issues/134) regarding separating those concerns into separate sub modules in `GoodWallet.js`. Currently all concerns are handled on the same module.
{% endhint %}

## Wallet Infrastrucutre
GoodWallet is based on The underlying layer of *Wallet Provider* module. The wallet provider encapsulates two main wallet infrastrcutres: the _transport layer_, and the wallet _address management_. Currently the only wallet provider in the project is [`SoftwareWalletProvider.js`](https://github.com/GoodDollar/GoodDAPP/blob/master/src/lib/wallet/SoftwareWalletProvider.js).


# SoftwareWalletProvider.js & MultipleAddressWallet.js
As stated, a wallet provider is responsible to supply a wallet with address management mechanism, and a transport layer. The provider recieves configuration for the transport layer (which network to connect the wallet to, what protocol, etc.).  

For the transport layer, the SoftwareWalletProvider constructs a Web3 provider transport (Http / Websocket) according to the sent configuration.
For Address Management, this provider enrich the basic address management of Web3, by pre-defining multiple accounts to the standard `web3.eth.accounts.wallet` using [`MultipleAddressWallet.js`](https://github.com/GoodDollar/GoodDAPP/blob/master/src/lib/wallet/MultipleAddressWallet.js). Initialization of the address is pretty straigh-forward, just take a look.

The addresses are generated based on the entered or generated mnemonic sent to the provider (see below for mnemonic generatation / fetching).

## Wallet Initialization
The wallet is first initiallized when `/src/index.js` is loaded. Index.js loads `/src/init.js` object, which is responsible for loading the 2 main infrastructure components of the client: (1) [User Storage](../user-storage.md) module and (2) GoodWallet module, which is loaded GoodWallet from `/lib/wallet/GoodWallet.js`
The class is exported as a singleton, using a singleton pattern on the export in `GoodWallet.js`:
``` 
export default new GoodWallet()
```
So the state is shared and mutated globally across all modules that are using it. The wallet is stored under `global.wallet`.
The only method called on the constructor is `init()`.

# init() method
The method is responsible to instansiciate a wallet using [`WalletFactory.js`](https://github.com/GoodDollar/GoodDAPP/blob/master/src/lib/wallet/WalletFactory.js), which is calling the relevant wallet provider based on the provider parameter (currently only SoftwareWallet is supported).

Next, the method is initializing essintial blockchain information as the network ID and gas price, and then initialzing all contracts relevant to the GoodWallet methods (This should be narrowed only to top level essential contracts once GoodWallet will be [break into sub-modules](https://github.com/GoodDollar/GoodDAPP/issues/134)). Some Contracts ABI are added to ABI decoder, in order to be able to read blockchain events in a human readable language (_Blockchain events concern_)


### Top wallet concerns
As described, the wallet handles the following concerns: (which sould be [break into sub-modules](https://github.com/GoodDollar/GoodDAPP/issues/134))

1. Provide Token actions
2. Manage Identity
3. Communicate with Blockchain events
4. Manage payment links


## Token Actions
The available token actions are:
* Claim - Claims for GoodDollar UBI. Handled in `Claim()` method
* Check Entitlement - returns the amount the user can claim
* BalanceOf
* Balance Changed - Listen to balance changes for the current account _(Note that conceptually, this is a Token action concern.)_
* getAccountForType - accounts, generated from the same seed, are used as identifiers and used for TX of different modules in GoodDollar application (i.e. GoodDollar, GunDB records, Face Recognition enrollment to zoom, login, donation). This method returns the relevant account to use per module.
* sign - sign trasactions (by the relevant account)
* canSend - verifies the user has sufficient amount of money to be sent
* sendAmount - sends the specifies amount of money to the specified address (if address is valid and amount can be sent). Note Fees are calculated for this action.
* sendTransaction - A basic wrapper function that recieves a TX object and optional callbacks to perform when TX completed. It sends the TX to the blockchain and attach the callbacks to the relevant event triggers.

## Manage Identity
* isVerified - returns is the sent address is a verified address in the Identity contract
* isCitizen - returns if the current wallet holder is the 
* deleteAccount - deletes all user information from GoodDollar contracts, inc. Account address and DID's

## Communicate with Blockchain events
* subscribeToEvent - Sets an id and place a callback function for this id, for the sent event (event can have multiple subscribers, each one recieves it's own id). Returns the subscriber generated id and eventName, so the consumer can unsubscribe using id and event name
* unSubscribeToTx - recieves id and event name, deletes the saved callback in the subscribers list under the specified subscriber id and event name
* getSubscribers - returns a json object containing all subscribers for the specified event name
* listenTxUpdates
* getReceiptWithLogs
* sendReceiptWithLogsToSubscribers
* getBlockNumber
* getEvents
* pollForEvents

* getGasPrice

## Manage payment links
* oneTimeEvents
* generateLink
* getWithdrawLink
* isWithdrawLinkUsed
* isWithdrawPaymentAvailable
* getWithdrawAvailablePayment
* getWithdrawStatus
* canWithdraw
* withdraw
* cancelOtl