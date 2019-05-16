# gundb

### Table of Contents

* [gundb-extend](gundb.md#gundb-extend)
* [getEmailErrorMessage](gundb.md#getemailerrormessage)
  * [Parameters](gundb.md#parameters)
* [getMobileErrorMessage](gundb.md#getmobileerrormessage)
  * [Parameters](gundb.md#parameters-1)
  * [Parameters](gundb.md#parameters-2)
* [getReceiveDataFromReceipt](gundb.md#getreceivedatafromreceipt)
  * [Parameters](gundb.md#parameters-3)
  * [Parameters](gundb.md#parameters-4)
* [init](gundb.md#init)
* [getFeedItemByTransactionHash](gundb.md#getfeeditembytransactionhash)
  * [Parameters](gundb.md#parameters-5)
* [getAllFeed](gundb.md#getallfeed)
* [getProfileFieldValue](gundb.md#getprofilefieldvalue)
  * [Parameters](gundb.md#parameters-6)
* [getProfileField](gundb.md#getprofilefield)
  * [Parameters](gundb.md#parameters-7)
* [getDisplayProfile](gundb.md#getdisplayprofile)
  * [Parameters](gundb.md#parameters-8)
* [getPrivateProfile](gundb.md#getprivateprofile)
  * [Parameters](gundb.md#parameters-9)
* [setProfile](gundb.md#setprofile)
  * [Parameters](gundb.md#parameters-10)
* [setProfileField](gundb.md#setprofilefield)
  * [Parameters](gundb.md#parameters-11)
* [indexProfileField](gundb.md#indexprofilefield)
  * [Parameters](gundb.md#parameters-12)
* [setProfileFieldPrivacy](gundb.md#setprofilefieldprivacy)
  * [Parameters](gundb.md#parameters-13)
* [getFeedPage](gundb.md#getfeedpage)
  * [Parameters](gundb.md#parameters-14)
* [getStandardizedFeed](gundb.md#getstandardizedfeed)
  * [Parameters](gundb.md#parameters-15)
* [getUserAddress](gundb.md#getuseraddress)
  * [Parameters](gundb.md#parameters-16)
* [getUserProfile](gundb.md#getuserprofile)
  * [Parameters](gundb.md#parameters-17)
* [standardizeFeed](gundb.md#standardizefeed)
  * [Parameters](gundb.md#parameters-18)
* [updateFeedEvent](gundb.md#updatefeedevent)
  * [Parameters](gundb.md#parameters-19)
* [getLastBlockNode](gundb.md#getlastblocknode)
* [saveLastBlockNumber](gundb.md#savelastblocknumber)
  * [Parameters](gundb.md#parameters-20)
* [maskField](gundb.md#maskfield)
  * [Parameters](gundb.md#parameters-21)

## gundb-extend

extend gundb SEA with decrypt to match ".secret"

## getEmailErrorMessage

Returns email error message after running some validations

### Parameters

* `email` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) email value

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Email error message if invalid, or empty string

## getMobileErrorMessage

Returns mobile error message after running some validations

### Parameters

* `mobile` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) mobile value

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Mobile error message if invalid, or empty string

Returns an object with record attributes plus some methods to validate, getErrors and check if it is valid

### Parameters

* `record` **UserRecord** User record

Returns **UserModel** User model with some available methods

## getReceiveDataFromReceipt

Extracts transfer events sent to the current account

### Parameters

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

## getAllFeed

Returns a Promise that, when resolved, will have all the feeds available for the current user

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;**[**Array**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)**&lt;FeedEvent&gt;&gt;**

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
* `privacy` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \(private \| public \| masked\) \(optional, default `'public'`\)

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

## getUserAddress

### Parameters

* `field` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Profile field value \(email, mobile or wallet address value\)

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) address

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

## getLastBlockNode

Returns the 'lastBlock' gun's node

Returns **any**

## saveLastBlockNumber

Saves block number in the 'lastBlock' node

### Parameters

* `blockNumber` **\(**[**number**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) **\|** [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**\)** 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;\(**[**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;any&gt; \|** [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;\(R \| any\)&gt;\)&gt;**

## maskField

Returns phone with last 4 numbers, and before that \*\*\*, and hide email user characters leaving visible only first and last character

### Parameters

* `fieldType` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \(Email, mobile or phone\) Field name
* `value` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Field value

Returns [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Returns masked value with \*\*\* to hide characters

