#!/usr/bin/env bash
TEST_NAME="auth-eth"
ZERO=0
echo '-----  TEST LIST ------ '
for entry in `ls loadtest/artillery/tests`; do
    echo $entry
done
echo '------------------------'

read -p "Please enter test name, default [${TEST_NAME}] : " NAME
[ -n "${NAME}" ] && TEST_NAME=${NAME}

unset DURATION_USER
while [[ ! ${DURATION_USER} =~ ^[0-9]+$ ]]; do
  read -p "Please enter duration (only number): " DURATION_USER
done

if [ $DURATION_USER -le $ZERO ]
then
  DURATION_USER=1
fi

unset ARRIVALRATE_USER
while [[ ! ${ARRIVALRATE_USER} =~ ^[0-9]+$ ]]; do
  read -p "Please enter arrivalrate (only number): " ARRIVALRATE_USER
done

if [ $ARRIVALRATE_USER -le $ZERO ]
then
  ARRIVALRATE_USER=1
fi
export DURATION=${DURATION_USER};
export ARRIVALRATE=${ARRIVALRATE_USER};

export REACT_APP_LOG_LEVEL=debug;
export NODE_ENV=development;
export REACT_APP_GUN_PUBLIC_URL=http://localhost:3003/gun;
export REACT_APP_PUBLIC_URL=http://localhost:3000;
export TARGET=http://localhost:3003

npx babel-node loadtest/artillery/index.js ${TEST_NAME}

