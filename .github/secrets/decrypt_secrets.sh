#!/bin/sh

echo "Decrypting files - using IS_PROD value of: $IS_PROD"
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

echo $IOS_CERTIFICATE | base64 --decode > ./Certificates.p12
if $IS_PROD; then
  echo $IOS_STORE_PROFILE | base64 --decode > ~/Library/MobileDevice/Provisioning\ Profiles/21f28d4b-7641-4420-875f-989a0bcc3d52.mobileprovision
else
  echo $IOS_ADHOC_PROFILE | base64 --decode > ~/Library/MobileDevice/Provisioning\ Profiles/b29b41c9-e82a-4aab-96a8-e5d00e55756e.mobileprovision
fi

echo "Creating keychain"
security create-keychain -p "" build.keychain
security import ./Certificates.p12 -t agg -k ~/Library/Keychains/build.keychain -P "$IOS_PROFILE_KEY" -A

echo "Installing in keychain"
security list-keychains -s ~/Library/Keychains/build.keychain
security default-keychain -s ~/Library/Keychains/build.keychain
security set-keychain-settings -lut 3000
security unlock-keychain -p "" ~/Library/Keychains/build.keychain
security find-identity -v
security set-key-partition-list -S apple-tool:,apple: -s -k "" ~/Library/Keychains/build.keychain
