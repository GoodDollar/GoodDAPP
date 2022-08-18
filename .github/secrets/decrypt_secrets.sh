#!/bin/sh

echo "Decrypting files - using ENV value of: $ENV"
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

echo $IOS_CERTIFICATE | base64 --decode > ./Certificates.p12

if [ $ENV -eq 'prod' ]; then
    echo "AppStore provisioning profile configuration :"
    echo $IOS_STORE_PROFILE | base64 --decode > ~/Library/MobileDevice/Provisioning\ Profiles/build_pp.mobileprovision
    /usr/libexec/PlistBuddy -c 'set objects:13B07F951A680F5B00A75B9A:buildSettings:PROVISIONING_PROFILE_SPECIFIER AppStore (iOS Distribution)' ./ios/GoodDollar.xcodeproj/project.pbxproj
    /usr/libexec/PlistBuddy -c 'set objects:13B07F941A680F5B00A75B9A:buildSettings:PROVISIONING_PROFILE_SPECIFIER AppStore (iOS Distribution)' ./ios/GoodDollar.xcodeproj/project.pbxproj
    /usr/libexec/PlistBuddy -c 'set method app-store' ./ios/ci.plist
    /usr/libexec/PlistBuddy -c 'set provisioningProfiles:org.gooddollar AppStore (iOS Distribution)' ./ios/ci.plist
  else
    echo "AdHoc provisioning profile configuration :"
    echo $IOS_ADHOC_PROFILE | base64 --decode > ~/Library/MobileDevice/Provisioning\ Profiles/build_pp.mobileprovision
    /usr/libexec/PlistBuddy -c 'set objects:13B07F951A680F5B00A75B9A:buildSettings:PROVISIONING_PROFILE_SPECIFIER GoodDollar AdHoc (iOS Distribution)' ./ios/GoodDollar.xcodeproj/project.pbxproj
    /usr/libexec/PlistBuddy -c 'set objects:13B07F941A680F5B00A75B9A:buildSettings:PROVISIONING_PROFILE_SPECIFIER GoodDollar AdHoc (iOS Distribution)' ./ios/GoodDollar.xcodeproj/project.pbxproj
    /usr/libexec/PlistBuddy -c 'set method ad-hoc' ./ios/ci.plist
    /usr/libexec/PlistBuddy -c 'set provisioningProfiles:org.gooddollar GoodDollar AdHoc (iOS Distribution)' ./ios/ci.plist
fi

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
