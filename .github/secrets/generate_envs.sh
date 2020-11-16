#!/bin/sh

# result=$(echo $SECRETS | tr ";" "\n")

for val in $SECRETS
do
    echo $val >> .env
done
