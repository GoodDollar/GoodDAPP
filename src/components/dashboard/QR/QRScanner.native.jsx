// @flow
import React from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { getScreenWidth } from '../../../lib/utils/orientation'

export default ({ onScan, ...props }) => (
  <QRCodeScanner
    reactivate={true}
    reactivateTimeout={1000}
    onRead={({ data }) => onScan(data)}
    containerStyle={{ flex: 0 }}
    cameraStyle={{
      width: getScreenWidth() * 0.8,
      height: getScreenWidth() * 0.8,
      overflow: 'hidden',
      alignSelf: 'center',
      alignContent: 'flex-start',
    }}
    {...props}
  />
)
