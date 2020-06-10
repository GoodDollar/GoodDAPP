// @flow

// libraries
import React, { useMemo } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'

// components
import Wrapper from '../common/layout/Wrapper'
import { CustomButton, Icon, Section } from '../common'
import NavBar from '../appNavigation/NavBar'

// hooks
import useOnPress from '../../lib/hooks/useOnPress'

// utils
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import GoodWallet from '../../lib/wallet/GoodWallet'
import GDStore from '../../lib/undux/GDStore'
import config from '../../config/config'

// assets
import unknownProfile from '../../assets/unknownProfile.svg'

const privateKey = GoodWallet.wallet.eth.accounts.wallet[0].privateKey
const web3ProviderUrl = config.ethereum[GoodWallet.networkId].httpWeb3provider

type BackupWalletProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const BorderedBox = ({ styles, theme, avatarSource, title, subTitle, copyButtonText }) => {
  return (
    <View style={styles.borderedBox}>
      <View style={styles.boxAvatarContainer}>
        <Image source={avatarSource} style={styles.avatar} />
      </View>
      <Section.Text fontSize={18} fontFamily="Roboto Slab" fontWeight="bold" style={styles.boxTitle}>
        {title}
      </Section.Text>
      <Section.Text fontSize={13} letterSpacing={0.07} color={theme.colors.lighterGray}>
        {subTitle}
      </Section.Text>
      <TouchableOpacity activeOpacity={1} style={styles.boxCopyIconWrapper}>
        <View style={styles.copyIconContainer}>
          <Icon name="copy" size={32} color={theme.colors.surface} />
        </View>
        <Section.Text fontSize={10} fontWeight="medium" color={theme.colors.primary}>
          {copyButtonText}
        </Section.Text>
      </TouchableOpacity>
    </View>
  )
}

const ExportWalletData = ({ navigation, styles, theme }: BackupWalletProps) => {
  const { navigate } = navigation
  const gdstore = GDStore.useStore()
  const { avatar } = gdstore.get('profile')
  const avatarSource = useMemo(() => (avatar ? { uri: avatar } : unknownProfile), [avatar])

  const handleGoBack = useOnPress(() => navigate('Home'), [navigate])

  return (
    <Wrapper style={styles.wrapper}>
      <NavBar title="EXPORT MY WALLET" goBack={handleGoBack} />
      <Section grow justifyContent="space-around">
        <BorderedBox
          styles={styles}
          theme={theme}
          title="My Wallet Private Key"
          subTitle={privateKey}
          avatarSource={avatarSource}
          copyButtonText="Copy Key"
        />
        <BorderedBox
          styles={styles}
          theme={theme}
          title="Fuse Network RPC Address"
          subTitle={web3ProviderUrl}
          avatarSource={avatarSource}
          copyButtonText="Copy Address"
        />
      </Section>
      <CustomButton onPress={() => {}}>Done</CustomButton>
    </Wrapper>
  )
}

const styles = ({ theme }) => ({
  wrapper: {
    backgroundImage: 'none',
    backgroundColor: 'none',
    padding: 0,
  },
  borderedBox: {
    borderWidth: 1,
    borerStyle: 'solid',
    borderColor: theme.colors.lighterGray,
    borderRadius: 5,
    height: getDesignRelativeHeight(123, false),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  boxTitle: {
    marginBottom: getDesignRelativeHeight(10, false),
  },
  boxAvatarContainer: {
    height: getDesignRelativeHeight(88, false),
    width: getDesignRelativeHeight(88, false),
    position: 'absolute',
    top: -getDesignRelativeHeight(44, false), // half of height
    padding: getDesignRelativeHeight(10, false),
    backgroundColor: theme.colors.surface,
  },
  avatar: {
    height: getDesignRelativeHeight(68, false),
    width: getDesignRelativeHeight(68, false),
  },
  boxCopyIconWrapper: {
    height: getDesignRelativeHeight(52, false),
    width: getDesignRelativeHeight(52, false),
    position: 'absolute',
    bottom: -getDesignRelativeHeight(29, false), // half of height
    backgroundColor: theme.colors.surface,
  },
  copyIconContainer: {
    height: getDesignRelativeHeight(38, false),
    width: getDesignRelativeHeight(38, false),
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getDesignRelativeHeight(4, false),
    marginRight: 'auto',
    marginLeft: 'auto',
  },
})

export default withStyles(styles)(ExportWalletData)
