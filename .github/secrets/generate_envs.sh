#!/bin/sh

echo "$SENTRYRC" > android/sentry.properties
cp .env.development .env

for val in $SECRETS
do
    echo $val >> .env
done
