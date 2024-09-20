import React, { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { capitalize, get } from 'lodash'
import { theme } from '../../theme/styles'
import { Text } from '../../common'
import useProfile from '../../../lib/userStorage/useProfile'
import { useWallet } from '../../../lib/wallet/GoodWalletProvider'
import { getEventDirection } from '../../../lib/userStorage/FeedStorage'
import goToExplorer from '../utils/goToExplorer'

const EventContent = ({
  style,
  textStyle,
  direction,
  endpointAddress,
  chain,
  description,
  hasSubtitle,
  numberOfLines = 1,
  lineHeight = 17,
  isCapitalized = true,
  isModal = false,
}) => {
  let [name = '', displayAddress = ''] = description?.split(' ') ?? []

  const viewInExplorer = useCallback(() => {
    const isUBIPool = name.includes('RedTent')
    goToExplorer(endpointAddress, chain, 'address', isUBIPool)
  }, [endpointAddress])

  return (
    <View style={{ flexDirection: 'column' }}>
      <View
        numberOfLines={1}
        style={[
          {
            flexDirection: 'row',
          },
          style,
        ]}
      >
        {!!direction && (
          <Text
            style={{
              minWidth: 15,
            }}
            textTransform={isCapitalized && 'capitalize'}
            fontSize={10}
          >
            {capitalize(direction)}:{' '}
          </Text>
        )}
        <Text
          numberOfLines={numberOfLines}
          textTransform={isCapitalized && 'capitalize'}
          fontWeight="medium"
          textAlign={'left'}
          lineHeight={lineHeight}
          style={[textStyle, ...(isModal ? [{ fontSize: 16 }] : [])]}
        >
          {isModal ? name : description}
        </Text>
      </View>

      {isModal && displayAddress.startsWith('(0x') && (
        <Text
          numberOfLines={numberOfLines}
          textTransform={isCapitalized && 'capitalize'}
          fontWeight="medium"
          textAlign={'left'}
          lineHeight={lineHeight}
          style={[textStyle, { fontSize: 16 }]}
          onPress={viewInExplorer}
          textDecorationLine="underline"
          color={theme.colors.lightBlue}
        >
          {displayAddress}
        </Text>
      )}
    </View>
  )
}

export const EventSelfParty = ({ feedItem, styles, style, textStyle, subtitle, isSmallDevice }) => {
  const direction = useMemo(() => getEventDirection(feedItem, true), [feedItem])
  const { fullName } = useProfile()

  const hasSubtitle = get(feedItem, 'data.readMore') !== false
  const senderName = get(feedItem, 'data.senderName', fullName)

  return <EventContent description={senderName} hasSubtitle={hasSubtitle} direction={direction} />
}

const EventCounterParty = ({
  feedItem,
  styles,
  style,
  textStyle,
  subtitle,
  isSmallDevice,
  numberOfLines,
  isCapitalized,
  lineHeight,
  isModal,
}) => {
  const goodWallet = useWallet()
  const direction = useMemo(() => getEventDirection(feedItem), [feedItem])
  const itemSubtitle = get(feedItem, 'data.subtitle', '')
  const chain = feedItem?.chainId ?? 42220
  const selectDisplaySource =
    get(feedItem, 'data.endpoint.displayName') === 'Unknown'
      ? get(feedItem, 'data.sellerWebsite', 'Unknown')
      : get(feedItem, 'data.endpoint.displayName')

  let displayText = itemSubtitle && subtitle ? itemSubtitle : selectDisplaySource

  const ubiDisplayRegex = /GoodDollar \(0x..\.{3}....\)/
  const endpointAddress = displayText.match(ubiDisplayRegex)
    ? goodWallet.UBIContract._address
    : get(feedItem, 'data.endpoint.address')

  let hasSubtitle = get(feedItem, 'data.readMore') !== false

  return (
    <EventContent
      style={style}
      description={displayText}
      endpointAddress={endpointAddress}
      chain={chain}
      hasSubtitle={hasSubtitle}
      direction={direction}
      numberOfLines={numberOfLines}
      isCapitalized={isCapitalized}
      lineHeight={lineHeight}
      textStyle={textStyle}
      isModal={isModal}
    />
  )
}

export default EventCounterParty
