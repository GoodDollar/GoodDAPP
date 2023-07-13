import React, { useCallback, useContext } from 'react'
import { Platform, StyleSheet } from 'react-native'
import Section from '../layout/Section'
import useProfile from '../../../lib/userStorage/useProfile'
import { TokenContext } from '../../../lib/wallet/GoodWalletProvider'
import { theme } from '../../theme/styles'
import Config from '../../../config/config'
import Avatar from './Avatar'
import BigGoodDollar from './BigGoodDollar'

/**
 * TopBar - used To display contextual information in a small container
 * @param {object} props - an object with props
 * @param {boolean} props.hideBalance - if falsy balance will be displayed
 * @param {function} props.push - pushes a route to the nav stack. When called, apps navigates to the specified ruote
 * @param {React.Node} props.children
 * @returns {React.Node}
 */
const TopBar = ({
  hideBalance,
  push,
  children,
  style,
  hideProfile = false,
  profileAsLink = false,
  contentStyle,
  avatarSize,
  isBridge,
  network,
}) => {
  const { smallAvatar: avatar } = useProfile()
  const { balance, token, native } = useContext(TokenContext)
  const isNativeToken = Config.isDeltaApp && native

  const redirectToProfile = useCallback(() => {
    if (!push || !profileAsLink) {
      return
    }

    push('Profile')
  }, [push, profileAsLink])

  const onPressAvatar = () => {
    if (push) {
      return profileAsLink ? redirectToProfile : null
    }
  }

  return (
    <Section style={[styles.topBar, style]}>
      <Section.Row
        alignItems={Platform.select({
          web: 'center',
        })}
        style={[contentStyle, { flexDirection: isBridge ? 'row-reverse' : 'row' }]}
      >
        {/*
          if children exist, it will be rendered
          if children=undefined and hideBalance=false, BigGoodDollar will be rendered
          if children=undefined and hideBalance=true, nothing will be rendered
          */}
        <Section.Text style={styles.balance}>
          {!hideBalance && (
            <BigGoodDollar style={styles.bigGoodDollar} number={balance} unit={isNativeToken ? token : undefined} />
          )}
        </Section.Text>

        {children}
        {hideProfile !== true && !isBridge && (!children || hideBalance) && (
          <Avatar
            source={
              avatar //if not already displaying two items show also avatar
            }
            onPress={onPressAvatar}
            size={avatarSize}
          />
        )}
        {isBridge && <Section.Text style={styles.networkName}> {network} G$ </Section.Text>}
      </Section.Row>
    </Section>
  )
}

const styles = StyleSheet.create({
  topBar: {
    justifyContent: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 8,
    paddingTop: 8,
    height: 62,
  },
  networkName: {
    fontSize: 16,
    lineHeight: 20,
    color: theme.colors.lighterGray,
  },
  balance: {
    ...Platform.select({
      android: { height: 10 },
      default: {},
    }),
  },
  bigGoodDollar: {
    ...Platform.select({
      android: { height: 30 },
      default: {},
    }),
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
})

export default TopBar
