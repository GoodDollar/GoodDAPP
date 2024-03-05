// @flow

// libraries
import React from 'react'
import QrReader from 'react-qr-reader-es6'

export default ({ delay, onError, onScan }) => (
  <QrReader delay={delay} onError={onError} onScan={onScan} style={{ width: '100%' }} />
)
