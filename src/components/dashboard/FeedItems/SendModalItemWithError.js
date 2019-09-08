// @flow
import React from 'react'
import { View } from 'react-native'
import Icon from '../../common/view/Icon'
import Text from '../../common/view/Text'
import SummaryTable from '../../common/view/SummaryTable'
import ModalActionsByFeedType from '../../common/modal/ModalActionsByFeedType'
import { withStyles } from '../../../lib/styles'
import type { FeedEventProps } from './EventProps'

/**
 * Render modal item according to the type for feed list in horizontal view
 * @param {FeedEventProps} props - feed event
 * @returns {HTMLElement}
 */
const FeedModalItem = ({ item, onPress, styles, theme }: FeedEventProps) => {
  const buttonPress = () => {
    onPress(item.id)
  }

  return (
    <React.Fragment>
      <View style={styles.errorStyle}>
        <Text color="red" fontSize={22} fontWeight="medium">
          {`We're sorry.\nThis transaction failed.`}
        </Text>
        <Text color="red" fontSize={16}>
          {`Something went wrong on our side,\nplease try again.`}
        </Text>
        <View style={styles.iconContainer}>
          <Icon name="close" color="red" size={24} />
        </View>
      </View>
      <SummaryTable
        counterPartyDisplayName={item.data.endpoint.fullName}
        amount={item.data.amount}
        reason={item.data.message}
        compact={true}
      />
      <ModalActionsByFeedType item={item} handleModalClose={buttonPress} />
    </React.Fragment>
  )
}

const getStylesFromProps = ({ theme }) => ({
  errorStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: '50%',
    borderColor: theme.colors.red,
    borderWidth: 3,
    padding: theme.sizes.defaultQuadruple,
    marginTop: theme.sizes.defaultDouble,
  },
})

export default withStyles(getStylesFromProps)(FeedModalItem)
