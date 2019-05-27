---
description: Install + Smart contracts deploy + admin wallet
---

# Getting Started

This project is intended to work aside with [GoodServer](https://github.com/GoodDollar/GoodServer) project and [GoodContracts](https://github.com/GoodDollar/GoodContracts)

## Installation Web

{% hint style="warning" %}
Important: Use node version 10.15.0
{% endhint %}

### Install

```bash
npm install
```

## Run

### Run web in dev mode

```bash
$ npm run web
```

## Environments

Default environment variables are set up in `.env.dev` you can overload this variables by setting up `.env` which should include all required variables

### Examples

Using kovan

```text
REACT_APP_NETWORK_ID=121
```

Using a different server url

```text
REACT_APP_SERVER_URL=http://localhost:8888
```

## GoodServer

Server side of the project is responsible to some actions that cannot be decentralized as creating a user, topping the wallet and sending confirmation emails.

In order to run this server you need to clone  [GoodServer](https://github.com/GoodDollar/GoodServer) and follow this instructions.

Default environment variables are set up in `.env.dev` you can overload this variables by setting up `.env` which should include all required variables

### Environment

The most important env variable is the one called `MNEMONICS`this mnemonics needs to match with the account used to deploy the contracts. Please see [Using a local network](getting-started.md#using-a-local-network) 

### Install

```bash
npm install
```

### Run in dev mode

```bash
$ npm run dev
```

## Hints

{% hint style="warning" %}
Please note that both server and dapp must use the same blockchain network and the same @goodcontracts version
{% endhint %}

## Using a local network

In order to take advantage of new features in [GoodContracts](https://github.com/GoodDollar/GoodContracts) or to make changes to the contracts itself you can deploy and run those contracts in your local machine.

* Clone [GoodContracts](https://github.com/GoodDollar/GoodContracts) 
* run `truffle develop`
* in console type `migrate --reset`

## Testing

We are using [snapshot testing](https://jestjs.io/docs/en/snapshot-testing)

```bash
# Web
$ npm run test:web

# Update Snapshots
$ npm run test:web -- -u

# Web watch mode
$ npm run test:web-watch

# Coverage - web
$ npm run coverage
```

## 

