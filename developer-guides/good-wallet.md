# Good Wallet



### High level description

The GoodWallet module is the main module which encapsulates all required wallet actions across the application, which can be grouped to the following concerns: Token actions \(like Send / Receive / Claim GoodDollars, etc.\), Identity concerns \(is the user verified? is the user a citizen?, etc.\), Blockchain status & events concerns \(subscribe to events, unsubscribe, etc.\) and Link payments concerns \(generating a _one-time-payment_ \(OTP\) link, withdraw link, etc.\).

The wallet is initialized as a singleton, and used across all application. It is always available under `global.wallet`.

{% hint style="info" %}
Note we have an [open issue](https://github.com/GoodDollar/GoodDAPP/issues/134) regarding separating those concerns into separate sub modules in `GoodWallet.js`. Currently all concerns are handled on the same module.
{% endhint %}

### Wallet Infrastructure

GoodWallet is based on The underlying layer of _Wallet Provider_ module. The wallet provider encapsulates two main wallet infrastructures: the _transport layer_, and the wallet _address management_. Currently the only wallet provider in the project is [`SoftwareWalletProvider.js`](https://github.com/GoodDollar/GoodDAPP/blob/master/src/lib/wallet/SoftwareWalletProvider.js).

## SoftwareWalletProvider.js & MultipleAddressWallet.js

As stated, a wallet provider is responsible to supply a wallet with address management mechanism, and a transport layer. The provider receives configuration for the transport layer \(which network to connect the wallet to, what protocol, etc.\).

For the transport layer, the SoftwareWalletProvider constructs a Web3 provider transport \(Http / Websocket\) according to the sent configuration. For Address Management, this provider enrich the basic address management of Web3, by pre-defining multiple accounts to the standard `web3.eth.accounts.wallet` using [`MultipleAddressWallet.js`](https://github.com/GoodDollar/GoodDAPP/blob/master/src/lib/wallet/MultipleAddressWallet.js). Initialization of the address is pretty straight-forward, just take a look.

The addresses are generated based on the entered or generated mnemonic sent to the provider \(see below for mnemonic generation / fetching\).

### Wallet Initialization

The wallet is first initialized when `/src/index.js` is loaded. Index.js loads `/src/init.js` object, which is responsible for loading the 2 main infrastructure components of the client: \(1\) [User Storage](../user-storage.md) module and \(2\) GoodWallet module, which is loaded GoodWallet from `/lib/wallet/GoodWallet.js` The class is exported as a singleton, using a singleton pattern on the export in `GoodWallet.js`:

```text
export default new GoodWallet()
```

So the state is shared and mutated globally across all modules that are using it. The wallet is stored under `global.wallet`. The only method called on the constructor is `init()`.

## init\(\) method

The method is responsible to instantiate a wallet using [`WalletFactory.js`](https://github.com/GoodDollar/GoodDAPP/blob/master/src/lib/wallet/WalletFactory.js), which is calling the relevant wallet provider based on the provider parameter \(currently only SoftwareWallet is supported\).

Next, the method is initializing essential blockchain information as the network ID and gas price, and then initializing all contracts relevant to the GoodWallet methods \(This should be narrowed only to top level essential contracts once GoodWallet will be [break into sub-modules](https://github.com/GoodDollar/GoodDAPP/issues/134)\). Some Contracts ABI are added to ABI decoder, in order to be able to read blockchain events in a human readable language \(_Blockchain events concern_\)

#### Top wallet concerns

As described, the wallet handles the following concerns: \(which should be [break into sub-modules](https://github.com/GoodDollar/GoodDAPP/issues/134)\)

1. Provide Token actions
2. Manage Identity
3. Communicate with Blockchain events
4. Manage payment links

### Token Actions

The available token actions are:

* Claim - Claims for GoodDollar UBI. Handled in `Claim()` method
* Check Entitlement - returns the amount the user can claim
* BalanceOf - returns the current balance of the account
* Balance Changed - Listen to balance changes for the current account _\(Note that conceptually, this is a Token action concern.\)_
* getAccountForType - accounts, generated from the same seed, are used as identifiers and used for TX of different modules in GoodDollar application \(i.e. GoodDollar, GunDB records, Face Recognition enrollment to zoom, login, donation\). This method returns the relevant account to use per module.
* sign - sign transactions \(by the relevant account\)
* canSend - verifies the user has sufficient amount of money to be sent
* sendAmount - sends the specifies amount of money to the specified address \(if address is valid and amount can be sent\). Note Fees are calculated for this action.
* sendTransaction - A basic wrapper function that receives a TX object and optional callbacks to perform when TX completed. It sends the TX to the blockchain and attach the callbacks to the relevant event triggers.

### Manage Identity

* isVerified - returns is the sent address is a verified address in the Identity contract
* isCitizen - returns if the current wallet holder is the 
* deleteAccount - deletes all user information from GoodDollar contracts, inc. Account address and DID's

### Communicate with Blockchain events

The main purpose of this sub-module is to be able to track events related to thi

* subscribeToEvent - Sets an id and place a callback function for this id, for the sent event \(event can have multiple subscribers, each one receives it's own id\). Returns the subscriber generated id and eventName, so the consumer can unsubscribe using id and event name
* unsubscribeFromEvent - receives id and event name, deletes the saved callback in the subscribers list under the specified subscriber id and event name
* getSubscribers - returns a json object containing all subscribers for the specified event name
* getBlockNumber - Retrieves current Block Number and returns it as converted to a BN instance
* getEvents - Client side event filter. Requests all events for the specified contract, then filters them and returns the event Object
* oneTimeEvents - _might be refactored_ filters events based on specified predicate, then runs callback on them and return them
* pollForEvents - periodically polling for events like the specified event \(filters by the specified event\) up to the current blockchain block, and perform callback on them
* getReceiptWithLogs - Returns an existing \(non-pending\) transaction receipt information + human readable logs of the transaction
* sendReceiptWithLogsToSubscribers - Receives events names \(as an array\). For each event, iterate through the subscriptions for this event, using this.getSubscribers, and fire the callback that is registered for this event in the subscriber, on this event.
* listenTxUpdates - Initialize 2 main listeners: 1. For Transfer funds _from_ the account 2. For Transfer funds _to_ the account. In both cases, events are polled from the latest block that was not polled before \(starting from 0 and advancing\). Once these events were filtered \(found\) by the client:
* Their receipts + logs are being loaded from the Blockchain. The receipts + Logs object of each event are sent to the event subscriber. Subscribers to "transferFrom" are subscribing to _receiptUpdated_ flag, and to "transferTo" are subscribing to _receiptReceived_ flag.
* Subscribers to send / recieve \(accordingly\) and balanceChanged flags are invoked also.
* getGasPrice - returns blockchain gas price

### Manage payment links

* generateLink
* getWithdrawLink
* isWithdrawLinkUsed
* isWithdrawPaymentAvailable
* getWithdrawAvailablePayment
* getWithdrawStatus
* canWithdraw
* withdraw
* cancelOtl

