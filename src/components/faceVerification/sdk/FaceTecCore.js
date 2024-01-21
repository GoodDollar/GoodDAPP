import * as SDK from '@gooddollar/react-native-facetec/web/sdk/FaceTecSDK'

// this is a hack for vite. for dev we need to import as usual, for production the above import puts it in global
export default { FaceTecSDK: global.FaceTecSDK || SDK.FaceTecSDK } //FaceTecSDK is included as js script in index.html
