#!/bin/bash
pushd node_modules/@gooddollar/goodprotocol
export CI=false
export MNEMONIC='test test test test test test test test test test test junk'
export ADMIN_MNEMONIC='test test test test test test test test test test test junk'
yarn --immutable
yarn deployTest
yarn minimize
popd