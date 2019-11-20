
# GoodDollar DApp
[![Bugsnag](/bugsnag_logo.svg?raw=true)](https://bugsnag.com)
[![Build Status](https://travis-ci.com/GoodDollar/GoodDAPP.svg?branch=master)](https://travis-ci.com/GoodDollar/GoodDAPP) [![Coverage Status](https://coveralls.io/repos/github/GoodDollar/GoodDAPP/badge.svg?branch=master)](https://coveralls.io/github/GoodDollar/GoodDAPP?branch=master)

- Use [GoodBootstrap](https://github.com/GoodDollar/GoodBootstrap) to start a dev env
- See [docs](https://docs.gooddollar.org)

## Installation Web

Important: Use node version 10.15.0

### Run web in dev mode with local ganache

```bash
$ npm run web:local
```

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
