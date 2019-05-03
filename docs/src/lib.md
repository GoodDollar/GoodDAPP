# lib

### Table of Contents

* [gundb-extend](lib.md#gundb-extend)
* [updateBalance](lib.md#updatebalance)
  * [Parameters](lib.md#parameters)
* [getEmailErrorMessage](lib.md#getemailerrormessage)
  * [Parameters](lib.md#parameters-1)
* [executeWithdraw](lib.md#executewithdraw)
  * [Parameters](lib.md#parameters-2)
* [getMobileErrorMessage](lib.md#getmobileerrormessage)
  * [Parameters](lib.md#parameters-3)
* [updateEntitlement](lib.md#updateentitlement)
  * [Parameters](lib.md#parameters-4)
* [QueryEvent](lib.md#queryevent)
  * [Properties](lib.md#properties)
* [readReceiveLink](lib.md#readreceivelink)
  * [Parameters](lib.md#parameters-5)
  * [Parameters](lib.md#parameters-6)
* [extractQueryParams](lib.md#extractqueryparams)
  * [Parameters](lib.md#parameters-7)
* [onBalanceChange](lib.md#onbalancechange)
  * [Parameters](lib.md#parameters-8)
* [getReceiveDataFromReceipt](lib.md#getreceivedatafromreceipt)
  * [Parameters](lib.md#parameters-9)
  * [Parameters](lib.md#parameters-10)
* [init](lib.md#init)
* [getFeedItemByTransactionHash](lib.md#getfeeditembytransactionhash)
  * [Parameters](lib.md#parameters-11)
* [getProfileFieldValue](lib.md#getprofilefieldvalue)
  * [Parameters](lib.md#parameters-12)
* [getProfileField](lib.md#getprofilefield)
  * [Parameters](lib.md#parameters-13)
* [getDisplayProfile](lib.md#getdisplayprofile)
  * [Parameters](lib.md#parameters-14)
* [getPrivateProfile](lib.md#getprivateprofile)
  * [Parameters](lib.md#parameters-15)
* [setProfile](lib.md#setprofile)
  * [Parameters](lib.md#parameters-16)
* [setProfileField](lib.md#setprofilefield)
  * [Parameters](lib.md#parameters-17)
* [indexProfileField](lib.md#indexprofilefield)
  * [Parameters](lib.md#parameters-18)
* [setProfileFieldPrivacy](lib.md#setprofilefieldprivacy)
  * [Parameters](lib.md#parameters-19)
* [getFeedPage](lib.md#getfeedpage)
  * [Parameters](lib.md#parameters-20)
* [getStandardizedFeed](lib.md#getstandardizedfeed)
  * [Parameters](lib.md#parameters-21)
* [getUserProfile](lib.md#getuserprofile)
  * [Parameters](lib.md#parameters-22)
* [standardizeFeed](lib.md#standardizefeed)
  * [Parameters](lib.md#parameters-23)
* [updateFeedEvent](lib.md#updatefeedevent)
  * [Parameters](lib.md#parameters-24)
* [maskField](lib.md#maskfield)
  * [Parameters](lib.md#parameters-25)
* [subscribeToEvent](lib.md#subscribetoevent)
  * [Parameters](lib.md#parameters-26)
* [unSubscribeToTx](lib.md#unsubscribetotx)
  * [Parameters](lib.md#parameters-27)
* [getSubscribers](lib.md#getsubscribers)
  * [Parameters](lib.md#parameters-28)
* [balanceChanged](lib.md#balancechanged)
  * [Parameters](lib.md#parameters-29)
* [getEvents](lib.md#getevents)
  * [Parameters](lib.md#parameters-30)
* [oneTimeEvents](lib.md#onetimeevents)
  * [Parameters](lib.md#parameters-31)
* [pollForEvents](lib.md#pollforevents)
  * [Parameters](lib.md#parameters-32)
* [sendTransaction](lib.md#sendtransaction)
  * [Parameters](lib.md#parameters-33)

## gundb-extend

extend gundb SEA with decrypt to match ".secret"

## updateBalance

Retrieves account's balance and sets its value to the state

### Parameters

* `store` **Store** 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;void&gt;**

## getEmailErrorMessage

Returns email error message after running some validations

### Parameters

* `email` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) email value

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Email error message if invalid, or empty string

## executeWithdraw

Execute withdraw from a transaction hash, and handle dialogs with process information using Undux

### Parameters

* `store` **Store** Undux store
* `hash` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Transaction hash / event id
* `reason` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Returns the receipt of the transaction

## getMobileErrorMessage

Returns mobile error message after running some validations

### Parameters

* `mobile` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) mobile value

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Mobile error message if invalid, or empty string

## updateEntitlement

Retrieves account's entitlement and sets its value to the state

### Parameters

* `store` **Store** 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;void&gt;**

## QueryEvent

the HDWallet account to use. we use different accounts for different actions in order to preserve privacy and simplify things for user in background

Type: {event: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), contract: Web3.eth.Contract, filter: {}, fromBlock: any, toBlock: \(any \| `"latest"`\)}

### Properties

* `event` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) 
* `contract` **Web3.eth.Contract** 
* `filter` **{}** 
* `fromBlock` **any** 
* `toBlock` **\(any \|** `"latest"`**\)** 

## readReceiveLink

Parses the read ReceiveGDLink from QR Code. If not valid, returns null. If valid, returns the ReceiveGDLink.

### Parameters

* `link` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) receive GD Link

Returns **\(**[**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) **\| null\)** {link\|null}

Returns an object with record attributes plus some methods to validate, getErrors and check if it is valid

### Parameters

* `record` **UserRecord** User record

Returns **UserModel** User model with some available methods

## extractQueryParams

Extracts query params values and returns them as a key-value pair

### Parameters

* `link` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) url with queryParams \(optional, default `''`\)

Returns [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) {key: value}

## onBalanceChange

Callback to handle events emmited

### Parameters

* `error` **{}** 
* `event` **\[any\]** 
* `store` **Store** 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;void&gt;**

Starts listening to Transfer events to \(and from\) the current account

## getReceiveDataFromReceipt

Extracts transfer events sent to the current account

### Parameters

* `account` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Wallet account
* `receipt` [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Receipt event

Returns [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) {transferLog: event: \[{evtName: evtValue}\]}

Clean string removing blank spaces and special characters, and converts to lower case

### Parameters

* `field` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Field name
* `value` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Field value

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Value without '+' \(plus\), '-' \(minus\), '\_' \(underscore\), ' ' \(space\), in lower case

## init

Initialize wallet, gundb user, feed and subscribe to events

## getFeedItemByTransactionHash

Find feed by transaction hash in array, and returns feed object

### Parameters

* `transactionHash` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) transaction identifier

Returns [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) feed item or null if it doesn't exist

## getProfileFieldValue

Returns profile attribute

### Parameters

* `field` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Profile attribute

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Decrypted profile value

## getProfileField

Returns progfile attribute value

### Parameters

* `field` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Profile attribute

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Gun profile attribute object

## getDisplayProfile

Return display attribute of each profile property

### Parameters

* `profile` [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) User profile

Returns [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) User model with display values

## getPrivateProfile

Returns user model with attribute values

### Parameters

* `profile` [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) user profile

Returns [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) UserModel with some inherit functions

## setProfile

Save profile with all validations and indexes

### Parameters

* `profile` **UserModel** User profile
* Throws **any** Error if profile is invalid

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Promise with profile settings updates and privacy validations

## setProfileField

Set profile field with privacy settings

### Parameters

* `field` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Profile attribute
* `value` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Profile attribute value
* `privacy` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \(private \| public \| masked\)

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Promise with updated field value, secret, display and privacy.

## indexProfileField

Generates index by field if privacy is public, or empty index if it's not public

### Parameters

* `field` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Profile attribute
* `value` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Profile attribute value
* `privacy` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \(private \| public \| masked\)

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;ACK&gt;** Gun result promise after index is generated

## setProfileFieldPrivacy

Set profile field privacy.

### Parameters

* `field` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Profile attribute
* `privacy` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \(private \| public \| masked\)

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Promise with updated field value, secret, display and privacy.

## getFeedPage

Returns the next page in feed. could contain more than numResults. each page will contain all of the transactions of the last day fetched even if &gt; numResults

### Parameters

* `numResults` [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) return at least this number of results if available
* `reset` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) should restart cursor \(optional, default `false`\)

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Promise with an array of feed events

## getStandardizedFeed

Return all feed events

### Parameters

* `numResults` [**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) 
* `reset` [**boolean**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Promise with array of standarised feed events

## getUserProfile

Returns name and avatar from profile based filtered by received value

### Parameters

* `field` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Profile field value \(email, mobile or wallet address value\)

Returns [**object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) profile - { name, avatar }

## standardizeFeed

Returns the feed in a standard format to be loaded in feed list and modal

### Parameters

* `param` **FeedEvent** Feed event with data, type, date and id props
  * `param.data`  
  * `param.type`  
  * `param.date`  
  * `param.id`  

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Promise with StandardFeed object, with props { id, date, type, data: { amount, message, endpoint: { address, fullName, avatar, withdrawStatus }}}

## updateFeedEvent

Update feed event

### Parameters

* `event` **FeedEvent** Event to be updated

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Promise with updated feed

## maskField

Returns phone with last 4 numbers, and before that \*\*\*, and hide email user characters leaving visible only first and last character

### Parameters

* `fieldType` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \(Email, mobile or phone\) Field name
* `value` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Field value

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Returns masked value with \*\*\* to hide characters

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

## getEvents

Client side event filter. Requests all events for a particular contract, then filters them and returns the event Object

### Parameters

* `$0` **any** 
  * `$0.event`  
  * `$0.contract`  
  * `$0.filter`  
  * `$0.fromBlock`   \(optional, default `ZERO`\)
  * `$0.toBlock`  
* `event` [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Event to subscribe to
* `contract` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Contract from which event will be queried
* `filter` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Event's filter. Does not required to be indexed as it's filtered locally
* `fromBlock` **BN** Lower blocks range value
* `toBlock` **BN** Higher blocks range value

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;any&gt;**

## oneTimeEvents

Subscribes to a particular event and returns the result based on options specified

### Parameters

* `$0` **any** 
  * `$0.event`  
  * `$0.contract`  
  * `$0.filter`  
  * `$0.fromBlock`  
  * `$0.toBlock`  
* `callback` [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) Function to be called once an event is received
* `event` [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Event to subscribe to
* `contract` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Contract from which event will be queried
* `filter` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Event's filter. Does not required to be indexed as it's filtered locally
* `fromBlock` **BN** Lower blocks range value
* `toBlock` **BN** Higher blocks range value

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;void&gt;**

## pollForEvents

Polls for events every INTERVAL defined by BLOCK\_TIME and BLOCK\_COUNT, the result is based on specified options It queries the range 'fromBlock'-'toBlock' and then continues querying the blockchain for most recent events, from the 'lastProcessedBlock' to the 'latest' every INTERVAL

### Parameters

* `$0` **any** 
  * `$0.event`  
  * `$0.contract`  
  * `$0.filter`  
  * `$0.fromBlock`  
  * `$0.toBlock`  
* `callback` [**Function**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) Function to be called once an event is received
* `lastProcessedBlock` **BN** Used for recursion. It's not required to be set by the user. Initial value: ZERO \(optional, default `ZERO`\)
* `event` [**String**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Event to subscribe to
* `contract` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Contract from which event will be queried
* `filter` [**Object**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Event's filter. Does not required to be indexed as it's filtered locally
* `fromBlock` **BN** Lower blocks range value
* `toBlock` **BN** Higher blocks range value

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

