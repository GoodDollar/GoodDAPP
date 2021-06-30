// @flow
import React, { useCallback } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import InputText from '../common/form/InputText'
import { Section, Wrapper } from '../common'

import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { CategoryBox } from '../common/view/CategoryBox'

// assets
import DigitalServiceSVG from '../../assets/TxCategory/digital_service.svg'
import SocialMediaSVG from '../../assets/TxCategory/social_media.svg'
import ProductSVG from '../../assets/TxCategory/product.svg'
import CourseSVG from '../../assets/TxCategory/course.svg'
import DonationSVG from '../../assets/TxCategory/donation.svg'
import OtherSVG from '../../assets/TxCategory/other.svg'

import { theme } from '../theme/styles'

import { fireEvent, PAYMENT_CATEGORY_SELECTED } from '../../lib/analytics/analytics'
import { navigationOptions } from './utils/sendReceiveFlow'

export type AmountProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

class PaymentCategory {
  static DigitalServices = 1

  static SocialMedia = 2

  static Product = 3

  static Course = 4

  static Donation = 5

  static Other = 6

  static labelOf(category) {
    const { DigitalServices, SocialMedia, Product, Course, Donation, Other } = this

    switch (category) {
      case DigitalServices:
        return 'Digital Services'
      case SocialMedia:
        return 'Social Media Management'
      case Product:
        return 'Product'
      case Course:
        return 'Course / Private Consultation'
      case Donation:
        return 'Donation'
      case Other:
        return 'Other'
      default:
        return ''
    }
  }
}

const SendReason = (props: AmountProps) => {
  const { screenProps } = props
  const { params } = props.navigation.state

  const [screenState, setScreenState] = useScreenState(screenProps)

  const { reason, isDisabledNextButton, ...restState } = screenState

  const next = useCallback(() => {
    const [nextRoute, ...nextRoutes] = screenState.nextRoutes || []

    if (isDisabledNextButton !== false) {
      return
    }

    screenState.category &&
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
    fireEvent(PAYMENT_CATEGORY_SELECTED, {
      action: screenState.action,
      amount: screenState.amount,
      category: PaymentCategory.labelOf(category),
    })
  }

  return (
    <Wrapper>
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
            {'What Is The\nTransaction For?'}
          </Section.Title>
          <Section.Row style={[styles.categoryRow, { paddingTop: 19 }]}>
            <Section.Stack>
              <TouchableOpacity
                style={styles.outerBoxMargin}
                onPress={() => {
                  handleCategoryBoxOnPress(PaymentCategory.DigitalServices)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PaymentCategory.DigitalServices ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={PaymentCategory.labelOf(PaymentCategory.DigitalServices)}
                >
                  <View>
                    <DigitalServiceSVG />
                  </View>
                </CategoryBox>
              </TouchableOpacity>
            </Section.Stack>
            <Section.Stack>
              <TouchableOpacity
                style={styles.outerBoxMargin}
                onPress={() => {
                  handleCategoryBoxOnPress(PaymentCategory.SocialMedia)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PaymentCategory.SocialMedia ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={'Social Media\nEngagement'}
                >
                  <View>
                    <SocialMediaSVG />
                  </View>
                </CategoryBox>
              </TouchableOpacity>
            </Section.Stack>
            <Section.Stack>
              <TouchableOpacity
                style={styles.outerBoxMargin}
                onPress={() => {
                  handleCategoryBoxOnPress(PaymentCategory.Product)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PaymentCategory.Product ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={PaymentCategory.labelOf(PaymentCategory.Product)}
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
                style={styles.outerBoxMargin}
                onPress={() => {
                  handleCategoryBoxOnPress(PaymentCategory.Course)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PaymentCategory.Course ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={'Course / Private\nConsultation'}
                >
                  <View>
                    <CourseSVG />
                  </View>
                </CategoryBox>
              </TouchableOpacity>
            </Section.Stack>
            <Section.Stack>
              <TouchableOpacity
                style={styles.outerBoxMargin}
                onPress={() => {
                  handleCategoryBoxOnPress(PaymentCategory.Donation)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PaymentCategory.Donation ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={PaymentCategory.labelOf(PaymentCategory.Donation)}
                >
                  <View>
                    <DonationSVG />
                  </View>
                </CategoryBox>
              </TouchableOpacity>
            </Section.Stack>
            <Section.Stack>
              <TouchableOpacity
                style={styles.outerBoxMargin}
                onPress={() => {
                  handleCategoryBoxOnPress(PaymentCategory.Other)
                }}
              >
                <CategoryBox
                  style={[
                    styles.categoryBox,
                    styles.border,
                    screenState.category === PaymentCategory.Other ? { borderWidth: 2 } : { borderWidth: 0 },
                  ]}
                  title={PaymentCategory.labelOf(PaymentCategory.Other)}
                >
                  <View>
                    <OtherSVG />
                  </View>
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
              values={{ ...params, ...restState, reason, category: PaymentCategory.labelOf(screenState.category) }}
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
    paddingTop: 37,
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
    minWidth: getDesignRelativeWidth(99),
    maxWidth: getDesignRelativeWidth(99),
    maxHeight: getDesignRelativeHeight(99),
    minHeight: getDesignRelativeHeight(99),
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  border: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'solid',
  },
  outerBoxMargin: {
    marginHorizontal: 4,
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
