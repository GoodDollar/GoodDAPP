#!/bin/bash
pushd node_modules/@gooddollar/goodcontracts
npm ci
cd stakingModel
npm ci
npm run ganache:test &
npm run wait
npm run start:withmain
npm run simulate:interest #required for fishManager.test.js
popd