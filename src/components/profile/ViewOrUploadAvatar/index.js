// @flow
import React, { useCallback } from 'react'
import { Platform } from 'react-native'
import GDStore from '../../../lib/undux/GDStore'
import { CustomButton, Section, UserAvatar, Wrapper } from '../../common'
import { withStyles } from '../../../lib/styles'
import { useWrappedUserStorage } from '../../../lib/gundb/useWrappedStorage'
import { useErrorDialog } from '../../../lib/undux/utils/dialog'
import InputFile from '../../common/form/InputFile'
import logger from '../../../lib/logger/pino-logger'
import { fireEvent, PROFILE_IMAGE } from '../../../lib/analytics/analytics'
import { getDesignRelativeWidth } from '../../../lib/utils/sizes'
import CircleButtonWrapper from '../CircleButtonWrapper'
import CameraButton from '../CameraButton'
import useOnPress, { useDebouncedOnPress } from '../../../lib/hooks/useOnPress'
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

const log = logger.child({ from: 'ViewAvatar' })
const TITLE = 'My Profile'

const ViewOrUploadAvatar = props => {
  const { styles, navigation } = props
  const store = GDStore.useStore()
  const profile = store.get('profile')
  const wrappedUserStorage = useWrappedUserStorage()
  const [showErrorDialog] = useErrorDialog()
  const { avatar } = profile

  const handleCameraPress = useDebouncedOnPress(() => {
    openCropper({
      pickerOptions,
      navigation,
      wrappedUserStorage,
      showErrorDialog,
      log,
      avatar,
    })
  }, [navigation, wrappedUserStorage, showErrorDialog, profile, avatar])

  const handleClosePress = useOnPress(async () => {
    try {
      await wrappedUserStorage.removeAvatar()
    } catch (e) {
      log.error('delete image failed:', e.message, e, { dialogShown: true })
      showErrorDialog('Could not delete image. Please try again.')
    }
  }, [wrappedUserStorage, showErrorDialog])

  const handleAddAvatar = useCallback(
    avatar => {
      fireEvent(PROFILE_IMAGE)
      wrappedUserStorage.setAvatar(avatar).catch(e => {
        log.error('save image failed:', e.message, e, { dialogShown: true })
        showErrorDialog('Could not save image. Please try again.')
      })

      if (Platform.OS === 'web') {
        props.navigation.navigate('EditAvatar')
      }
    },
    [navigation, wrappedUserStorage],
  )

  const goToProfile = useOnPress(() => navigation.navigate('EditProfile'), [navigation])

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Stack>
          {profile.avatar ? (
            <>
              <UserAvatar profile={profile} size={272} onPress={handleCameraPress} />
              <CircleButtonWrapper
                containerStyle={styles.closeButtonContainer}
                style={styles.closeButton}
                iconName={'trash'}
                iconSize={22}
                onPress={handleClosePress}
              />
              <CameraButton style={styles.cameraButton} handleCameraPress={handleCameraPress} />
            </>
          ) : (
            <>
              <InputFile pickerOptions={pickerOptions} onChange={handleAddAvatar}>
                <CameraButton containerStyle={styles.cameraButtonNewImgContainer} style={styles.cameraButtonNewImg} />
              </InputFile>
              <InputFile pickerOptions={pickerOptions} onChange={handleAddAvatar}>
                <UserAvatar profile={profile} size={272} />
              </InputFile>
            </>
          )}
        </Section.Stack>
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
  const { defaultDouble, defaultQuadruple } = theme.sizes
  const buttonGap = getDesignRelativeWidth(-30) / 2

  return {
    section: {
      flex: 1,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraButtonContainer: {
      zIndex: 1,
    },
    cameraButton: {
      left: 'auto',
      position: 'absolute',
      top: 1,
      right: 1,
      marginTop: defaultDouble,
      marginRight: buttonGap,
    },
    cameraButtonNewImgContainer: {
      zIndex: 1,
    },
    cameraButtonNewImg: {
      left: 'auto',
      position: 'absolute',
      top: 1,
      right: 1,
      marginRight: buttonGap,
    },
    closeButtonContainer: {
      zIndex: 1,
    },
    closeButton: {
      left: 1,
      right: 'auto',
      position: 'absolute',
      top: 1,
      marginTop: defaultDouble,
      marginLeft: buttonGap,
    },
    avatar: {
      marginTop: defaultQuadruple,
    },
    buttonsRow: {
      justifyContent: 'flex-end',
      minHeight: 60,
      width: '100%',
      zIndex: -1,
    },
    doneButton: {
      marginTop: 'auto',
    },
  }
}

export default withStyles(getStylesFromProps)(ViewOrUploadAvatar)
