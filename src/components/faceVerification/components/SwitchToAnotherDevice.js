import React from 'react'
import { View } from 'react-native'

import Text from '../../common/view/Text'
import Separator from '../../common/layout/Separator'
import { CustomButton, Section, Wrapper } from '../../common'

import { getDesignRelativeHeight, getDesignRelativeWidth, isLargeDevice } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'
import SwitchToAnotherDeviceSVG from '../../../assets/FRSwitchToAnotherDevice.svg'

const SwitchToAnotherDevice = ({ styles, displayTitle, exception, nav }) => (
  <Wrapper>
    <View style={styles.topContainer}>
      <Section style={styles.descriptionContainer} justifyContent="space-between">
        <Section.Title fontWeight="medium" textTransform="none" color="red">
          {displayTitle && displayTitle}
          {(displayTitle ? `,\n` : '') + 'Please try to switch\nto another device'}
        </Section.Title>
        <View style={[styles.errorImage, isLargeDevice ? styles.largeSizing : {}]}>
          <SwitchToAnotherDeviceSVG height="100%" width="100%" viewBox="0 0 280 124" />
        </View>
        <Section style={[styles.errorSection, isLargeDevice ? styles.largeSizing : {}]}>
          <Separator width={2} />
          <View style={styles.descriptionWrapper}>
            <Text style={styles.description}>{'Sometimes, switching to a\ndifferent device is a good solution.'}</Text>
            <Text style={styles.description} fontWeight="bold">
              {'Sorry about that… :)'}
            </Text>
          </View>
          <Separator width={2} />
        </Section>
      </Section>
      <View style={styles.action}>
        <CustomButton onPress={nav.goToRoot} testID="ok_button">
          OK
        </CustomButton>
      </View>
    </View>
  </Wrapper>
)

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    alignItems: 'center',
    display: 'flex',
    backgroundColor: theme.colors.surface,
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
    borderRadius: theme.sizes.borderRadius,
  },
  errorImage: {
    height: getDesignRelativeHeight(146, false),
    width: '100%',
  },
  descriptionContainer: {
    flex: 1,
    marginBottom: 0,
    paddingBottom: getDesignRelativeHeight(44, isLargeDevice),
    paddingTop: isLargeDevice ? getDesignRelativeHeight(22) : 0,
    paddingHorizontal: getDesignRelativeWidth(theme.sizes.defaultQuadruple),
    width: '100%',
    alignItems: 'center',
  },
  action: {
    width: '100%',
    paddingHorizontal: getDesignRelativeWidth(theme.sizes.default),
  },
  errorSection: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 0,
    width: '100%',
  },
  description: {
    color: theme.colors.primary,
    fontSize: isLargeDevice ? 20 : 18,
    lineHeight: isLargeDevice ? 30 : 25,
  },
  descriptionWrapper: {
    paddingVertical: getDesignRelativeHeight(isLargeDevice ? theme.sizes.defaultDouble : theme.sizes.default),
  },
  largeSizing: {
    flexGrow: 1,
    justifyContent: 'center',
  },
})

export default withStyles(getStylesFromProps)(SwitchToAnotherDevice)
