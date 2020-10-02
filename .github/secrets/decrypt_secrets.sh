#!/bin/sh

echo "Decrypting files"
gpg --quiet --batch --yes --decrypt --passphrase="$IOS_PROFILE_KEY" --output ./.github/secrets/9e082bc9-c641-4185-9bd8-e8504fa13a53.mobileprovision ./.github/secrets/profile.mobileprovision.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$IOS_PROFILE_KEY" --output ./.github/secrets/Certificates.p12 ./.github/secrets/Certificates.p12.gpg

mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

echo "List profiles - before"
ls ~/Library/MobileDevice/Provisioning\ Profiles/
echo "Move profiles"
cp ./.github/secrets/*.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
echo "List profiles - after"
ls ~/Library/MobileDevice/Provisioning\ Profiles/

echo "Creating keychain"
security create-keychain -p "" build.keychain
security import ./.github/secrets/Certificates.p12 -t agg -k ~/Library/Keychains/build.keychain -P "$IOS_PROFILE_KEY" -A

echo "Installing in keychain"
security list-keychains -s ~/Library/Keychains/build.keychain
security default-keychain -s ~/Library/Keychains/build.keychain
security unlock-keychain -p "" ~/Library/Keychains/build.keychain

security set-key-partition-list -S apple-tool:,apple: -s -k "" ~/Library/Keychains/build.keychain
echo "Keychain results"
security find-identity -p codesigning -v
