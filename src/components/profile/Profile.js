// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'

import { createStackNavigator } from '../appNavigation/stackNavigation'
import { Section, Text, Wrapper } from '../common'

import UserAvatar from '../common/view/UserAvatar'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import RoundIconButton from '../common/buttons/RoundIconButton'
import useProfile, { usePublicProfile } from '../../lib/userStorage/useProfile'
import { theme } from '../theme/styles'
import Avatar from '../common/view/Avatar'
import { useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'
import { truncateMiddle } from '../../lib/utils/string'
import { useClipboardCopy } from '../../lib/hooks/useClipboard'

import EditProfile from './EditProfile'
import ProfileDataTable from './ProfileDataTable'
import ViewAvatar from './ViewOrUploadAvatar'
import VerifyEdit from './VerifyEdit'
import VerifyEditCode from './VerifyEditCode'

const avatarSize = getDesignRelativeWidth(136)

const copiedActionTimeout = 2000 // time during which the copy success message is displayed

const ProfileAvatar = withStyles(() => ({
  avatar: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
}))(({ styles, style }) => {
  const { smallAvatar: avatar } = useProfile()

  return <Avatar source={avatar} style={[styles.avatar, style]} imageStyle={style} unknownStyle={style} plain />
})

const AddressRow = ({ title, address = undefined, styles }) => {
  const [performed, setPerformed] = useState(false)

  const _onCopied = useCallback(() => {
    setPerformed(true)
    setTimeout(() => setPerformed(false), copiedActionTimeout)
  }, [setPerformed])

  const copyToClipboard = useClipboardCopy(address, _onCopied)

  const handleCopy = useCallback(() => {
    copyToClipboard()
  }, [copyToClipboard])

  const headerCopy = title === 'Wallet' ? t`My Wallet Address` : t`My Face Record ID`

  const truncAddress = truncateMiddle(address, 29)

  return (
    <View style={styles.addressRow}>
      {title === 'Wallet' ? (
        <RoundIconButton
          onPress={handleCopy}
          iconSize={24}
          iconName="wallet_alt-1"
          style={[styles.iconContainer, { backgroundColor: theme.colors.lessDarkGray }]}
        />
      ) : (
        <ProfileAvatar style={{ width: 42, height: 42 }} />
      )}

      <View style={{ flexDirection: 'column', width: 232 }}>
        <Text style={{ textAlign: 'left', fontSize: 16 }}>{headerCopy}</Text>
        <Text style={{ textAlign: 'left', fontSize: 14 }}>{truncAddress}</Text>
      </View>
      <RoundIconButton
        onPress={handleCopy}
        iconSize={performed ? 16 : 24}
        iconName={performed ? 'success' : 'copy'}
        style={styles.iconContainer}
      />
    </View>
  )
}

const ProfileWrapper = ({ screenProps, styles }) => {
  const profile = usePublicProfile()
  const userStorage = useUserStorage()
  const goodWallet = useWallet()
  const [faceRecordId, setRecordId] = useState()

  const { fullName } = profile

  const handleAvatarPress = useCallback(() => screenProps.push(`ViewAvatar`), [screenProps])

  const handleEditProfilePress = useCallback(() => screenProps.push(`EditProfile`), [screenProps])

  useEffect(() => {
    if (userStorage) {
      const isFV2 = userStorage.userProperties.get('fv2')
      userStorage.getFaceIdentifiers().then(_ => {
        setRecordId(isFV2 ? _.v2Identifier.slice(0, 42) : _.v1Identifier)
      })
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
          <Section.Row>
            <AddressRow title="Wallet" address={goodWallet.account} styles={styles} />
          </Section.Row>
          <Section.Row>
            <AddressRow title="FaceId" address={faceRecordId} styles={styles} />
          </Section.Row>
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
    iconContainer: {
      height: 42,
      width: 42,
      backgroundColor: theme.colors.primary,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getDesignRelativeHeight(4, false),
      marginRight: 'auto',
      marginLeft: 'auto',
    },
    addressRow: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      gap: 8,
      width: '100%',
      padding: 8,
      backgroundColor: theme.colors.lightestGray,
      borderRadius: 5,
      marginBottom: 16,
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
