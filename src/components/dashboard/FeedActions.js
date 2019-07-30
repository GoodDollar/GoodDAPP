// @flow
import React from 'react'
import { Alert, TouchableHighlight, View } from 'react-native-web'
import { withStyles } from '../../lib/styles'
import { Icon, Section, Text } from '../common'
import type { FeedEventProps } from './FeedItems/EventProps'

/**
 * Returns swipeable actions for items inside Feed list
 *
 * @param {FeedEventProps} feedItem - Contains the feed item
 * @returns React element with actions
 */
const FeedActions = ({ item, styles, theme }: FeedEventProps) => (
  <Section.Row
    style={[
      styles.actionsContainer,
      {
        backgroundColor: item && item.type !== 'empty' ? theme.colors.red : theme.colors.surface,
        marginTop: theme.sizes.default,
      },
    ]}
    alignItems="center"
    justifyContent="flex-end"
    grow
  >
    {item && item.type !== 'empty' && (
      <TouchableHighlight
        onPress={() => {
          Alert.alert('Tips', 'You could do something with this remove action!')
        }}
      >
        <View>
          <Section.Row justifyContent="center">
            <Icon name="close" color={theme.colors.surface} />
          </Section.Row>
          <Section.Row justifyContent="center">
            <Text color="surface">Delete</Text>
          </Section.Row>
        </View>
      </TouchableHighlight>
    )}
  </Section.Row>
)

const getStylesFromProps = ({ theme }) => ({
  actionsContainer: {
    borderRadius: 8,
    height: 84,
    maxHeight: 84,
    padding: theme.sizes.default,
    marginHorizontal: theme.sizes.default,
  },
})

export default withStyles(getStylesFromProps)(FeedActions)
