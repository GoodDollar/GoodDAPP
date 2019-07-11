// @flow
import React from 'react'
import { View } from 'react-native'
import { withTheme } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Section } from '../../common/'
import { withStyles } from '../../../lib/styles'

const EmptyBlock = ({ width, height, borderRadius, style, theme }) => {
  const customStyle = {
    height: normalize(height),
    width: normalize(width),
    borderRadius,
    backgroundColor: theme.colors.lightGray
  }
  return <View style={[customStyle, style]} />
}

EmptyBlock.defaultProps = {
  width: normalize(74),
  height: normalize(10)
}

const EmptyBlockThemed = withTheme(EmptyBlock)

/**
 * Render list item according to the type for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const FeedListItem = ({ styles }) => (
  <Section.Row style={styles.innerRow}>
    <Section.Stack alignItems="flex-start" style={styles.avatatBottom}>
      <EmptyBlockThemed width={34} height={34} borderRadius="50%" />
    </Section.Stack>
    <Section.Stack grow={1} style={styles.mainSection}>
      <Section.Row style={styles.emptyBlockBorderRow}>
        <Section.Stack alignItems="flex-start">
          <EmptyBlockThemed width={74} height={10} />
        </Section.Stack>
      </Section.Row>
      <Section.Row>
        <Section.Stack alignItems="flex-start" grow={1}>
          <Section.Row>
            <EmptyBlockThemed width={120} height={18} />
          </Section.Row>
          <Section.Row>
            <EmptyBlockThemed width={74} height={10} style={styles.emptyBlockMargin} />
          </Section.Row>
        </Section.Stack>
        <Section.Stack alignItems="flex-end">
          <EmptyBlockThemed width={34} height={34} borderRadius="50%" />
        </Section.Stack>
      </Section.Row>
    </Section.Stack>
  </Section.Row>
)

const getStylesFromProps = ({ theme }) => ({
  innerRow: {
    padding: normalize(4),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  avatatBottom: {
    alignSelf: 'flex-end'
  },
  mainSection: {
    marginLeft: normalize(4)
  },
  emptyBlockBorderRow: {
    borderBottomColor: theme.colors.lightGray,
    borderBottomStyle: 'solid',
    borderBottomWidth: normalize(2),
    paddingBottom: normalize(4),
    marginBottom: normalize(4)
  },
  emptyBlockMargin: {
    marginTop: normalize(4)
  }
})

export default withStyles(getStylesFromProps)(FeedListItem)
