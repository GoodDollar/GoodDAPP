// @flow
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import InputText from '../common/form/InputText'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { CategoryBox } from '../common/view/CategoryBox'

// import { theme } from '../theme/styles'

import DigitalServiceSVG from '../../assets/TxCategory/digital_service.svg'
import SocialMediaSVG from '../../assets/TxCategory/social_media.svg'
import ProductSVG from '../../assets/TxCategory/product.svg'
import CourseSVG from '../../assets/TxCategory/course.svg'
import DonationSVG from '../../assets/TxCategory/donation.svg'
import OtherSVG from '../../assets/TxCategory/other.svg'
import { navigationOptions } from './utils/sendReceiveFlow'

export type AmountProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const SendReason = (props: AmountProps) => {
  const { screenProps } = props
  const { params } = props.navigation.state

  const [screenState, setScreenState] = useScreenState(screenProps)
  const { reason, ...restState } = screenState

  const next = useCallback(() => {
    const [nextRoute, ...nextRoutes] = screenState.nextRoutes || []

    props.screenProps.push(nextRoute, {
      nextRoutes,
      ...restState,
      reason,
      params,
    })
  }, [restState, reason, screenState.nextRoutes, params])

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow>
        <Section.Stack style={styles.container}>
          <Section.Title fontWeight="medium" fontSize={24} lineHeight={24}>
            What For?
          </Section.Title>
          <Section.Text style={{ paddingTop: '3px' }} fontSize={18} lineHeight={24}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </Section.Text>
          <Section.Row style={styles.categoryRow}>
            <Section.Stack>
              <CategoryBox style={styles.categoryBox} title="Digital Services">
                <View>
                  <DigitalServiceSVG />
                </View>
                {/* <Section.Text fontSize={12} lineHeight={14}>
                  Digital Services
              </Section.Text> */}
                {/* <Section.Text fontWeight="bold" fontSize={15} lineHeight={20}>
              at {claimCycleTime}
            </Section.Text> */}
              </CategoryBox>
            </Section.Stack>
            <Section.Stack>
              <CategoryBox style={styles.categoryBox} title={'Social Media\nEngagement'}>
                <View>
                  <SocialMediaSVG />
                </View>
                {/* <Section.Text fontWeight="bold" fontSize={15} lineHeight={20}>
              at {claimCycleTime}
            </Section.Text> */}
              </CategoryBox>
            </Section.Stack>
            <Section.Stack>
              <CategoryBox style={styles.categoryBox} title="Product">
                <View>
                  <ProductSVG />
                </View>
              </CategoryBox>
            </Section.Stack>
          </Section.Row>
          <Section.Row style={styles.categoryRow}>
            <Section.Stack>
              <CategoryBox style={styles.categoryBox} title={'Course / Private\nConsultation'}>
                <View>
                  <CourseSVG />
                </View>
                {/* <Section.Text fontWeight="bold" fontSize={15} lineHeight={20}>
              at {claimCycleTime}
            </Section.Text> */}
              </CategoryBox>
            </Section.Stack>
            <Section.Stack>
              <CategoryBox style={styles.categoryBox} title="Donation">
                <View>
                  <DonationSVG />
                </View>
                {/* <Section.Text fontWeight="bold" fontSize={15} lineHeight={20}>
              at {claimCycleTime}
            </Section.Text> */}
              </CategoryBox>
            </Section.Stack>
            <Section.Stack>
              <CategoryBox style={styles.categoryBox} title="Other">
                <View>
                  <OtherSVG />
                </View>
                {/* <Section.Text fontWeight="bold" fontSize={15} lineHeight={20}>
              at {claimCycleTime}
            </Section.Text> */}
              </CategoryBox>
            </Section.Stack>
          </Section.Row>

          <InputText
            maxLength={256}
            autoFocus
            style={[props.styles.input, styles.bottomContent, styles.margin]}
            value={reason}
            onChangeText={reason => setScreenState({ reason })}
            placeholder="Add a message"
            enablesReturnKeyAutomatically
            onSubmitEditing={next}
          />
        </Section.Stack>
        <Section.Row style={styles.bottomContent}>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              values={{ ...params, ...restState, reason }}
              {...props}
              label={reason ? 'Next' : 'Skip'}
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: getDesignRelativeHeight(180),
    height: getDesignRelativeHeight(180),
    justifyContent: 'flex-start',
  },
  bottomContent: {
    marginTop: 'auto',
    position: 'relative',
  },
  margin: {
    marginTop: 40,
  },
  categoryRow: {
    justifyContent: 'space-evenly',

    // paddingLeft: '17px',
    // paddingRight: '17px',
    paddingTop: '8px',
  },
  categoryBox: {
    width: '99px',
    height: '99px',
    margin: '26px 8px 8px 10px',
    padding: '16.4px 10px 22px 11px',
    borderRadius: '5px',
    boxShadow: '1px 1px 4px 0 rgba(0, 0, 0, 0.15)',
    backgroundColor: '#ffffff',
    paddingRight: '8px',
  },
})

SendReason.navigationOptions = navigationOptions

SendReason.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.amount >= 0 && screenState.nextRoutes
}

export default withStyles(({ theme }) => ({
  input: {
    marginTop: theme.sizes.defaultDouble,
  },
}))(SendReason)
