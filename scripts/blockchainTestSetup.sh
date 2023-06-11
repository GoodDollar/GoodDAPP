#!/bin/bash
cp -R node_modules/@gooddollar/goodprotocol /tmp
pushd /tmp/goodprotocol
export CI=false
export MNEMONIC='test test test test test test test test test test test junk'
export ADMIN_MNEMONIC='test test test test test test test test test test test junk'
yarn set version berry
echo "nodeLinker: node-modules" >> .yarnrc.yml
yarn --immutable
npx patch-package
yarn runNode &
echo "sleeping 15 sec for node start..."
sleep 15
echo "deploying test..."
yarn deployTest
echo "minimizing..."
yarn minimize
popd
cp -R /tmp/goodprotocol/artifacts node_modules/@gooddollar/goodprotocol/
cp -R /tmp/goodprotocol/releases node_modules/@gooddollar/goodprotocol/
