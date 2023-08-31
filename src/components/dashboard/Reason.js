// @flow
import React, { useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { t } from '@lingui/macro'

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
  static DigitalServices = 'Digital Services'

  static SocialMedia = 'Social Media Management'

  static Product = 'Product'

  static Course = 'Course'

  static Donation = 'Donation'

  static Other = 'Other'
}

const SendReason = (props: AmountProps) => {
  const { screenProps } = props
  const { params } = props.navigation.state

  const [screenState, setScreenState] = useScreenState(screenProps)

  const { reason, ...restState } = screenState
  const { category, action, amount, nextRoutes = [] } = restState || {}

  const [paymentCategory, paymentParams] = useMemo(() => {
    const allParams = { ...params, ...restState, reason, category }

    return [category, allParams]
  }, [category, params, reason, restState])

  const next = useCallback(() => {
    const [nextRoute, ...rest] = nextRoutes

    if (!category) {
      return
    }

    props.screenProps.push(nextRoute, {
      nextRoutes: rest,
      ...paymentParams,
    })
  }, [paymentParams, nextRoutes, category])

  const handleCategoryBoxOnPress = useCallback(
    category => {
      // set category and enable next button
      setScreenState({ category })
    },
    [setScreenState],
  )

  // fire event
  useEffect(() => {
    const category = paymentCategory

    if (!category) {
      return
    }

    fireEvent(PAYMENT_CATEGORY_SELECTED, { action, amount, category })
  }, [paymentCategory, action, amount])

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
            fontFamily={theme.fonts.slab}
            textTransform="capitalize"
          >
            {t`What Is The
            Transaction For?`}
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
                  title={PaymentCategory.DigitalServices}
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
                  title={PaymentCategory.Product}
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
                  title={PaymentCategory.Donation}
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
                  title={PaymentCategory.Other}
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
          <Section.Stack grow={3} style={styles.nextButtonContainer}>
            <NextButton
              disabled={!paymentCategory}
              nextRoutes={nextRoutes}
              values={paymentParams}
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
    marginBottom: theme.paddings.bottomPadding,
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
  nextButtonContainer: {
    minWidth: getDesignRelativeWidth(244),
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
