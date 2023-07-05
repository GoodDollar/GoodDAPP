#!/bin/bash

# this is for vercel to prevent builds of feature branches. it is used in settings/git/ignored build step
echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "goodid/dev" || "$VERCEL_GIT_COMMIT_REF" == "goodid/qa"  || "$VERCEL_GIT_COMMIT_REF" == "goodid/prod" ]] ; then
  # Proceed with the build
    echo "✅ - Build can proceed"
  exit 1;
else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi