import React, { useCallback, useState } from 'react'
import { Platform, Text, View } from 'react-native'
import { t } from '@lingui/macro'

import RoundIconButton from '../buttons/RoundIconButton'
import { COPY_ADDRESS, fireEvent } from '../../../lib/analytics/analytics'
import { useClipboardCopy } from '../../../lib/hooks/useClipboard'
import { truncateMiddle } from '../../../lib/utils/string'
import { withStyles } from '../../../lib/styles'
import { theme } from '../../theme/styles'
import useProfile from '../../../lib/userStorage/useProfile'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import Avatar from './Avatar'

const copiedActionTimeout = 2000 // time during which the copy success message is displayed

const RowTitles = {
  Wallet: t`My Wallet Address`,
  FaceId: t`My Face Record ID`,
  LoginM: t`Login Method`,
}

const ProfileAvatar = withStyles(() => ({
  avatar: {
    borderWidth: 0,
    backgroundColor: theme.colors.lessDarkGray,
  },
}))(({ styles, style }) => {
  const { smallAvatar: avatar } = useProfile()

  return <Avatar source={avatar} style={[styles.avatar, style]} imageStyle={style} unknownStyle={style} plain />
})

const IdentifiersRow = ({ title, eventSource, text, address, styles, withCopy = false }) => {
  const [performed, setPerformed] = useState(false)

  const _onCopied = useCallback(() => {
    setPerformed(true)

    if (eventSource) {
      fireEvent(COPY_ADDRESS, { source: eventSource })
    }

    setTimeout(() => setPerformed(false), copiedActionTimeout)
  }, [setPerformed])

  const copyToClipboard = useClipboardCopy(address, _onCopied)

  const truncAddress = address ? truncateMiddle(address, 22) : text

  return (
    <View style={styles.addressRowContainer}>
      {title === 'Wallet' ? (
        <RoundIconButton
          iconSize={24}
          iconName="wallet_alt-1"
          style={[styles.iconContainer, { backgroundColor: theme.colors.lessDarkGray }]}
        />
      ) : title === 'FaceId' ? (
        <ProfileAvatar style={{ width: 42, height: 42 }} />
      ) : (
        <RoundIconButton
          iconSize={24}
          iconName="faceicon"
          style={[styles.iconContainer, { backgroundColor: theme.colors.lessDarkGray }]}
        />
      )}

      <View style={styles.addressRow}>
        <Text style={{ textAlign: 'left', fontSize: 16, height: 21 }}>{RowTitles[title] || title}</Text>
        <Text style={{ textAlign: 'left', fontSize: 14, color: theme.colors.lighterGray }}>{truncAddress}</Text>
      </View>
      <View style={styles.iconContainer}>
        {withCopy && (
          <RoundIconButton
            onPress={copyToClipboard}
            iconSize={performed ? 16 : 24}
            iconName={performed ? 'success' : 'copy'}
            style={styles.icon}
          />
        )}
      </View>
    </View>
  )
}

const getStyleFromProps = ({ theme }) => ({
  iconContainer: {
    height: 43,
    width: 43,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getDesignRelativeHeight(4, false),
  },
  icon: {
    marginRight: 'auto',
    marginLeft: 'auto',
    backgroundColor: theme.colors.primary,
  },
  addressRowContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    ...Platform.select({
      web: {
        gap: 8,
      },
    }),
    width: '100%',
    padding: 8,
    backgroundColor: theme.colors.lightestGray,
    borderRadius: 5,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'column',
    ...Platform.select({
      native: {
        marginLeft: 8,
        width: '60%',
      },
      web: {
        width: '70%',
      },
    }),
  },
})

const IdentifierRow = withStyles(getStyleFromProps)(IdentifiersRow)
export default IdentifierRow
