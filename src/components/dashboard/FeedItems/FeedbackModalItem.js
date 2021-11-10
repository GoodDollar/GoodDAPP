// @flow
import React, { useCallback } from 'react'
import { Platform, View } from 'react-native'
import { get, noop } from 'lodash'
import CustomButton from '../../common/buttons/CustomButton'
import Text from '../../common/view/Text'
import { withStyles } from '../../../lib/styles'
import type { FeedEventProps } from './EventProps'

const numberColors = [
  '#E73838',
  '#F4474A',
  '#FC664A',
  '#FD8744',
  '#FEA73F',
  '#FFC21F',
  '#E2C517',
  '#C0CA0E',
  '#9ECC06',
  '#7CCB00',
  '#31AB00',
]

const CircleNumber = ({ value, onPress = noop, styles, theme }) => {
  const _onPress = useCallback(onPress)
  return (
    <View style={styles.numberColumn}>
      <CustomButton
        style={[styles.numberButton, { borderColor: numberColors[value] }]}
        onPress={_onPress}
        mode="outlined"
        color={theme.colors.darkGray}
      >
        {value}
      </CustomButton>
    </View>
  )
}

/**
 * Render modal item according to the type for feed list in horizontal view
 * @param {FeedEventProps} props - feed event
 * @returns {HTMLElement}
 */
const FeedModalItem = (props: FeedEventProps) => {
  const { item, onPress, styles, theme } = props
  const buttonPress = useCallback(() => {
    onPress(item.id)
  }, [item.id, onPress])

  return (
    <React.Fragment>
      <View style={styles.dateAndAmount}>
        <Text fontWeight="medium" fontSize={22}>
          {get(item, 'data.message')}
        </Text>
      </View>
      <View style={[styles.numbersContainer, { borderColor: theme.colors.primary }]}>
        <View style={styles.numbersRow}>
          {Array.from({ length: 6 }, (elem, index) => (
            <CircleNumber key={index} value={index} styles={styles} theme={theme} />
          ))}
        </View>
        <View style={styles.bottomNumbersRow}>
          {Array.from({ length: 5 }, (elem, index) => (
            <CircleNumber key={index + 6} value={index + 6} styles={styles} theme={theme} />
          ))}
        </View>
        <View style={styles.numbersDescriptionRow}>
          <Text fontWeight="medium" fontSize={14} style={{ marginRight: 'auto' }}>
            0 - NO WAY!
          </Text>
          <Text fontWeight="medium" fontSize={14} style={{ marginLeft: 'auto' }}>
            10 - FOR SURE!
          </Text>
        </View>
      </View>
      <View style={styles.buttonsRow}>
        <CustomButton mode="text" style={styles.button} onPress={buttonPress} color={theme.colors.gray80Percent}>
          LATER
        </CustomButton>
      </View>
    </React.Fragment>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    numberButton: {
      borderRadius: Platform.select({
        web: '50%',
        default: 32 / 2,
      }),
      borderWidth: 2,
      width: 32,
      height: 32,
      minHeight: 32,
    },
    dateAndAmount: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    numbersContainer: {
      alignItems: 'center',
      borderBottomWidth: 2,
      borderTopWidth: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      marginBottom: 18,
      paddingBottom: theme.sizes.defaultQuadruple,
      paddingTop: theme.sizes.defaultQuadruple,
    },
    numbersRow: {
      display: 'flex',
      flexDirection: 'row',
      flexGrow: 1,
      width: '100%',
      justifyContent: 'space-around',
    },
    bottomNumbersRow: {
      display: 'flex',
      flexDirection: 'row',
      flexGrow: 1,
      width: '100%',
      justifyContent: 'space-around',
      paddingTop: theme.sizes.default,
      paddingBottom: theme.sizes.defaultDouble,
      paddingLeft: theme.sizes.defaultQuadruple,
      paddingRight: theme.sizes.defaultQuadruple,
    },
    numbersDescriptionRow: {
      display: 'flex',
      flexDirection: 'row',
      flexGrow: 1,
      width: '100%',
      justifyContent: 'space-between',
      paddingLeft: theme.sizes.defaultDouble,
      paddingRight: theme.sizes.defaultDouble,
    },
    numberColumn: {
      display: 'flex',
      flexDirection: 'column',
    },
    buttonsRow: {
      alignItems: 'flex-end',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.sizes.defaultDouble,
    },
    button: {
      minWidth: 80,
    },
  }
}

export default withStyles(getStylesFromProps)(FeedModalItem)
