# GoodDollar DApp


[![Build Status](https://travis-ci.com/GoodDollar/GoodDAPP.svg?branch=master)](https://travis-ci.com/GoodDollar/GoodDAPP) [![Coverage Status](https://coveralls.io/repos/github/GoodDollar/GoodDAPP/badge.svg?branch=master)](https://coveralls.io/github/GoodDollar/GoodDAPP?branch=master)

This project is intended to work aside with [GoodServer](https://github.com/GoodDollar/GoodServer) project

## Installation Web

Important: Use node version 10.15.0

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

```text
REACT_APP_SERVER_URL=http://localhost:8888
```

Using a different server url. Please note that both server and dapp must use the same blockchain network and the same @goodcontracts version

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

## More

This repository was initiated with [create-react-native-web-app](readme_crnwa.md), please check the [original readme file](readme_crnwa.md) for more information.

