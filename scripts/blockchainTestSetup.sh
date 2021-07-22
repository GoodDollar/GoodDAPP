#!/bin/bash
pushd node_modules/@gooddollar/goodprotocol
yarn install --frozen-lockfile 
yarn deployTest
popd