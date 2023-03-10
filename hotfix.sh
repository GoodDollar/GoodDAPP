#!/bin/sh
git fetch
if [ "$2" != "prod-only" ]; then
	git checkout staging
	git reset --hard origin/staging
	git cherry-pick $1
	git push
fi
if [[ "$2" == prod* ]]; then
	git checkout next
	git reset --hard origin/next
	git cherry-pick $1
	npm version patch
	git push --follow-tags
fi
git checkout master