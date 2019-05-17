# wallet

### Table of Contents

* * [Parameters](wallet.md#parameters)
* [saveMnemonics](wallet.md#savemnemonics)
  * [Parameters](wallet.md#parameters-1)
* [gdToWei](wallet.md#gdtowei)
  * [Parameters](wallet.md#parameters-2)
* [getMnemonics](wallet.md#getmnemonics)
* [QueryEvent](wallet.md#queryevent)
  * [Properties](wallet.md#properties)
* [listenTxUpdates](wallet.md#listentxupdates)
  * [Parameters](wallet.md#parameters-3)
* [subscribeToEvent](wallet.md#subscribetoevent)
  * [Parameters](wallet.md#parameters-4)
* [unSubscribeToTx](wallet.md#unsubscribetotx)
  * [Parameters](wallet.md#parameters-5)
* [getSubscribers](wallet.md#getsubscribers)
  * [Parameters](wallet.md#parameters-6)
* [balanceChanged](wallet.md#balancechanged)
  * [Parameters](wallet.md#parameters-7)
* [getBlockNumber](wallet.md#getblocknumber)
* [getEvents](wallet.md#getevents)
  * [Parameters](wallet.md#parameters-8)
* [oneTimeEvents](wallet.md#onetimeevents)
  * [Parameters](wallet.md#parameters-9)
* [pollForEvents](wallet.md#pollforevents)
  * [Parameters](wallet.md#parameters-10)
* [sendTransaction](wallet.md#sendtransaction)
  * [Parameters](wallet.md#parameters-11)

convert wei to gooddollars \(2 decimals\) use toFixed to overcome javascript precision issues ie 8.95\*100=894.9999...

### Parameters

* `wei` [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) 

Returns [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## saveMnemonics

save mnemonics \(secret phrase\) to user device

### Parameters

* `mnemonics` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;any&gt;**

## gdToWei

convert gooddollars to wei \(0 decimals\) use toFixed to overcome javascript precision issues ie 8.95\*Math.pow\(0.1,2\)=8.9500000001

### Parameters

* `gd` [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) 

Returns [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## getMnemonics

get user mnemonics stored on device or generate a new one

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;**[**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**&gt;**

## QueryEvent

the HDWallet account to use. we use different accounts for different actions in order to preserve privacy and simplify things for user in background

Type: {event: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), contract: Web3.eth.Contract, filterPred: {}, fromBlock: any, toBlock: \(any \| `"latest"`\)?}

### Properties

* `event` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) 
* `contract` **Web3.eth.Contract** 
* `filterPred` **{}** 
* `fromBlock` **any** 
* `toBlock` **\(any \|** `"latest"`**\)?** 

## listenTxUpdates

Subscribes to Transfer events \(from and to\) the current account This is used to verify account balance changes

### Parameters

* `fromBlock` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) defaultValue: '0'

Returns **\(**[**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;R&gt; \|** [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;\(R \| any\)&gt; \|** [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;any&gt;\)**

## subscribeToEvent

returns id+eventName so consumer can unsubscribe

### Parameters

* `eventName` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) 
* `cb` [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) 

## unSubscribeToTx

removes subscriber from subscriber list

### Parameters

* `event` [**event**](https://developer.mozilla.org/docs/Web/API/Event) 
  * `event.eventName`  
  * `event.id`  

## getSubscribers

Gets all subscribers as array for given eventName

### Parameters

* `eventName` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) 

Returns [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

## balanceChanged

Listen to balance changes for the current account

### Parameters

* `cb` [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;void&gt;**

## getBlockNumber

Retrieves current Block Number and returns it as converted to a BN instance

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;BN&gt;** Current block number in BN instance

## getEvents

Client side event filter. Requests all events for a particular contract, then filters them and returns the event Object

### Parameters

* `$0` **any** 
  * `$0.event`  
  * `$0.contract`  
  * `$0.filterPred`  
  * `$0.fromBlock`   \(optional, default `ZERO`\)
  * `$0.toBlock`  
* `event` [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Event to subscribe to
* `contract` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Contract from which event will be queried
* `filterPred` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Event's filter. Does not required to be indexed as it's filtered locally
* `fromBlock` **BN** Lower blocks range value
* `toBlock` **BN** Higher blocks range value

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;any&gt;**

## oneTimeEvents

Subscribes to a particular event and returns the result based on options specified

### Parameters

* `$0` **any** 
  * `$0.event`  
  * `$0.contract`  
  * `$0.filterPred`  
  * `$0.fromBlock`  
  * `$0.toBlock`  
* `callback` [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) Function to be called once an event is received
* `event` [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Event to subscribe to
* `contract` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Contract from which event will be queried
* `filterPred` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Event's filter. Does not required to be indexed as it's filtered locally
* `fromBlock` **BN** Lower blocks range value
* `toBlock` **BN** Higher blocks range value

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;void&gt;**

## pollForEvents

Polls for events every INTERVAL defined by BLOCK\_TIME and BLOCK\_COUNT, the result is based on specified options It queries the range 'fromBlock'-'toBlock' and then continues querying the blockchain for most recent events, from the 'lastProcessedBlock' to the 'latest' every INTERVAL

### Parameters

* `$0` **any** 
  * `$0.event`  
  * `$0.contract`  
  * `$0.filterPred`  
  * `$0.fromBlock`  
  * `$0.toBlock`  
* `callback` [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) Function to be called once an event is received
* `event` [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Event to subscribe to
* `contract` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Contract from which event will be queried
* `filterPred` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Event's filter. Does not required to be indexed as it's filtered locally
* `fromBlock` **BN** Lower blocks range value
* `toBlock` **BN** Higher blocks range value
* `lastProcessedBlock` **BN** Used for recursion. It's not required to be set by the user. Initial value: ZERO

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;void&gt;**

## sendTransaction

Helper function to handle a tx Send call

### Parameters

* `tx` **any** 
* `promiEvents` [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)  \(optional, default `defaultPromiEvents`\)
  * `promiEvents.onTransactionHash` [**function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) 
  * `promiEvents.onReceipt` [**function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) 
  * `promiEvents.onConfirmation` [**function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) 
  * `promiEvents.onError` [**function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) 
* `gasValues` [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)  \(optional, default `{gas:undefined,gasPrice:undefined}`\)
  * `gasValues.gas` [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) 
  * `gasValues.gasPrice` [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;\(**[**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) **\| Q.Promise&lt;any&gt; \|** [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;any&gt; \|** [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;any&gt; \|** [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;any&gt; \| any\)&gt;**

