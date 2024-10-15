// @flow
import React, { useCallback } from 'react'
import { Text as NText, View } from 'react-native'
import { t } from '@lingui/macro'
import { GoodIdDetails, GoodIdProvider } from '@gooddollar/good-design'

import { createStackNavigator } from '../appNavigation/stackNavigation'
import { Section, Text, Wrapper } from '../common'
import Config from '../../config/config'
import { useFlagWithPayload } from '../../lib/hooks/useFeatureFlags'

import UserAvatar from '../common/view/UserAvatar'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeWidth } from '../../lib/utils/sizes'
import RoundIconButton from '../common/buttons/RoundIconButton'
import { usePublicProfile } from '../../lib/userStorage/useProfile'
import { theme } from '../theme/styles'
import { useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'
import IdentifierRow from '../common/view/IdentifierRow'

import EditProfile from './EditProfile'
import ProfileDataTable from './ProfileDataTable'
import ViewAvatar from './ViewOrUploadAvatar'
import VerifyEdit from './VerifyEdit'
import VerifyEditCode from './VerifyEditCode'

const avatarSize = getDesignRelativeWidth(136)

const ProfileWrapper = ({ screenProps, styles }) => {
  const profile = usePublicProfile()
  const userStorage = useUserStorage()
  const goodWallet = useWallet()

  const payload = useFlagWithPayload('uat-goodid-flow')
  const { whitelist } = payload ?? {}

  // const [faceRecordId, setRecordId] = useState()

  const logMethod = userStorage?.userProperties.get('logMethod')

  const { account } = goodWallet
  const isVerified = goodWallet.isVerified(account)

  const { fullName } = profile

  const handleAvatarPress = useCallback(() => screenProps.push(`ViewAvatar`), [screenProps])

  const handleEditProfilePress = useCallback(() => screenProps.push(`EditProfile`), [screenProps])

  const onGoToClaim = useCallback(() => screenProps.push('GoodIdOnboard'), [screenProps])

  return (
    <Wrapper withMaxHeight={Config.env === 'development' || whitelist?.includes(account) ? false : true}>
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

        <Section grow justifyContent="flex-end" style={{ width: '100%', paddingLeft: 0, paddingRight: 0, margin: 0 }}>
          {logMethod ? (
            <Section.Row>
              <IdentifierRow title="LoginM" text={logMethod} />
            </Section.Row>
          ) : null}
        </Section>
        {Config.env === 'development' || whitelist?.includes(account) ? (
          <View>
            <View>
              <NText
                style={{
                  backgroundColor: '#00AEFF20',
                  color: '#00AEFF',
                  fontFamily: 'Montserrat',
                  fontWeight: '700',
                  fontSize: 24,
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingLeft: 8,
                  paddingRight: 8,
                  width: '100%',
                  textAlign: 'center',
                  marginBottom: 24,
                }}
              >
                {' '}
                GoodID{' '}
              </NText>

              <GoodIdProvider>
                <GoodIdDetails {...{ isVerified, account, onGoToClaim }} />
              </GoodIdProvider>
            </View>
          </View>
        ) : null}
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
      height: 115,
      width: '100%',
    },
    section: {
      flexGrow: 1,
      padding: theme.sizes.defaultDouble,
      paddingLeft: 8,
      paddingRight: 8,
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
      margin: 0,
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
