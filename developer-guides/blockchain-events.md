---
description: Events being logged by GoodDAPP
---

# Blockchain Events

## Definition

Events are the Solidity abstraction on top of the EVM's logging functionality.

> Events are inheritable members of contracts. When you call them, they cause the arguments to be stored in the transaction’s log - a special data structure in the blockchain. These logs are associated with the address of the contract, are incorporated into the blockchain, and stay there as long as a block is accessible. The Log and its event data is not accessible from within contracts.

{% hint style="info" %}
See: [Solidity Official documentation for Events](https://solidity.readthedocs.io/en/latest/contracts.html#events)
{% endhint %}

## Contracts

Contracts being used by GoodDAPP logs different information in the form of events.

The list of contracts that GoodDAPP is aware of:

* [GoodDollar.sol](https://github.com/GoodDollar/GoodContracts/blob/master/contracts/GoodDollar.sol)
* [GoodDollarReserve.sol](https://github.com/GoodDollar/GoodContracts/blob/master/contracts/GoodDollarReserve.sol)
* [Identity.sol](https://github.com/GoodDollar/GoodContracts/blob/master/contracts/Identity.sol)
* [OneTimePaymentLinks.sol](https://github.com/GoodDollar/GoodContracts/blob/master/contracts/OneTimePaymentLinks.sol)
* [RedemptionFunctional.sol](https://github.com/GoodDollar/GoodContracts/blob/master/contracts/RedemptionFunctional.sol)

## Events by Contract

* [GoodDollar](blockchain-events.md#gooddollar)
  * [PopulatedMarket\(\)](blockchain-events.md#populatedmarket)
  * [Transfer\(from, to, value\)](blockchain-events.md#transfer-address-indexed-from-address-indexed-to-uint-value)
  * [Transfer\(from, to, value, data\)](blockchain-events.md#transfer-address-indexed-from-address-indexed-to-uint-value-bytes-data)
  * [TransactionFees\(fee, burned\)](blockchain-events.md#transactionfees-uint256-fee-uint256-burned)
  * [OwnershipTransferred\(previousOwner, newOwner\)](blockchain-events.md#ownershiptransferred-address-indexed-previousowner-address-indexed-newowner)
  * [MinterAdded\(account\)](blockchain-events.md#minteradded-address-indexed-account)
  * [MinterRemoved\(account\)](blockchain-events.md#minterremoved-address-indexed-account)
  * [Approval\(owner, spender, value\)](blockchain-events.md#approval-address-indexed-owner-address-indexed-spender-uint256-value)
  * [ContractFallbackCallFailed\(from, to, value\)](blockchain-events.md#contractfallbackcallfailed-address-from-address-to-uint256-value)
* [GooDollarReserve](blockchain-events.md#gooddollarreserve)
  * [SignerAdded\(account\)](blockchain-events.md#signeradded-address-indexed-account)
  * [SignerRemoved\(account\)](blockchain-events.md#signerremoved-address-indexed-account)
  * [OwnershipTransferred\(previousOwner, newOwner\)](blockchain-events.md#ownershiptransferred-address-indexed-previousowner-address-indexed-newowner-1)
* [Identity](blockchain-events.md#identity)
  * [WhitelistedAdded\(account\)](blockchain-events.md#whitelistedadded-address-indexed-account)
  * [WhitelistedRemoved\(account\)](blockchain-events.md#whitelistedremoved-address-indexed-account)
  * [WhitelistAdminAdded\(account\)](blockchain-events.md#whitelistadminadded-address-indexed-account)
  * [WhitelistAdminRemoved\(account\)](blockchain-events.md#whitelistadminremoved-address-indexed-account)
* [OneTimePaymentLinks](blockchain-events.md#onetimepaymentlinks)
  * [PaymentDeposit\(from, hash, amount\)](blockchain-events.md#paymentdeposit-address-indexed-from-bytes32-hash-uint256-amount)
  * [PaymentWithdraw\(from, to, hash, amount\)](blockchain-events.md#paymentwithdraw-address-indexed-from-address-indexed-to-bytes32-indexed-hash-uint256-amount)
  * [OwnershipTransferred\(previousOwner, newOwner\)](blockchain-events.md#ownershiptransferred-address-indexed-previousowner-address-indexed-newowner-2)
  * [PaymentCancel\(from, hash, amount\)](blockchain-events.md#paymentcancel-address-indexed-from-bytes32-hash-uint256-amount)
* [RedemptionFunctional](blockchain-events.md#redemptionfunctional)
  * [UBIClaimed\(by, total\)](blockchain-events.md#ubiclaimed-address-indexed-by-uint256-total)
  * [OwnershipTransferred\(previousOwner, newOwner\)](blockchain-events.md#ownershiptransferred-address-indexed-previousowner-address-indexed-newowner-3)

### GoodDollar

#### PopulatedMarket\(\)

* **when:** During deployment/migration process, in the G$s minting phase. It's a one-time event.
* **where:** Emitted when the `GoodDollar.initialMove()` method is called and successfully executed.

#### Transfer\(address indexed from, address indexed to, uint value\)

* **when:** Every time a user Sends \(Transfers\) G$s to an account.
* **where:** In Send flow, user is able to transfer directly to an account by calling `GoodDollar.transfer()` specifying destination address, email, mobile or username.

```yaml
from: who sent the G$
to: to whom the G$ was sent
value: the amount of G$ (in wei) being transferred
```

#### Transfer\(address indexed from, address indexed to, uint value, bytes data\)

* **when:** Every time a user generates a link to share G$s in Send screen.
* **where:** In Send flow, user is able to generate a link to later be withdrawn by calling `GoodDollar.transferAndCall()`.

```yaml
from: who sent the G$
to: to whom the G$ was sent
value: the amount of G$ (in wei) being transferred
data: encoded ABI to be called after G$ transfer
```

#### TransactionFees\(uint256 fee, uint256 burned\)

* **when:** Every time a Transfer is done.
* **where:** In Send flow, user is able to send G$s to another wallet by specifying its address, email, mobile or username, or by generating a link to later be withdrawn by calling `GoodDollar.transfer()`, `GoodDollar.transferAndCall()`. 

```yaml
fee: fee being charged for the transaction (in wei).
     And transferred to the GoodDollarReserve contract.
burned: fee being charged for the transaction (in wei).
        And burned if transaction was successfull.
```

#### OwnershipTransferred\(address indexed previousOwner, address indexed newOwner\)

* **when:** During deployment/migration process.
* **where:**  At contract deployment step, previous owner is set to `0x0`. And at the end of the migration process, ownership is transferred to the `GoodDollarReserve` contract. 

```yaml
previosOwner: address of the previous owner.
              The one who requested the ownership transfer.
newOwner: addres of the new owner.
```

#### MinterAdded\(address indexed account\)

* **when:** During deployment/migration process.
* **where:** At contract deployment, account used to deploy contract is being assigned. During migration `GoodDollarReserve` contract is also added.

```yaml
account: the address of the contract/account who can mint.
```

#### MinterRemoved\(address indexed account\)

* **when:** During migration process.
* **where:** During migration, after adding `GoodDollarReserve`, the deployer account is being removed.  ****

```yaml
account: the address of minter to be removed from minters list.
```

#### Approval\(address indexed owner, address indexed spender, uint256 value\)

* **when:** Not being used.
* **where:** Not being used.

```yaml
owner: account that approves an amount of tokens to be spent by the 'spender'.
spender: account approved to spent an amount of tokens on behalf of the 'owner'.
value: amount of tokens approved to be spent by the 'spender'.
```

#### ContractFallbackCallFailed\(address from, address to, uint256 value\)

* **when:** When a transfer of G$s is being made to a contract that don't have `onTokenTransfer` method.
* **where:** In the ÐApp, when sending directly to an address.

```yaml
from: address making the transfer of G$s.
to: address to where the G$s where sent.
value: the amount of G$s being transferred.
```

### GoodDollarReserve

#### SignerAdded\(address indexed account\)

* **when:** During deployment process.
* **where:** At deployment step, when class constructor is called.

```yaml
account: the address of the contract's signer.
```

#### SignerRemoved\(address indexed account\)

* **when:** Not being used.
* **where:** Not being used.

```yaml
account: the address of the contract's signer to be removed.
```

#### OwnershipTransferred\(address indexed previousOwner, address indexed newOwner\)

* **when:** During deployment/migration process.
* **where:** At contract deployment step, previous owner is set to `0x0`. And at the end of the migration process, ownership is transferred to `RedemptionFunctional` contract.

```yaml
previosOwner: address of the previous owner.
              The one who requested the ownership transfer.
newOwner: addres of the new owner.
```

### Identity

#### WhitelistedAdded\(address indexed account\)

* **when:** During migration process. And every time a new user is validated in GoodDAPP.
* **where:** During migration `GoodDollar`, `GoodDollarReserve` and `OneTimePaymentLinks` are added to the list. During application lifetime, when a user has been validated \(email, mobile and Face Recognition\).

```yaml
account: address added to the validated list of GoodDAPP accounts.
```

#### WhitelistedRemoved\(address indexed account\)

* **when:** Not being used.
* **where:** Not being used.

```yaml
account: address removed from the validated list of GoodDAPP accounts.
```

#### WhitelistAdminAdded\(address indexed account\)

* **when:** During deployment/migration process.
* **where:** At deployment step, when class constructor is called, sets account used to deploy the contract.

```yaml
account: address added to the admin list.
```

#### WhitelistAdminRemoved\(address indexed account\)

* **when:** Not being used.
* **where:** Not being used.

```yaml
account: address removed from admin list.
```

### OneTimePaymentLinks

#### PaymentDeposit\(address indexed from, bytes32 hash, uint256 amount\)

* **when:** When a deposit is being made from the ÐApp.
* **where:** In Send flow, if user generates a link to share G$s, the amount specified will generate a deposit to the contract.

```yaml
from: account that deposits G$s.
hash: identifier for the amount being deposited.
amount: the amount of G$s being deposited.
```

#### PaymentWithdraw\(address indexed from, address indexed to, bytes32 indexed hash, uint256 amount\)

* **when:** When a withdraw is being made from the ÐApp.
* **where:** Accessing the withdraw link being generated by Send -&gt; Generate Link. Or by scanning, in the Receive flow,  the QR code generated from the Sender

```yaml
from: address that generated the deposit to be withdrawn.
to: address that excecuted the withdraw.
hash: identifier for the amount being withdrawn.
amount: the mount of G$s being withdrawn.
```

#### OwnershipTransferred\(address indexed previousOwner, address indexed newOwner\)

* **when:** During deployment process.
* **where:** At deployment, ownership is transferred to the deployer account.

```yaml
previosOwner: address of the previous owner.
              The one who requested the ownership transfer.
newOwner: addres of the new owner.
```

#### PaymentCancel\(address indexed from, bytes32 hash, uint256 amount\)

* **when:** When a user that generates the  deposit decides to cancel it.
* **where:** Not being used.

```yaml
from: address that cancels the deposit.
hash: identifier for the deposit.
amount: amount being cancelled.
```

### RedemptionFunctional

#### UBIClaimed\(address indexed by, uint256 total\)

* **when:** When user claims its G$s.
* **where:** In the ÐApp, when user has G$s to claim, it can go to the Claim flow and receive the G$s after making a Face Recognition validation.

```yaml
by: registered address that claims G$s tokens.
total: amount of G$s being claimed.
```

#### OwnershipTransferred\(address indexed previousOwner, address indexed newOwner\)

* **when:** During deployment process.
* **where:** At deployment, ownership is transferred to the deployer account.

```yaml
previosOwner: address of the previous owner.
              The one who requested the ownership transfer.
newOwner: addres of the new owner.
```

