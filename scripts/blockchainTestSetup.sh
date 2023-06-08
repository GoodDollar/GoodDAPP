#!/bin/bash
cp -R node_modules/@gooddollar/goodprotocol /tmp
pushd /tmp/goodprotocol
export CI=false
export MNEMONIC='test test test test test test test test test test test junk'
export ADMIN_MNEMONIC='test test test test test test test test test test test junk'
yarn set version berry
yarn --immutable
ls -la node_modules/node-jq
mkdir node_modules/node-jq/bin && true
curl -LO https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 -o ./node_modules/node-jq/bin/jq
chmod +x ./node_modules/node-jq/bin/jq
npx patch-package
yarn runNode &
yarn deployTest
yarn minimize
popd
cp -R /tmp/goodprotocol/artifacts node_modules/@gooddollar/goodprotocol/
cp -R /tmp/goodprotocol/releases node_modules/@gooddollar/goodprotocol/
