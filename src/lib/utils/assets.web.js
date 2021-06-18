import { getAssetByID } from 'react-native-web/dist/modules/AssetRegistry'

export const isValidAsset = source => !!getAssetByID(source)
