// @flow
import React from 'react'
import GDStore from '../../lib/undux/GDStore'
import { CustomButton, Section, UserAvatar, Wrapper } from '../common'
import { withStyles } from '../../lib/styles'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import InputFile from '../common/form/InputFile'
import CircleButtonWrapper from './CircleButtonWrapper'
import CameraButton from './CameraButton'

const TITLE = 'Your Profile'

const ViewAvatar = props => {
  const { styles } = props
  const store = GDStore.useStore()
  const profile = store.get('profile')
  const wrappedUserStorage = useWrappedUserStorage()
  const [showErrorDialog] = useErrorDialog()

  const handleCameraPress = event => {
    event.preventDefault()
    props.screenProps.push('EditAvatar')
  }

  const handleClosePress = event => {
    event.preventDefault()
    wrappedUserStorage.setProfileField('avatar', null, 'public').catch(e => showErrorDialog('Saving image failed', e))
  }

  const handleAddAvatar = avatar => {
    wrappedUserStorage.setProfileField('avatar', avatar, 'public').catch(e => showErrorDialog('Saving image failed', e))
    props.screenProps.push('EditAvatar')
  }

  const goToProfile = () => {
    props.screenProps.push('EditProfile')
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
              iconSize={20}
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
