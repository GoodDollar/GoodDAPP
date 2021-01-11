#!/bin/bash
git checkout $1
git merge master
git push
git checkout "rn-$1"
git merge react-native
git push
