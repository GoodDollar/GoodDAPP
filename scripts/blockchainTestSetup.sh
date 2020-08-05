#!/bin/bash
pushd node_modules/@gooddollar/goodcontracts
npm ci
cd stakingModel
npm ci
npm run ganache &
npm run wait
npm run start:withmain
popd