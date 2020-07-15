// @flow
import React, { useCallback } from 'react'
import GDStore from '../../lib/undux/GDStore'
import { CustomButton, Section, UserAvatar, Wrapper } from '../common'
import { withStyles } from '../../lib/styles'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import InputFile from '../common/form/InputFile'
import logger from '../../lib/logger/pino-logger'
import { fireEvent, PROFILE_IMAGE } from '../../lib/analytics/analytics'
import { getDesignRelativeWidth } from '../../lib/utils/sizes'
import CircleButtonWrapper from './CircleButtonWrapper'
import CameraButton from './CameraButton'

const log = logger.child({ from: 'ViewAvatar' })
const TITLE = 'My Profile'

const ViewOrUploadAvatar = ({ styles, navigation, screenProps }) => {
  const store = GDStore.useStore()
  const profile = store.get('profile')
  const wrappedUserStorage = useWrappedUserStorage()
  const [showErrorDialog] = useErrorDialog()

  const handleCameraPress = useCallback(
    event => {
      event.preventDefault()
      navigation.navigate('EditAvatar')
    },
    [navigation],
  )

  const handleClosePress = useCallback(
    event => {
      event.preventDefault()

      wrappedUserStorage.removeAvatar().catch(e => {
        log.error('delete image failed:', e.message, e, { dialogShown: true })
        showErrorDialog('Could not delete image. Please try again.')
      })
    },
    [wrappedUserStorage],
  )

  const handleAddAvatar = useCallback(
    avatar => {
      fireEvent(PROFILE_IMAGE)

      wrappedUserStorage.setAvatar(avatar).catch(e => {
        log.error('save image failed:', e.message, e, { dialogShown: true })
        showErrorDialog('Could not save image. Please try again.')
      })

      navigation.navigate('EditAvatar')
    },
    [navigation, wrappedUserStorage],
  )

  const navigateBack = useCallback(() => {
    screenProps.pop()
  }, [navigation])

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Stack>
          {profile.avatar ? (
            <>
              <CircleButtonWrapper
                containerStyle={styles.closeButtonContainer}
                style={styles.closeButton}
                iconName={'trash'}
                iconSize={22}
                onPress={handleClosePress}
              />
              <CameraButton
                containerStyle={styles.cameraButtonContainer}
                style={styles.cameraButton}
                handleCameraPress={handleCameraPress}
              />
              <UserAvatar profile={profile} style={styles.avatar} size={272} />
            </>
          ) : (
            <>
              <InputFile onChange={handleAddAvatar}>
                <CameraButton containerStyle={styles.cameraButtonNewImgContainer} style={styles.cameraButtonNewImg} />
              </InputFile>
              <InputFile onChange={handleAddAvatar}>
                <UserAvatar profile={profile} size={272} />{' '}
              </InputFile>
            </>
          )}
        </Section.Stack>
        <Section.Stack grow style={styles.buttonsRow}>
          <CustomButton style={styles.doneButton} onPress={navigateBack}>
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
    },
    doneButton: {
      marginTop: 'auto',
    },
  }
}

export default withStyles(getStylesFromProps)(ViewOrUploadAvatar)
