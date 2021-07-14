// @flow
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import { withTheme } from 'react-native-paper'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import logger from '../../lib/logger/pino-logger'
import { CustomButton, Section, Wrapper } from '../common'
import ImageCropper from '../common/form/ImageCropper'
import useStoredProfile from '../../lib/hooks/useStoredProfile'
import { asDataUrl, asImageRecord, updateImageRecord } from '../../lib/utils/image'

const log = logger.child({ from: 'EditAvatar' })

const TITLE = 'Edit Avatar'

const EditAvatar = ({ theme, screenProps }) => {
  const [showErrorDialog] = useErrorDialog()
  const user = useWrappedUserStorage()

  const [isDirty, markAsDirty] = useState(false)
  const [processing, setProcessing] = useState(false)

  const { avatar } = useStoredProfile()
  const base64 = useMemo(() => (avatar ? asDataUrl(avatar) : null), [avatar])
  const croppedRef = useRef(avatar)

  const updateAvatar = useCallback(async () => {
    setProcessing(true)

    try {
      await user.setAvatar(croppedRef.current)
    } catch (exception) {
      const { message } = exception

      log.error('saving image failed:', message, exception, { dialogShown: true })
      showErrorDialog('We could not capture all your beauty. Please try again.')
    } finally {
      setProcessing(false)
    }

    screenProps.pop()
  }, [screenProps, markAsDirty, setProcessing, showErrorDialog, user])

  const onCropped = useCallback(
    async cropped => {
      let croppedAvatar
      const { current: avatar } = croppedRef

      if (avatar) {
        croppedAvatar = updateImageRecord(avatar, cropped)
      } else {
        croppedAvatar = await asImageRecord(cropped)
      }

      croppedRef.current = croppedAvatar
      markAsDirty(true)
    },
    [markAsDirty],
  )

  useEffect(() => {
    if (processing) {
      return
    }

    markAsDirty(false)
    croppedRef.current = avatar
  }, [avatar])

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row>
          <ImageCropper image={base64} onChange={onCropped} />
        </Section.Row>
        <Section.Stack justifyContent="flex-end" grow>
          <CustomButton
            disabled={!isDirty || processing}
            loading={processing}
            onPress={updateAvatar}
            color={theme.colors.primary}
          >
            Save
          </CustomButton>
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

EditAvatar.navigationOptions = {
  title: TITLE,
}

const styles = StyleSheet.create({
  section: {
    paddingLeft: '1em',
    paddingRight: '1em',
    flex: 1,
  },
})

export default withTheme(EditAvatar)
