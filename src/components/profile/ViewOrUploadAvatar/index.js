// @flow
import React, { useCallback } from 'react'
import { Platform } from 'react-native'
import { t } from '@lingui/macro'
import { CustomButton, Section, Wrapper } from '../../common'
import UserAvatar from '../../common/view/UserAvatar'
import { withStyles } from '../../../lib/styles'
import { useErrorDialog } from '../../../lib/undux/utils/dialog'
import InputFile from '../../common/form/InputFile'
import logger from '../../../lib/logger/js-logger'
import { fireEvent, PROFILE_IMAGE } from '../../../lib/analytics/analytics'
import RoundIconButton from '../../common/buttons/RoundIconButton'
import { useDebouncedOnPress } from '../../../lib/hooks/useOnPress'
import useAvatar from '../../../lib/hooks/useAvatar'
import useProfile from '../../../lib/userStorage/useProfile'
import userStorage from '../../../lib/userStorage/UserStorage'
import useCropperState from './useCropperState'
import Cropper from './Cropper'

export const pickerOptions = {
  width: 400,
  height: 400,
  cropping: true,
  includeBase64: true,
  cropperCircleOverlay: true,
  mediaType: 'photo',
  compressImageMaxWidth: 200,
  useFronCamera: true,
  showCropGuidelines: false,
  showCropFrame: false,
  hideBottomControls: true,
}

const log = logger.child({ from: 'ViewOrUploadAvatar' })
const TITLE = 'My Profile'

const ViewOrUploadAvatar = props => {
  const { styles, screenProps } = props
  const [showErrorDialog] = useErrorDialog()
  const [cropperState, showCropper, hideCropper] = useCropperState()

  const [profile, refreshProfile] = useProfile(true)
  const avatar = useAvatar(profile.avatar)

  const setUserAvatar = useCallback(
    async avatar => {
      try {
        await userStorage.setAvatar(avatar)
        refreshProfile()
      } catch (exception) {
        const { message } = exception

        log.error('saving image failed:', message, exception, { dialogShown: true })
        showErrorDialog(t`We could not capture all your beauty. Please try again.`)
      }
    },
    [showErrorDialog, refreshProfile],
  )

  const handleClosePress = useCallback(async () => {
    try {
      await userStorage.removeAvatar()
      refreshProfile()
    } catch (e) {
      log.error('delete image failed:', e.message, e, { dialogShown: true })
      showErrorDialog(t`Could not delete image. Please try again.`)
    }
  }, [showErrorDialog, refreshProfile])

  const onAvatarCropped = useCallback(
    async avatar => {
      avatar && (await setUserAvatar(avatar))
      hideCropper()
    },
    [hideCropper, setUserAvatar],
  )

  const handleCameraPress = useDebouncedOnPress(() => {
    showCropper(avatar)
  }, [showCropper, avatar])

  const handleAddAvatar = useCallback(
    async avatar => {
      fireEvent(PROFILE_IMAGE)

      if (Platform.OS === 'web') {
        // on web - show avatar cropper
        // with 'alreadyUploaded' flag
        showCropper(avatar, true)
        return
      }

      // for native just set new avatar.
      // no need to crop it additionally
      // as the picker component does this
      await setUserAvatar(avatar)
    },
    [showCropper, setUserAvatar],
  )

  const goToProfile = useCallback(() => screenProps.pop(), [screenProps])

  const HasAvatar = () => (
    <>
      <Section.Row style={styles.topButtons}>
        <RoundIconButton iconSize={22} iconName={'trash'} onPress={handleClosePress} />
        <RoundIconButton iconSize={22} iconName={'camera'} onPress={handleCameraPress} />
      </Section.Row>
      <Section.Row style={styles.avatarRow}>
        <UserAvatar profile={profile} size={272} onPress={handleCameraPress} style={styles.avatarView} />
      </Section.Row>
    </>
  )

  const NoAvatar = () => (
    <>
      <Section.Row style={[styles.topButtons, styles.singleTopButton]}>
        <InputFile
          Component={({ onPress }) => {
            return <RoundIconButton iconSize={22} iconName={'camera'} onPress={onPress} />
          }}
          onChange={handleAddAvatar}
          pickerOptions={pickerOptions}
        />
      </Section.Row>
      <Section.Row style={styles.avatarRow}>
        <InputFile
          Component={({ onPress }) => {
            return <UserAvatar profile={profile} size={272} style={styles.avatarView} onPress={onPress} />
          }}
          onChange={handleAddAvatar}
          pickerOptions={pickerOptions}
        />
      </Section.Row>
    </>
  )

  return (
    <Wrapper>
      <Section style={styles.section}>
        {cropperState.show ? (
          <Cropper
            pickerOptions={pickerOptions}
            justUploaded={cropperState.justUploaded}
            avatar={cropperState.avatar}
            onCropped={onAvatarCropped}
          />
        ) : (
          <>
            <Section.Stack style={{ alignSelf: 'center' }}>
              {profile.avatar ? <HasAvatar /> : <NoAvatar />}
            </Section.Stack>
            <Section.Stack grow style={styles.buttonsRow}>
              <CustomButton style={styles.doneButton} onPress={goToProfile}>
                {t`Done`}
              </CustomButton>
            </Section.Stack>
          </>
        )}
      </Section>
    </Wrapper>
  )
}

ViewOrUploadAvatar.navigationOptions = {
  title: TITLE,
}

const getStylesFromProps = ({ theme }) => {
  return {
    section: {
      flex: 1,
      position: 'relative',
    },
    avatarRow: {
      justifyContent: 'center',
    },
    avatarView: {
      zIndex: 0,

      marginTop: -32,
    },
    topButtons: {
      zIndex: 10,
    },
    singleTopButton: {
      justifyContent: 'flex-end',
    },
    buttonsRow: {
      justifyContent: 'flex-end',
      minHeight: 60,
      width: '100%',
    },
    doneButton: {
      marginTop: 'auto',
    },
  }
}

export default withStyles(getStylesFromProps)(ViewOrUploadAvatar)
