#!/bin/bash
pushd node_modules/@gooddollar/goodprotocol
yarn --frozen-lockfile
yarn deployTest
popd