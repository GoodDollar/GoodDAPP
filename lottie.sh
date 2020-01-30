npm i lottie-ios@2.5.3 lottie-react-native@2.6.1
cd ios
pod install
cd ..
react-native link lottie-ios
react-native lottie-react-native
rm -rf ./ios/build
npm run ios
npm i lottie-ios@^3.1.6 lottie-react-native@^3.3.2
npm run android
