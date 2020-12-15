#!/bin/sh

echo "Decrypting files - using IS_PROD value of: $IS_PROD"
gpg --quiet --batch --yes --decrypt --passphrase="$IOS_PROFILE_KEY" --output ./.github/secrets/Certificates.p12 ./.github/secrets/Certificates.p12.gpg
if $IS_PROD; then
  gpg --quiet --batch --yes --decrypt --passphrase="$IOS_PROFILE_KEY" --output ./.github/secrets/21f28d4b-7641-4420-875f-989a0bcc3d52.mobileprovision ./.github/secrets/profile_store.mobileprovision.gpg
else
  gpg --quiet --batch --yes --decrypt --passphrase="$IOS_PROFILE_KEY" --output ./.github/secrets/b29b41c9-e82a-4aab-96a8-e5d00e55756e.mobileprovision ./.github/secrets/profile.mobileprovision.gpg
fi

mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

echo "Install profiles"
cp ./.github/secrets/*.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/

echo "Creating keychain"
security create-keychain -p "" build.keychain
security import ./.github/secrets/Certificates.p12 -t agg -k ~/Library/Keychains/build.keychain -P "$IOS_PROFILE_KEY" -A

echo "Installing in keychain"
security list-keychains -s ~/Library/Keychains/build.keychain
security default-keychain -s ~/Library/Keychains/build.keychain
security set-keychain-settings -lut 3000
security unlock-keychain -p "" ~/Library/Keychains/build.keychain

security set-key-partition-list -S apple-tool:,apple: -s -k "" ~/Library/Keychains/build.keychain
