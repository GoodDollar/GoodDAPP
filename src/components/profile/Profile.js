// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { Section, Text, Wrapper } from '../common'
import UserAvatar from '../common/view/UserAvatar'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeWidth } from '../../lib/utils/sizes'
import RoundIconButton from '../common/buttons/RoundIconButton'
import useProfile, { usePublicProfile } from '../../lib/userStorage/useProfile'
import { theme } from '../theme/styles'
import BorderedBox from '../common/view/BorderedBox'
import Avatar from '../common/view/Avatar'
import { useUserStorage } from '../../lib/wallet/GoodWalletProvider'

import EditProfile from './EditProfile'
import ProfileDataTable from './ProfileDataTable'
import ViewAvatar from './ViewOrUploadAvatar'
import VerifyEdit from './VerifyEdit'
import VerifyEditCode from './VerifyEditCode'

const avatarSize = getDesignRelativeWidth(136)

const ProfileAvatar = withStyles(() => ({
  avatar: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
}))(({ styles, style }) => {
  const { smallAvatar: avatar } = useProfile()

  return <Avatar source={avatar} style={[styles.avatar, style]} imageStyle={style} unknownStyle={style} plain />
})

const ProfileWrapper = ({ screenProps, styles }) => {
  const profile = usePublicProfile()
  const userStorage = useUserStorage()
  const [faceRecordId, setRecordId] = useState()

  const { fullName } = profile

  const handleAvatarPress = useCallback(() => screenProps.push(`ViewAvatar`), [screenProps])

  const handleEditProfilePress = useCallback(() => screenProps.push(`EditProfile`), [screenProps])

  useEffect(() => {
    if (userStorage) {
      userStorage.getFaceIdentifiers().then(_ => setRecordId(_.v2Identifier.slice(0, 42)))
    }
  }, [userStorage])

  return (
    <Wrapper>
      <Section.Row justifyContent="space-between" alignItems="flex-start" style={styles.userDataAndButtonsRow}>
        <RoundIconButton
          label={'Edit'}
          iconName={'edit'}
          iconSize={25}
          onPress={handleEditProfilePress}
          style={styles.iconRightContainer}
          containerStyle={styles.iconRight}
        />
      </Section.Row>
      <Section style={styles.section}>
        <View style={styles.emptySpace} />
        <ProfileDataTable profile={profile} showCustomFlag />

        <Section grow justifyContent="flex-end" style={{ marginBottom: 16 }}>
          <BorderedBox
            image={ProfileAvatar}
            title="My Face Record ID"
            content={faceRecordId}
            truncateContent
            copyButtonText="Copy ID"
            enableIndicateAction
          />
        </Section>
      </Section>
      <View style={styles.userDataWrapper}>
        <UserAvatar
          style={styles.userAvatar}
          profile={profile}
          onPress={handleAvatarPress}
          size={avatarSize}
          imageSize={avatarSize - 6}
          unknownStyle={styles.userAvatar}
        />
        {fullName ? (
          <Text fontSize={22} fontFamily={theme.fonts.slab} lineHeight={29} style={styles.userName}>
            {fullName}
          </Text>
        ) : null}
      </View>
    </Wrapper>
  )
}

ProfileWrapper.navigationOptions = {
  title: t`My Profile`,
}

const getStylesFromProps = ({ theme }) => {
  const halfAvatarSize = avatarSize / 2
  return {
    emptySpace: {
      height: 75,
      width: '100%',
    },
    section: {
      flexGrow: 1,
      padding: theme.sizes.defaultDouble,
      marginBottom: theme.paddings.bottomPadding,
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
    userDataWrapper: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      zIndex: 1,
    },
    userAvatar: {
      borderWidth: 3,
      borderColor: theme.colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: halfAvatarSize,
    },
    userDataAndButtonsRow: {
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 1,
      height: avatarSize / 2,
    },
    userName: {
      marginTop: theme.sizes.default,
    },
  }
}

const Profile = withStyles(getStylesFromProps)(ProfileWrapper)

const routes = {
  Profile,
  EditProfile,
  ViewAvatar,
  VerifyEdit,
  VerifyEditCode,
}

export default createStackNavigator(routes)
