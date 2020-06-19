// @flow

// libraries
import React, { useMemo } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { get } from 'lodash'

// components
import Wrapper from '../common/layout/Wrapper'
import { CustomButton, Icon, Section } from '../common'
import NavBar from '../appNavigation/NavBar'

// hooks
import useOnPress from '../../lib/hooks/useOnPress'
import useClipboard from '../../lib/hooks/useClipboard'

// utils
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import normalize from '../../lib/utils/normalizeText'
import GoodWallet from '../../lib/wallet/GoodWallet'
import GDStore from '../../lib/undux/GDStore'
import config from '../../config/config'
import { isBrowser } from '../../lib/utils/platform'
import { truncateStringInMiddle } from '../../lib/utils/truncateString'

// assets
import unknownProfile from '../../assets/unknownProfile.svg'
import FuseLogo from '../../assets/ExportWallet/FuseLogo.svg'

const web3ProviderUrl = GoodWallet.networkId && config.ethereum[GoodWallet.networkId].httpWeb3provider

// getting the privateKey of GD wallet address - which index is 0
const fullPrivateKey = get(GoodWallet, 'wallet.eth.accounts.wallet[0].privateKey', '')
const amountOfChars = isBrowser ? 24 : 16
const shortenPrivateKey = truncateStringInMiddle(fullPrivateKey, amountOfChars)

const copyIconSize = isBrowser ? 34 : normalize(24)

type ExportWalletProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const BorderedBox = ({ styles, theme, imageSource, title, content, copyButtonText }) => {
  const { setString } = useClipboard()
  const copyToClipboard = useOnPress(() => setString(content), [setString, content])

  return (
    <Section style={styles.borderedBox}>
      <View style={styles.avatarLineSeparator} />
      <Image source={imageSource} style={styles.avatar} />
      <Section.Text fontSize={18} fontFamily="Roboto Slab" fontWeight="bold" style={styles.boxTitle}>
        {title}
      </Section.Text>
      <Section.Text fontSize={13} letterSpacing={0.07} color={theme.colors.lighterGray}>
        {content}
      </Section.Text>
      <View style={styles.copyIconLineSeparator} />
      <TouchableOpacity onPress={copyToClipboard} activeOpacity={1} style={styles.boxCopyIconWrapper}>
        <View style={styles.copyIconContainer}>
          <Icon name="copy" size={copyIconSize} color={theme.colors.surface} />
        </View>
        <Section.Text fontSize={10} fontWeight="medium" color={theme.colors.primary}>
          {copyButtonText}
        </Section.Text>
      </TouchableOpacity>
    </Section>
  )
}

const ExportWalletData = ({ navigation, styles, theme }: ExportWalletProps) => {
  const { navigate } = navigation
  const gdstore = GDStore.useStore()
  const { avatar } = gdstore.get('profile')
  const avatarSource = useMemo(() => (avatar ? { uri: avatar } : unknownProfile), [avatar])
  const rpcImageSource = { uri: FuseLogo }

  const handleGoHome = useOnPress(() => navigate('Home'), [navigate])

  return (
    <Wrapper style={styles.wrapper}>
      <NavBar title="EXPORT MY WALLET" goBack={handleGoHome} />
      <Section grow>
        <View style={styles.containerForBoxes}>
          <BorderedBox
            styles={styles}
            theme={theme}
            title="My Wallet Private Key"
            content={shortenPrivateKey}
            imageSource={avatarSource}
            copyButtonText="Copy Key"
          />
          <BorderedBox
            styles={styles}
            theme={theme}
            title="Fuse Network RPC Address"
            content={web3ProviderUrl}
            imageSource={rpcImageSource}
            copyButtonText="Copy Address"
          />
        </View>
        <CustomButton onPress={handleGoHome}>Done</CustomButton>
      </Section>
    </Wrapper>
  )
}

const styles = ({ theme }) => ({
  wrapper: {
    backgroundImage: 'none',
    backgroundColor: 'none',
    padding: 0,
  },
  containerForBoxes: {
    display: 'flex',
    justifyContent: 'space-around',
    flexGrow: 1,
    marginBottom: getDesignRelativeHeight(10, false),
  },
  borderedBox: {
    borderWidth: 1,
    borerStyle: 'solid',
    borderColor: theme.colors.lighterGray,
    borderRadius: 5,
    height: getDesignRelativeHeight(isBrowser ? 123 : 130, false),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  boxTitle: {
    marginBottom: getDesignRelativeHeight(10, false),
  },
  avatarLineSeparator: {
    height: getDesignRelativeHeight(5, false),
    width: getDesignRelativeHeight(88, false),
    position: 'absolute',
    top: -getDesignRelativeHeight(2.5, false), // half of height
    backgroundColor: theme.colors.surface,
  },
  avatar: {
    height: getDesignRelativeHeight(68, false),
    width: getDesignRelativeHeight(68, false),
    borderRadius: getDesignRelativeHeight(34, false), // half of height/width
    top: -getDesignRelativeHeight(34, false), // half of height
    position: 'absolute',
    zIndex: 1,
  },
  boxCopyIconWrapper: {
    height: getDesignRelativeHeight(52, false),
    width: getDesignRelativeHeight(88, false),
    position: 'absolute',
    bottom: -getDesignRelativeHeight(26, false), // half of height
    zIndex: 1,
  },
  copyIconLineSeparator: {
    height: getDesignRelativeHeight(5, false),
    width: getDesignRelativeHeight(52, false),
    position: 'absolute',
    bottom: -getDesignRelativeHeight(2.5, false), // half of height
    backgroundColor: theme.colors.surface,
  },
  copyIconContainer: {
    height: getDesignRelativeHeight(38, false),
    width: getDesignRelativeHeight(38, false),
    borderRadius: getDesignRelativeHeight(19, false),
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
