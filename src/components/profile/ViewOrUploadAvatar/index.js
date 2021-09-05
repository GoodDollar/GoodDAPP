// @flow
import React, { useCallback } from 'react'
import { Platform } from 'react-native'
import { CustomButton, Section, UserAvatar, Wrapper } from '../../common'
import { withStyles } from '../../../lib/styles'
import { useWrappedUserStorage } from '../../../lib/userStorage/useWrappedStorage'
import { useErrorDialog } from '../../../lib/undux/utils/dialog'
import InputFile from '../../common/form/InputFile'
import logger from '../../../lib/logger/js-logger'
import { fireEvent, PROFILE_IMAGE } from '../../../lib/analytics/analytics'
import RoundIconButton from '../../common/buttons/RoundIconButton'
import { useDebouncedOnPress } from '../../../lib/hooks/useOnPress'
import useAvatar from '../../../lib/hooks/useAvatar'
import useProfile from '../../../lib/userStorage/useProfile'
import openCropper from './openCropper'

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

const log = logger.child({ from: 'VieOrUploadAvatar' })
const TITLE = 'My Profile'

const ViewOrUploadAvatar = props => {
  const { styles, screenProps } = props
  const [profile, refreshProfile] = useProfile(true)
  const wrappedUserStorage = useWrappedUserStorage()
  const [showErrorDialog] = useErrorDialog()
  const avatar = useAvatar(profile.avatar)

  const handleCameraPress = useDebouncedOnPress(() => {
    openCropper({
      pickerOptions,
      screenProps,
      wrappedUserStorage,
      showErrorDialog,
      log,
      avatar,
    })
  }, [screenProps, wrappedUserStorage, showErrorDialog, profile, avatar])

  const handleClosePress = useCallback(async () => {
    try {
      await wrappedUserStorage.removeAvatar()
      refreshProfile()
    } catch (e) {
      log.error('delete image failed:', e.message, e, { dialogShown: true })
      showErrorDialog('Could not delete image. Please try again.')
    }
  }, [wrappedUserStorage, showErrorDialog, refreshProfile])

  const handleAddAvatar = useCallback(
    avatar => {
      fireEvent(PROFILE_IMAGE)

      if (Platform.OS === 'web') {
        // on web - goto avatar cropper
        screenProps.push('EditAvatar', { avatar })
        return
      }

      // for native just set new avatar.
      // no need to crop it additionally
      // as the picker component does this
      wrappedUserStorage
        .setAvatar(avatar)
        .then(() => {
          refreshProfile()
        })
        .catch(e => {
          log.error('save image failed:', e.message, e, { dialogShown: true })
          showErrorDialog('Could not save image. Please try again.')
        })
    },
    [screenProps, wrappedUserStorage, refreshProfile],
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
        <Section.Stack style={{ alignSelf: 'center' }}>{profile.avatar ? <HasAvatar /> : <NoAvatar />}</Section.Stack>
        <Section.Stack grow style={styles.buttonsRow}>
          <CustomButton style={styles.doneButton} onPress={goToProfile}>
            Done
          </CustomButton>
        </Section.Stack>
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
