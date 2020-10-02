// @flow
import React from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'

export default ({ onScan, styles }) => <QRCodeScanner onRead={onScan} cameraStyle={styles.centeredCamera} />
