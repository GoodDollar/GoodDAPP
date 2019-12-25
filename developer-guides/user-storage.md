---
description: 'Describes how GoodDAPP uses Gun p2p database, to store user owned data.'
---

# User Storage

## Source

[https://github.com/GoodDollar/GoodDAPP/blob/master/src/lib/gundb/UserStorage.js](https://github.com/GoodDollar/GoodDAPP/blob/master/src/lib/gundb/UserStorage.js)

## GunDB

We chose Gun since it's a javascript based, decentralized \(p2p\) with built in encryption database.
Check out their [website](https://gun.eco) for more info

## Usage

You can import the UserStorage instance anywhere in the code by doing

```javascript
import userStorage from '/src/lib/gundb/UserStorage'
//you can make sure its initialized by waiting on 'ready'
await userStorage.ready
```

## Initialization

The constructor calls init\(\), which logs in the user into Gun.
The user's password+pass are generated deterministically by signing a message with one of his HD wallet private keys.

[source](https://github.com/GoodDollar/GoodDAPP/blob/759529c05ab04085c75c76df1bb2eeaaaf6470f1/src/lib/gundb/UserStorage.js#L204-L211)

{% embed url="https://gist.github.com/sirpy/9277f70b2c672e93aae6e24c6bd0ddb0" %}

## Profile

The profile holds information of the user \(signed with Gun SEA, so only he can modify it\) such as:

* Name
* Email
* Mobile
* Wallet Address
* Username

### Structure

Each profile field is an object of type:


```text
export type ProfileField = {
  value: EncryptedField,
  display: string,
  privacy: FieldPrivacy
}
```

* **value -** is the SEA encrypted value, so only the user can read it.
* **display -** is the string displayed on the DAPP to other users
* **privacy -** is the privacy level of the field \(masked, public, private\)

{% hint style="info" %}
Fields such email and mobile can be [set to be public, private or masked](https://github.com/GoodDollar/GoodDAPP/blob/759529c05ab04085c75c76df1bb2eeaaaf6470f1/src/lib/gundb/UserStorage.js#L405-L450), this is in order to let the user control what information he wishes to disclose. If they are public then users will be able to send funds to the user directly by simply typing his mobile, email or username in the app.
{% endhint %}

### Index

We keep the users' profiles indexed by email, mobile \(in case they are public\), wallet address and username. This enables to connect blockchain transactions to user profiles. Specifically it is used in the user feed and in the "Send" flow to enable directly sending GoodDollars by mobile, email and username.

{% code-tabs %}
{% code-tabs-item title="https://github.com/GoodDollar/GoodDAPP/blob/472b22a24dafac154409c2579dbbfcf4cf4e9922/src/lib/gundb/UserStorage.js\#L504-L544" %}
```javascript
/**
   * Generates index by field if privacy is public, or empty index if it's not public
   *
   * @param {string} field - Profile attribute
   * @param {string} value - Profile attribute value
   * @param {string} privacy - (private | public | masked)
   * @returns Gun result promise after index is generated
   * @todo This is world writable so theoritically a malicious user could delete the indexes
   * need to develop for gundb immutable keys to non first user
   */
  async indexProfileField(field: string, value: string, privacy: FieldPrivacy): Promise<ACK> {
    if (!UserStorage.indexableFields[field]) return Promise.resolve({ err: 'Not indexable field', ok: 0 })
    const cleanValue = UserStorage.cleanFieldForIndex(field, value)
    if (!cleanValue) return Promise.resolve({ err: 'Indexable field cannot be null or empty', ok: 0 })

    const indexNode = gun.get(`users/by${field}`).get(cleanValue)
    logger.debug('indexProfileField', { field, cleanValue, value, privacy, indexNode })

```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% hint style="info" %}
An issue with the index is that currently any user can overwrite any entry in the index, since nodes in GunDB are writable by everyone. We are working on an [extension](https://github.com/GoodDollar/gun-appendOnly) to GunDB to create append only nodes so an index key, once set by a user can not be changed by anyone else besides him
{% endhint %}

{% embed url="https://github.com/GoodDollar/gun-appendOnly" %}

### examples

```javascript
//returns johndoe@example.com
let value:string = await userStorage.getProfileFieldValue('email')
//the gun way
let field:ProfileField = await userStorage.profile.get('email').then()
```

## Feed

The feed holds all the blockchain transactions the user did but also other system and messaging events.

### Feed Indexes

We keep 3 indexes for easy access and display purposes:


<table>
  <thead>
    <tr>
      <th style="text-align:left">Index</th>
      <th style="text-align:left">Purpose</th>
      <th style="text-align:left">Storage</th>
      <th style="text-align:left">Structure</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">By ID</td>
      <td style="text-align:left">
        <p>Fast access to event details</p>
        <p>Each events is encrypted</p>
      </td>
      <td style="text-align:left"><code>gun.user().get(&apos;feed&apos;).</code>
        <br /><code>get(&apos;byid&apos;).get(&lt;eventId&gt;)</code>
      </td>
      <td style="text-align:left">FeedEvent</td>
    </tr>
    <tr>
      <td style="text-align:left">By Date(daily)</td>
      <td style="text-align:left">Display sorted by time to user with a reasonable paging scheme</td>
      <td
      style="text-align:left"><code>gun.user().get(&apos;feed&apos;)<br />.get(&lt;date granularity day&gt;)</code>
        </td>
        <td style="text-align:left">Array&lt;[&lt;datetime&gt;,&lt;eventId&gt;]</td>
    </tr>
    <tr>
      <td style="text-align:left">Events count by date</td>
      <td style="text-align:left">Helper for pager to fetch next X events</td>
      <td style="text-align:left"><code>gun.user().get(&apos;feed&apos;)<br />.get(&apos;index&apos;).get(&lt;date granularity day&gt;)</code>
      </td>
      <td style="text-align:left">Number</td>
    </tr>
    <tr>
      <td style="text-align:left">Sorted events count by date</td>
      <td style="text-align:left">GunDB is based on objects so ordering isn&apos;t possible. We keep the
        &apos;Events count by date&apos; as an array sorted by date.</td>
      <td style="text-align:left">this.feedIndex</td>
      <td style="text-align:left">Array&lt;[&lt;day&gt;,&lt;Number&gt;]</td>
    </tr>
  </tbody>
</table>{% hint style="info" %}
Indexes are updated once an event arrives in the method updateFeedEvent:
[https://github.com/GoodDollar/GoodDAPP/blob/472b22a24dafac154409c2579dbbfcf4cf4e9922/src/lib/gundb/UserStorage.js\#L770](https://github.com/GoodDollar/GoodDAPP/blob/472b22a24dafac154409c2579dbbfcf4cf4e9922/src/lib/gundb/UserStorage.js#L770)
{% endhint %}

{% hint style="info" %}
The in memory index is updated on every change to 'index' by add a gundb listener in the method initFeed:
[https://github.com/GoodDollar/GoodDAPP/blob/472b22a24dafac154409c2579dbbfcf4cf4e9922/src/lib/gundb/UserStorage.js\#L339](https://github.com/GoodDollar/GoodDAPP/blob/472b22a24dafac154409c2579dbbfcf4cf4e9922/src/lib/gundb/UserStorage.js#L339)
{% endhint %}

## Good first Issues

* [ ] [Allow users to release gun-appendonly taken keys by nullifiying](https://github.com/GoodDollar/gun-appendOnly/issues/1)
* [ ] [Add inbox for p2p messaging](https://github.com/GoodDollar/GoodDAPP/issues/153)
* [ ] [Use GunDB timegraph for indexing ](https://github.com/GoodDollar/GoodDAPP/issues/154)

