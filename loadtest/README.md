
# GoodDollar DApp

[![Build Status](https://travis-ci.com/GoodDollar/GoodDAPP.svg?branch=master)](https://travis-ci.com/GoodDollar/GoodDAPP) [![Coverage Status](https://coveralls.io/repos/github/GoodDollar/GoodDAPP/badge.svg?branch=master)](https://coveralls.io/github/GoodDollar/GoodDAPP?branch=master)

This project is intended to work aside with [GoodDAPP](https://github.com/GoodDollar/GoodDAPP) project

## Run

```bash
 ./loadtest/run-art.sh
```
Only from a project root. 
After start you choose the test necessary to you from the list of tests 

## Environments
All settings of an environment are in the file  `./loadtest/run-art.sh`

```bash
export REACT_APP_LOG_LEVEL=debug;
export NODE_ENV=development;
export REACT_APP_GUN_PUBLIC_URL=http://localhost:3003/gun
export REACT_APP_PUBLIC_URL=http://localhost:3003
export TARGET=http://localhost:3003
```

## List of tests 

### admin-wallet
Test lock by running concurrent whitelisting transactions. 
Where endpoint it is `/test/add/whitelistUser`

###auth-eth 
Backend API load testing, test the `/auth/eth endpoint`

