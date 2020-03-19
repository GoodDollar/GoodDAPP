// @flow
import React from 'react'
import GDStore from '../../lib/undux/GDStore'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { Section, UserAvatar, Wrapper } from '../common'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeWidth } from '../../lib/utils/sizes'
import EditAvatar from './EditAvatar'
import EditProfile from './EditProfile'
import ProfileDataTable from './ProfileDataTable'
import ProfilePrivacy from './ProfilePrivacy'
import ViewAvatar from './ViewOrUploadAvatar'
import CircleButtonWrapper from './CircleButtonWrapper'
import VerifyEdit from './VerifyEdit'
import VerifyEditCode from './VerifyEditCode'

const TITLE = 'Profile'

const avatarSize = getDesignRelativeWidth(136)

const ProfileWrapper = props => {
  const store = GDStore.useStore()
  const profile = store.get('profile')
  const { screenProps, styles } = props

  const handleAvatarPress = event => {
    event.preventDefault()
    screenProps.push(`ViewAvatar`)
  }

  return (
    <Wrapper>
      <Section.Row justifyContent="space-between" alignItems="flex-start" style={styles.avatarAndButtonsRow}>
        <CircleButtonWrapper
          label={'Privacy'}
          iconName={'privacy'}
          iconSize={23}
          onPress={() => screenProps.push('ProfilePrivacy')}
          containerStyle={styles.iconLeft}
        />
        <UserAvatar
          containerStyle={styles.userAvatarWrapper}
          style={styles.userAvatar}
          profile={profile}
          onPress={handleAvatarPress}
          avatarSize={avatarSize}
        />
        <CircleButtonWrapper
          label={'Edit'}
          iconName={'edit'}
          iconSize={25}
          onPress={() => screenProps.push('EditProfile')}
          style={styles.iconRightContainer}
          containerStyle={styles.iconRight}
        />
      </Section.Row>
      <Section style={styles.section}>
        <ProfileDataTable profile={profile} />
      </Section>
    </Wrapper>
  )
}

ProfileWrapper.navigationOptions = {
  title: TITLE,
}

const getStylesFromProps = ({ theme }) => ({
  section: {
    flexGrow: 1,
    padding: theme.sizes.defaultDouble,
  },
  iconRightContainer: {
    transform: [{ rotateY: '180deg' }],
  },
  iconLeft: {
    position: 'absolute',
    left: getDesignRelativeWidth(20),
  },
  iconRight: {
    position: 'absolute',
    right: getDesignRelativeWidth(20),
  },
  userAvatarWrapper: {
    borderColor: theme.colors.white,
    borderWidth: 3,
    borderStyle: 'solid',
    borderRadius: '50%',
    position: 'absolute',
  },
  userAvatar: {
    borderWidth: 0,
  },
  avatarAndButtonsRow: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    height: avatarSize / 2,
  },
})

const Profile = withStyles(getStylesFromProps)(ProfileWrapper)

export default createStackNavigator({
  Profile,
  EditProfile,
  ProfilePrivacy,
  ViewAvatar,
  EditAvatar,
  VerifyEdit,
  VerifyEditCode,
})
