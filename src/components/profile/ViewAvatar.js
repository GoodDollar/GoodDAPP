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
import CircleButtonWrapper from './CircleButtonWrapper'
import CameraButton from './CameraButton'

const log = logger.child({ from: 'ViewAvatar' })
const TITLE = 'Your Profile'

const ViewAvatar = props => {
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
    wrappedUserStorage.setProfileField('avatar', null, 'public').catch(e => {
      showErrorDialog('Could not delete image. Please try again.')
      log.error('delete image failed:', e.message, e)
    })
  }

  const handleAddAvatar = avatar => {
    fireEvent(PROFILE_IMAGE)
    wrappedUserStorage.setProfileField('avatar', avatar, 'public').catch(e => {
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
        {profile.avatar ? (
          <>
            <UserAvatar profile={profile} size={272} />
            <CircleButtonWrapper
              style={styles.closeButton}
              iconName={'trash'}
              iconSize={22}
              onPress={handleClosePress}
            />
            <CameraButton style={styles.cameraButton} handleCameraPress={handleCameraPress} />
          </>
        ) : (
          <>
            <InputFile onChange={handleAddAvatar}>
              <UserAvatar profile={profile} size={272} />{' '}
            </InputFile>
            <InputFile onChange={handleAddAvatar}>
              <CameraButton style={styles.cameraButton} />
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

ViewAvatar.navigationOptions = {
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

export default withStyles(getStylesFromProps)(ViewAvatar)
