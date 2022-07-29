#!/bin/sh

echo "Decrypting files - using IS_PROD value of: $IS_PROD"
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

echo $IOS_CERTIFICATE | base64 --decode > ./Certificates.p12
echo $IOS_ADHOC_PROFILE | base64 --decode > ~/Library/MobileDevice/Provisioning\ Profiles/build_pp.mobileprovision
echo $IOS_STORE_PROFILE | base64 --decode > ~/Library/MobileDevice/Provisioning\ Profiles/appstore_pp.mobileprovision

echo "Creating keychain"
security create-keychain -p "" build.keychain
security import ./Certificates.p12 -t agg -k ~/Library/Keychains/build.keychain -P "$IOS_CERTIFICATE_PASSWORD" -A

echo "Installing in keychain"
security list-keychains -s ~/Library/Keychains/build.keychain
security default-keychain -s ~/Library/Keychains/build.keychain
security set-keychain-settings -lut 3000
security unlock-keychain -p "" ~/Library/Keychains/build.keychain
security find-identity -v
security set-key-partition-list -S apple-tool:,apple: -s -k "" ~/Library/Keychains/build.keychain
