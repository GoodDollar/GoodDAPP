#!/bin/bash
pushd node_modules/@gooddollar/goodprotocol
export CI=false
yarn --frozen-lockfile
yarn deployTest
popd