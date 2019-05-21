# undux

### Table of Contents

* [updateBalance](undux.md#updatebalance)
  * [Parameters](undux.md#parameters)
* [executeWithdraw](undux.md#executewithdraw)
  * [Parameters](undux.md#parameters-1)
* [updateEntitlement](undux.md#updateentitlement)
  * [Parameters](undux.md#parameters-2)
* [onBalanceChange](undux.md#onbalancechange)
  * [Parameters](undux.md#parameters-3)

## updateBalance

Retrieves account's balance and sets its value to the state

### Parameters

* `store` **Store** 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;void&gt;**

## executeWithdraw

Execute withdraw from a transaction hash, and handle dialogs with process information using Undux

### Parameters

* `store` **Store** Undux store
* `hash` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) Transaction hash / event id
* `reason` [**string**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Returns the receipt of the transaction

## updateEntitlement

Retrieves account's entitlement and sets its value to the state

### Parameters

* `store` **Store** 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;void&gt;**

## onBalanceChange

Callback to handle events emmited

### Parameters

* `error` **{}** 
* `event` **\[any\]** 
* `store` **Store** 

Returns [**Promise**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**&lt;void&gt;**

Starts listening to Transfer events to \(and from\) the current account

