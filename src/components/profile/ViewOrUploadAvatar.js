// @flow
import React from 'react'
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
const TITLE = 'Your Profile'

const ViewOrUploadAvatar = props => {
  const { styles } = props
  const store = GDStore.useStore()
  const profile = store.get('profile')
  const wrappedUserStorage = useWrappedUserStorage()
  const [showErrorDialog] = useErrorDialog()

  const handleCameraPress = event => {
    event.preventDefault()
    props.navigation.navigate('EditAvatar')
  }

  const handleClosePress = event => {
    event.preventDefault()
    wrappedUserStorage.removeAvatar().catch(e => {
      showErrorDialog('Could not delete image. Please try again.')
      log.error('delete image failed:', e.message, e)
    })
  }

  const handleAddAvatar = avatar => {
    fireEvent(PROFILE_IMAGE)
    wrappedUserStorage.setAvatar(avatar).catch(e => {
      showErrorDialog('Could not save image. Please try again.')
      log.error('save image failed:', e.message, e)
    })
    props.navigation.navigate('EditAvatar')
  }

  const goToProfile = () => {
    props.navigation.navigate('EditProfile')
  }

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Stack>
          {profile.avatar ? (
            <>
              <CircleButtonWrapper
                style={styles.closeButton}
                iconName={'trash'}
                iconSize={22}
                onPress={handleClosePress}
              />
              <CameraButton style={styles.cameraButton} handleCameraPress={handleCameraPress} />
              <UserAvatar profile={profile} size={272} />
            </>
          ) : (
            <>
              <InputFile onChange={handleAddAvatar}>
                <CameraButton style={styles.cameraButtonNewImg} />
              </InputFile>
              <InputFile onChange={handleAddAvatar}>
                <UserAvatar profile={profile} size={272} />{' '}
              </InputFile>
            </>
          )}
        </Section.Stack>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    left: 'auto',
    position: 'absolute',
    top: 1,
    right: 1,
    marginRight: getDesignRelativeWidth(-30),
  },
  cameraButtonNewImg: {
    left: 'auto',
    position: 'absolute',
    top: 1,
    right: 1,
    marginRight: getDesignRelativeWidth(-20),
  },
  closeButton: {
    left: 1,
    right: 'auto',
    position: 'absolute',
    top: 1,
    marginLeft: getDesignRelativeWidth(-30),
  },
  doneButton: {
    marginTop: 'auto',
  },
})

export default withStyles(getStylesFromProps)(ViewOrUploadAvatar)
