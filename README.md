
# GoodDollar DApp
We use [<img valign="middle" src="/bugsnag_logo.svg?raw=true&sanitize=1" width="100px"/>](https://bugsnag.com)
[<img valign="middle" src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg?raw=true&sanitize=1" width="100px"/>](https://vercel.com/?utm_source=gooddollar&utm_campaign=oss)

[![Build Status](https://travis-ci.com/GoodDollar/GoodDAPP.svg?branch=master)](https://travis-ci.com/GoodDollar/GoodDAPP) [![Coverage Status](https://coveralls.io/repos/github/GoodDollar/GoodDAPP/badge.svg?branch=master)](https://coveralls.io/github/GoodDollar/GoodDAPP?branch=master)

- Use [GoodBootstrap](https://github.com/GoodDollar/GoodBootstrap) to start a dev env
- See [docs](https://docs.gooddollar.org)

## Installation Web

Important: Use node version specified in .nvmrc

### Run web in dev mode with local ganache

```bash
$ npm run web:local
```

## Installation Native

```bash
  (cd ios && pod install)
```

#### Setup sentry
```bash
npx sentry-wizard -i reactNative -p ios android
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
