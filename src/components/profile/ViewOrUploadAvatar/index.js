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
import RoundButton from '../CameraButton'
import { useDebouncedOnPress } from '../../../lib/hooks/useOnPress'
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

  const handleClosePress = useCallback(async () => {
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

  const goToProfile = useCallback(() => navigation.navigate('EditProfile'), [navigation])

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Stack style={{ alignSelf: 'center' }}>
          {profile.avatar ? (
            <>
              <Section.Row style={{ width: '100%', zIndex: 10 }}>
                <RoundButton icon={'trash'} style={styles.closeButton} handleCameraPress={handleClosePress} />
                <RoundButton icon={'camera'} style={styles.cameraButton} handleCameraPress={handleCameraPress} />
              </Section.Row>
              <UserAvatar profile={profile} size={272} onPress={handleCameraPress} style={styles.avatarView} />
            </>
          ) : (
            <>
              <Section.Row style={{ width: '100%', zIndex: 10 }}>
                <InputFile
                  Component={({ onPress }) => {
                    return <RoundButton icon={'camera'} style={styles.cameraButtonNewImg} handleCameraPress={onPress} />
                  }}
                  onChange={handleAddAvatar}
                  pickerOptions={pickerOptions}
                />
              </Section.Row>
              <InputFile
                Component={({ onPress }) => {
                  return <UserAvatar profile={profile} size={272} style={styles.avatarView} onPress={onPress} />
                }}
                onChange={handleAddAvatar}
                pickerOptions={pickerOptions}
              />
              {/* <InputFile onChange={handleAddAvatar} pickerOptions={pickerOptions}>
                <UserAvatar profile={profile} size={272} style={styles.avatarView} />
              </InputFile> */}
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
  const { defaultDouble } = theme.sizes
  const buttonGap = getDesignRelativeWidth(-30) / 2

  return {
    section: {
      flex: 1,
      position: 'relative',

      // alignItems: 'center',
      // justifyContent: 'center',
    },
    cameraButtonContainer: {
      zIndex: 1,
    },
    cameraButton: {
      position: Platform.select({ web: 'static', default: 'relative' }),
      marginTop: defaultDouble,
      marginRight: buttonGap,
    },
    cameraButtonNewImgContainer: {
      zIndex: 1,
    },
    cameraButtonNewImg: {
      position: Platform.select({ web: 'static', default: 'relative' }),
      marginTop: defaultDouble,
      marginRight: buttonGap,
    },
    closeButton: {
      zIndex: 1000000,

      // right: 0,
      position: Platform.select({ web: 'static', default: 'relative' }),

      // top: 0,
      marginTop: defaultDouble,

      // alignSelf: 'flex-start',
      marginLeft: buttonGap,
    },
    avatarView: {
      zIndex: 0,

      marginTop: -32,
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
