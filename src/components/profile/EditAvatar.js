// @flow
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import { withTheme } from 'react-native-paper'
import { t } from '@lingui/macro'
import { useWrappedUserStorage } from '../../lib/userStorage/useWrappedStorage'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import logger from '../../lib/logger/js-logger'
import { CustomButton, Section, Wrapper } from '../common'
import ImageCropper from '../common/form/ImageCropper'
import useAvatar, { useUploadedAvatar } from '../../lib/hooks/useAvatar'
import useProfile from '../../lib/userStorage/useProfile'

const log = logger.child({ from: 'EditAvatar' })

const TITLE = 'Edit Avatar'

const EditAvatar = ({ theme, screenProps }) => {
  const [avatarJustUploaded] = useUploadedAvatar()
  const [showErrorDialog] = useErrorDialog()

  const user = useWrappedUserStorage()
  const profile = useProfile()
  const storedAvatar = useAvatar(profile.avatar)

  // if passed avatar mark as dirty so we save it by default
  const [avatar, setAvatar] = useState(() => avatarJustUploaded || storedAvatar)
  const [isDirty, markAsDirty] = useState(() => !!avatarJustUploaded)
  const [processing, setProcessing] = useState(false)

  const croppedRef = useRef(avatar)
  const initializedRef = useRef(false)

  const updateAvatar = useCallback(async () => {
    setProcessing(true)

    try {
      await user.setAvatar(croppedRef.current)
    } catch (exception) {
      const { message } = exception

      log.error('saving image failed:', message, exception, { dialogShown: true })
      showErrorDialog(t`We could not capture all your beauty. Please try again.`)
      return
    } finally {
      setProcessing(false)
    }

    screenProps.pop()
  }, [screenProps, markAsDirty, setProcessing, showErrorDialog, user])

  const onCropped = useCallback(
    cropped => {
      croppedRef.current = cropped
      markAsDirty(true)
    },
    [markAsDirty],
  )

  useEffect(() => {
    if (initializedRef.current) {
      setAvatar(storedAvatar)
      return
    }

    initializedRef.current = true
  }, [setAvatar, storedAvatar])

  useEffect(() => {
    if (processing) {
      return
    }

    markAsDirty(false)
    croppedRef.current = avatar
  }, [avatar, markAsDirty])

  useEffect(() => {
    setAvatar(avatarJustUploaded)
  }, [avatarJustUploaded])

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row>
          <ImageCropper image={avatar} onChange={onCropped} />
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
