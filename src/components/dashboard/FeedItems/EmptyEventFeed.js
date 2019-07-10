// @flow
import React from 'react'
import { View } from 'react-native'
import { withTheme } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Section } from '../../common/'
import { listStyles } from './EventStyles'

const EmptyBlock = ({ width, height, borderRadius, style }) => {
  const customStyle = {
    height: normalize(height),
    width: normalize(width),
    borderRadius
  }
  return <View style={[listStyles.emptyBlock, customStyle, style]} />
}

EmptyBlock.defaultProps = {
  width: normalize(74),
  height: normalize(10)
}

/**
 * Render list item according to the type for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const FeedListItem = props => (
  <Section.Row style={listStyles.innerRow}>
    <Section.Stack alignItems="flex-start" style={listStyles.avatatBottom}>
      <EmptyBlock width={34} height={34} borderRadius="50%" />
    </Section.Stack>
    <Section.Stack grow={1} style={listStyles.mainSection}>
      <Section.Row style={listStyles.emptyBlockBorderRow}>
        <Section.Stack alignItems="flex-start">
          <EmptyBlock width={74} height={10} />
        </Section.Stack>
      </Section.Row>
      <Section.Row>
        <Section.Stack alignItems="flex-start" grow={1}>
          <Section.Row>
            <EmptyBlock width={120} height={18} />
          </Section.Row>
          <Section.Row>
            <EmptyBlock width={74} height={10} style={{ marginTop: normalize(4) }} />
          </Section.Row>
        </Section.Stack>
        <Section.Stack alignItems="flex-end">
          <EmptyBlock width={34} height={34} borderRadius="50%" />
        </Section.Stack>
      </Section.Row>
    </Section.Stack>
  </Section.Row>
)

export default withTheme(FeedListItem)
