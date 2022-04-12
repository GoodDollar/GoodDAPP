// @flow
import React, { useCallback, useMemo, useRef, useState } from 'react'
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
import ImageCropper from '../../common/form/ImageCropper'
import useProfile from '../../../lib/userStorage/useProfile'
import userStorage from '../../../lib/userStorage/UserStorage'
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

class AvatarStates {
  static Picker = 'picker'

  static Cropper = 'cropper'
}

const log = logger.child({ from: 'ViewOrUploadAvatar' })
const TITLE = t`My Profile`

const ViewOrUploadAvatar = props => {
  const { styles, screenProps, theme } = props
  const [profile, refreshProfile] = useProfile(true)
  const [showErrorDialog] = useErrorDialog()
  const avatar = useAvatar(profile.avatar)
  const [pickedAvatar, setPickedAvatar] = useState<string>()
  const [currentComponentState, setComponentState] = useState(AvatarStates.Picker)
  const [processing, setProcessing] = useState(false)
  const croppedRef = useRef(avatar)

  const setCropperState = useCallback(
    (value = avatar) => {
      setPickedAvatar(value)
      setComponentState(AvatarStates.Cropper)
    },
    [avatar, setPickedAvatar, setComponentState],
  )

  const handleCameraPress = useDebouncedOnPress(() => {
    openCropper({
      pickerOptions,
      userStorage,
      showErrorDialog,
      setCropperState,
      log,
      avatar,
    })
  }, [screenProps, showErrorDialog, profile, avatar, setCropperState])

  const handleClosePress = useCallback(async () => {
    try {
      await userStorage.removeAvatar()
      refreshProfile()
    } catch (e) {
      log.error('delete image failed:', e.message, e, { dialogShown: true })
      showErrorDialog(t`Could not delete image. Please try again.`)
    }
  }, [showErrorDialog, refreshProfile])

  const handleAddAvatar = useCallback(
    avatar => {
      fireEvent(PROFILE_IMAGE)

      if (Platform.OS === 'web') {
        // on web - set avatar cropper component
        setCropperState(avatar)
        return
      }

      // for native just set new avatar.
      // no need to crop it additionally
      // as the picker component does this
      userStorage
        .setAvatar(avatar)
        .then(() => {
          refreshProfile()
        })
        .catch(e => {
          log.error('save image failed:', e.message, e, { dialogShown: true })
          showErrorDialog(t`Could not save image. Please try again.`)
        })
    },
    [screenProps, refreshProfile],
  )

  const goToProfile = useCallback(() => screenProps.pop(), [screenProps])

  const updateAvatar = useCallback(async () => {
    setProcessing(true)

    try {
      await userStorage.setAvatar(croppedRef.current)
      await refreshProfile()
    } catch (exception) {
      const { message } = exception

      log.error('saving image failed:', message, exception, { dialogShown: true })
      showErrorDialog(t`We could not capture all your beauty. Please try again.`)
      return
    } finally {
      setProcessing(false)
      screenProps.pop()
    }
  }, [screenProps, setProcessing, showErrorDialog])

  const onCropped = useCallback(cropped => {
    croppedRef.current = cropped
  }, [])

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

  const PickerComponent = () => (
    <>
      <Section.Stack style={{ alignSelf: 'center' }}>{profile.avatar ? <HasAvatar /> : <NoAvatar />}</Section.Stack>
      <Section.Stack grow style={styles.buttonsRow}>
        <CustomButton style={styles.doneButton} onPress={goToProfile}>
          {t`Done`}
        </CustomButton>
      </Section.Stack>
    </>
  )

  const CropperComponent = useMemo(
    () => (
      <>
        <ImageCropper image={pickedAvatar} onChange={onCropped} />
        <Section.Stack justifyContent="flex-end" grow>
          <CustomButton disabled={processing} loading={processing} onPress={updateAvatar} color={theme.colors.primary}>
            {t`Save`}
          </CustomButton>
        </Section.Stack>
      </>
    ),
    [pickedAvatar, processing, processing, onCropped, updateAvatar],
  )

  const content = {
    [AvatarStates.Picker]: <PickerComponent />,
    [AvatarStates.Cropper]: CropperComponent,
  }

  return (
    <Wrapper>
      <Section style={styles.section}>{content[currentComponentState]}</Section>
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
