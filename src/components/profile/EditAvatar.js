// @flow
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import { withTheme } from 'react-native-paper'
import { useWrappedUserStorage } from '../../lib/userStorage/useWrappedStorage'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import logger from '../../lib/logger/pino-logger'
import { CustomButton, Section, Wrapper } from '../common'
import ImageCropper from '../common/form/ImageCropper'
import useAvatar from '../../lib/hooks/useAvatar'
import useProfile from '../../lib/userStorage/useProfile'

const log = logger.child({ from: 'EditAvatar' })

const TITLE = 'Edit Avatar'

const EditAvatar = ({ theme, screenProps }) => {
  const passedAvatar = screenProps.screenState.avatar
  const [showErrorDialog] = useErrorDialog()

  const user = useWrappedUserStorage()
  const profile = useProfile()
  const storedAvatar = useAvatar(profile.avatar)

  // if passed avatar mark as dirty so we save it by default
  const [avatar, setAvatar] = useState(() => passedAvatar || storedAvatar)
  const [isDirty, markAsDirty] = useState(() => !!passedAvatar)
  const [processing, setProcessing] = useState(false)

  const croppedRef = useRef(avatar)
  const initializedRef = useRef(false)

  const updateAvatar = useCallback(async () => {
    setProcessing(true)

    try {
      await user.setAvatar(croppedRef.current)
      screenProps.pop()
    } catch (exception) {
      const { message } = exception

      log.error('saving image failed:', message, exception, { dialogShown: true })
      showErrorDialog('We could not capture all your beauty. Please try again.')
    }

    // finally {
    //   setProcessing(false)
    // }
  }, [screenProps, markAsDirty, setProcessing, showErrorDialog, user])

  useEffect(() => {
    return () => setProcessing(false)
  }, [])

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
