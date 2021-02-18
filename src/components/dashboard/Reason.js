// @flow
import React, { useCallback } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import InputText from '../common/form/InputText'
import { Section, Wrapper } from '../common'

// import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { CategoryBox } from '../common/view/CategoryBox'

// import { theme } from '../theme/styles'

import DigitalServiceSVG from '../../assets/TxCategory/digital_service.svg'
import SocialMediaSVG from '../../assets/TxCategory/social_media.svg'
import ProductSVG from '../../assets/TxCategory/product.svg'
import CourseSVG from '../../assets/TxCategory/course.svg'
import DonationSVG from '../../assets/TxCategory/donation.svg'
import OtherSVG from '../../assets/TxCategory/other.svg'
import { theme } from '../theme/styles'

// import { fireEvent, PAYMENT_CATEGORY_SELECTED } from '../../lib/analytics/analytics'
import { navigationOptions } from './utils/sendReceiveFlow'

export type AmountProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const PAYMENT_CATEGORY_1 = 'Digital Services'
const PAYMENT_CATEGORY_2 = 'Social Media Management'
const PAYMENT_CATEGORY_3 = 'Product'
const PAYMENT_CATEGORY_4 = 'Course / Private Consultation'
const PAYMENT_CATEGORY_5 = 'Donation'
const PAYMENT_CATEGORY_6 = 'Other'

const SendReason = (props: AmountProps) => {
  const { screenProps } = props
  const { params } = props.navigation.state

  const [screenState, setScreenState] = useScreenState(screenProps)

  const { reason, isDisabledNextButton, ...restState } = screenState

  const next = useCallback(() => {
    const [nextRoute, ...nextRoutes] = screenState.nextRoutes || []

    props.screenProps.push(nextRoute, {
      nextRoutes,
      ...restState,
      reason,
      params,
    })
  }, [restState, reason, screenState.nextRoutes, params])

  const handleCategoryBoxOnPress = category => {
    // set category and enable next button
    setScreenState({ category, isDisabledNextButton: false })

    // fire event
    // fireEvent(PAYMENT_CATEGORY_SELECTED, {
    //   action: screenState.action,
    //   amount: screenState.amount,
    //   category: screenState.category,
    //   reason: screenState.reason,
    // })
  }

  return (
    <Wrapper>
      {/* <TopBar push={screenProps.push} /> */}
      <Section style={styles.wrapper} grow>
        <Section.Stack style={styles.container}>
          <Section.Title
            fontWeight="bold"
            fontSize={28}
            lineHeight={32}
            letterSpacing={0.14}
            color={theme.colors.darkBlue}
            fontFamily="Roboto Slab"
            textTransform="capitalize"
          >
            {'What Are You\nPaying For?'}
          </Section.Title>
          <Section.Row style={[styles.categoryRow, { paddingTop: 19 }]}>
            <Section.Stack>
              <TouchableOpacity
                onPress={() => {
                  handleCategoryBoxOnPress(PAYMENT_CATEGORY_1)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PAYMENT_CATEGORY_1 ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={PAYMENT_CATEGORY_1}
                >
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
              </TouchableOpacity>
            </Section.Stack>
            <Section.Stack>
              <TouchableOpacity
                onPress={() => {
                  handleCategoryBoxOnPress(PAYMENT_CATEGORY_2)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PAYMENT_CATEGORY_2 ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={'Social Media\nEngagement'}
                >
                  <View>
                    <SocialMediaSVG />
                  </View>
                  {/* <Section.Text fontWeight="bold" fontSize={15} lineHeight={20}>
              at {claimCycleTime}
            </Section.Text> */}
                </CategoryBox>
              </TouchableOpacity>
            </Section.Stack>
            <Section.Stack>
              <TouchableOpacity
                onPress={() => {
                  handleCategoryBoxOnPress(PAYMENT_CATEGORY_3)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PAYMENT_CATEGORY_3 ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={PAYMENT_CATEGORY_3}
                >
                  <View>
                    <ProductSVG />
                  </View>
                </CategoryBox>
              </TouchableOpacity>
            </Section.Stack>
          </Section.Row>
          <Section.Row style={[styles.categoryRow, { paddingTop: theme.sizes.default }]}>
            <Section.Stack>
              <TouchableOpacity
                onPress={() => {
                  handleCategoryBoxOnPress(PAYMENT_CATEGORY_4)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PAYMENT_CATEGORY_4 ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={'Course / Private\nConsultation'}
                >
                  <View>
                    <CourseSVG />
                  </View>
                  {/* <Section.Text fontWeight="bold" fontSize={15} lineHeight={20}>
              at {claimCycleTime}
            </Section.Text> */}
                </CategoryBox>
              </TouchableOpacity>
            </Section.Stack>
            <Section.Stack>
              <TouchableOpacity
                onPress={() => {
                  handleCategoryBoxOnPress(PAYMENT_CATEGORY_5)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PAYMENT_CATEGORY_5 ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={PAYMENT_CATEGORY_5}
                >
                  <View>
                    <DonationSVG />
                  </View>
                  {/* <Section.Text fontWeight="bold" fontSize={15} lineHeight={20}>
              at {claimCycleTime}
            </Section.Text> */}
                </CategoryBox>
              </TouchableOpacity>
            </Section.Stack>
            <Section.Stack>
              <TouchableOpacity
                onPress={() => {
                  handleCategoryBoxOnPress(PAYMENT_CATEGORY_6)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PAYMENT_CATEGORY_6 ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={PAYMENT_CATEGORY_6}
                >
                  <View>
                    <OtherSVG />
                  </View>
                  {/* <Section.Text fontWeight="bold" fontSize={15} lineHeight={20}>
              at {claimCycleTime}
            </Section.Text> */}
                </CategoryBox>
              </TouchableOpacity>
            </Section.Stack>
          </Section.Row>

          <InputText
            maxLength={256}
            autoFocus
            style={styles.margin}
            value={reason}
            onChangeText={reason => setScreenState({ reason })}
            placeholder="Add a message"
            placeholderTextColor={theme.colors.darkGray}
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
          <Section.Stack style={{ minWidth: getDesignRelativeWidth(244) }}>
            <NextButton
              disabled={isDisabledNextButton !== false}
              nextRoutes={screenState.nextRoutes}
              values={{ ...params, ...restState }}
              {...props}
              label="Next"
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: theme.sizes.default * 3.5,
    paddingBottom: theme.sizes.default * 3,
  },
  container: {
    justifyContent: 'flex-start',
  },
  bottomContent: {
    marginTop: 'auto',
  },
  margin: {
    marginTop: 43,
  },
  categoryRow: {
    justifyContent: 'center',
  },
  categoryBox: {
    width: getDesignRelativeWidth(99),
    height: getDesignRelativeHeight(99),
    marginLeft: 4,
    marginRight: 4,
    borderRadius: 5,
    boxShadow: '1px 1px 4px 0 rgba(0, 0, 0, 0.15)',
    backgroundColor: '#ffffff',
  },
  border: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'solid',
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
