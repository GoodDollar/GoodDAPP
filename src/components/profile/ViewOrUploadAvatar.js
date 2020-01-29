// @flow
import React, { useCallback } from 'react'
import { Platform } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import GDStore from '../../lib/undux/GDStore'
import { CustomButton, Section, UserAvatar, Wrapper } from '../common'
import { withStyles } from '../../lib/styles'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import InputFile from '../common/form/InputFile'
import logger from '../../lib/logger/pino-logger'
import { fireEvent, PROFILE_IMAGE } from '../../lib/analytics/analytics'
import { onPressFix } from '../../lib/utils/async'
import CircleButtonWrapper from './CircleButtonWrapper'
import CameraButton from './CameraButton'

//FIXME: RN - problem with gun/mscrypto when saving large image
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
const TITLE = 'Your Profile'

const ViewOrUploadAvatar = props => {
  const { styles } = props
  const store = GDStore.useStore()
  const profile = store.get('profile')
  const wrappedUserStorage = useWrappedUserStorage()
  const [showErrorDialog] = useErrorDialog()

  const getProfileImage = useCallback(async () => {
    // iOS supports reading from a base64 string, android does not.
    if (Platform.OS === 'ios') {
      return profile.avatar
    }

    const RNFS = require('react-native-fs')
    const path = `${RNFS.CachesDirectoryPath}/GD_AVATAR.jpg`
    const imageData = profile.avatar.replace('data:image/jpeg;base64,', '')

    await RNFS.writeFile(path, imageData, 'base64')

    return `file://${path}`
  })

  const openNativeCropper = useCallback(async () => {
    const path = await getProfileImage()
    const image = await ImagePicker.openCropper({ ...pickerOptions, path })

    const avatar = `data:${image.mime};base64,${image.data}`

    wrappedUserStorage.setAvatar(avatar).catch(e => {
      showErrorDialog('Could not save image. Please try again.')
      log.error('save image failed:', e.message, e)
    })
  }, [wrappedUserStorage, showErrorDialog])

  const handleCameraPress = useCallback(
    event => {
      event.preventDefault()

      if (Platform.OS === 'web') {
        props.navigation.navigate('EditAvatar')
      } else {
        openNativeCropper()
      }
    },
    [openNativeCropper]
  )

  const handleClosePress = useCallback(
    event => {
      event.preventDefault()
      wrappedUserStorage.removeAvatar().catch(e => {
        showErrorDialog('Could not delete image. Please try again.')
        log.error('delete image failed:', e.message, e)
      })
    },
    [wrappedUserStorage, showErrorDialog]
  )

  const handleAddAvatar = useCallback(
    avatar => {
      fireEvent(PROFILE_IMAGE)
      wrappedUserStorage.setAvatar(avatar).catch(e => {
        showErrorDialog('Could not save image. Please try again.')
        log.error('save image failed:', e.message, e)
      })

      if (Platform.OS === 'web') {
        props.navigation.navigate('EditAvatar')
      }
    },
    [wrappedUserStorage]
  )

  const goToProfile = useCallback(() => {
    props.navigation.navigate('EditProfile')
  })

  return (
    <Wrapper>
      <Section style={styles.section}>
        {profile.avatar ? (
          <>
            <UserAvatar profile={profile} size={272} onPress={onPressFix(handleCameraPress)} />
            <CircleButtonWrapper
              style={styles.closeButton}
              iconName={'trash'}
              iconSize={22}
              onPress={handleClosePress}
            />
            <CameraButton style={styles.cameraButton} handleCameraPress={onPressFix(handleCameraPress)} />
          </>
        ) : (
          <>
            <InputFile pickerOptions={pickerOptions} onChange={handleAddAvatar}>
              <UserAvatar profile={profile} size={272} />
            </InputFile>
            <InputFile pickerOptions={pickerOptions} onChange={handleAddAvatar} style={styles.cameraButton}>
              <CameraButton noStyles />
            </InputFile>
          </>
        )}
        <CustomButton style={styles.doneButton} onPress={goToProfile}>
          Done
        </CustomButton>
      </Section>
    </Wrapper>
  )
}

ViewOrUploadAvatar.navigationOptions = {
  title: TITLE,
}

const getStylesFromProps = ({ theme }) => ({
  section: {
    flex: 1,
    position: 'relative',
  },
  cameraButton: {
    left: 'auto',
    position: 'absolute',
    right: 12,
    top: theme.sizes.defaultDouble,
  },
  closeButton: {
    left: 12,
    position: 'absolute',
    top: theme.sizes.defaultDouble,
  },
  doneButton: {
    marginTop: 'auto',
  },
})

export default withStyles(getStylesFromProps)(ViewOrUploadAvatar)
