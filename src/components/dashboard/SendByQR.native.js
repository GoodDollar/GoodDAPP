// @flow
import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'

import logger from '../../lib/logger/pino-logger'
import { extractQueryParams, readCode } from '../../lib/share'
import SimpleStore from '../../lib/undux/SimpleStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import usePermissions from '../permissions/hooks/usePermissions'
import { Permissions } from '../permissions/types'
import QRCameraPermissionDialog from './SendRecieveQRCameraPermissionDialog'
import { routeAndPathForCode } from './utils/routeAndPathForCode'

const log = logger.child({ from: 'SendByQR' })

type Props = {
  screenProps: any,
}

const SendByQR = ({ screenProps }: Props) => {
  const store = SimpleStore.useStore()
  const { pop, push, navigateTo } = screenProps

  const handlePermissionDenied = useCallback(() => pop(), [pop])

  const hasCameraAccess = usePermissions(Permissions.Camera, {
    promptPopup: QRCameraPermissionDialog,
    onDenied: handlePermissionDenied,
    navigate: navigateTo,
  })

  const handleScan = async ({ data }) => {
    if (data) {
      try {
        const paramsUrl = extractQueryParams(data)
        const code = readCode(paramsUrl.code)

        log.info({ code })

        const { route, params } = await routeAndPathForCode('sendByQR', code)

        push(route, params)
      } catch (e) {
        log.error('QR reader send error', e.message, e)
        throw e
      }
    }
  }

  return (
    <Wrapper>
      <TopBar hideProfile={false} profileAsLink={false} hideBalance={true} push={push} />
      <Section style={styles.bottomSection}>
        <Section.Row>
          {hasCameraAccess && (
            <QRCodeScanner onRead={wrapFunction(handleScan, store)} cameraStyle={styles.centeredCamera} />
          )}
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  bottomSection: {
    flex: 1,
  },
  centeredCamera: {
    maxWidth: '100%',
  },
})

SendByQR.navigationOptions = {
  title: 'Scan QR Code',
}

export default SendByQR
