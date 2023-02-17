#!/bin/sh
git fetch
git checkout staging
git reset --hard origin/staging
git cherry-pick $1
git push
if [ "$2" = 'prod' ]
then
	git checkout production
	git reset --hard origin/production
	git cherry-pick $1
	npm version patch
	git push --follow-tags
fi
git checkout master