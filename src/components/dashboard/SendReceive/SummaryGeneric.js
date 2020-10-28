import React, { useMemo, useState } from 'react'
import { Platform, View } from 'react-native'
import { BackButton } from '../../appNavigation/stackNavigation'
import { BigGoodDollar, CustomButton, Icon, Section, Wrapper } from '../../common'
import TopBar from '../../common/view/TopBar'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { isMobile } from '../../../lib/utils/platform'
import normalize from '../../../lib/utils/normalizeText'
import SurveySend from '../SurveySend'

const SummaryGeneric = ({
  screenProps,
  styles,
  onConfirm,
  address,
  recipient,
  amount,
  reason,
  iconName,
  title,
  action,
}) => {
  const { push } = screenProps
  const [, setSurvey] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const iconWrapperMargin = useMemo(() => {
    return isMobile ? styles.marginForNoCredsMobile : styles.marginForNoCreds
  }, [styles])
  const isSend = action === 'send'
  const _onPress = async e => {
    setLoading(true)
    try {
      await onConfirm(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Wrapper>
      <TopBar push={push} />
      <Section grow style={styles.section}>
        <Section.Stack>
          <Section.Row justifyContent="center">
            <View style={[styles.sendIconWrapper, iconWrapperMargin, isSend ? styles.redIcon : styles.greenIcon]}>
              <Icon name={iconName} size={getDesignRelativeHeight(45)} color="white" />
            </View>
          </Section.Row>
          <Section.Title fontWeight="medium">{title}</Section.Title>
          <Section.Row justifyContent="center" fontWeight="medium" style={styles.amountWrapper}>
            <BigGoodDollar
              number={amount}
              color={isSend ? 'red' : 'green'}
              bigNumberProps={{
                fontSize: 36,
                lineHeight: 36,
                fontFamily: 'Roboto Slab',
                fontWeight: 'bold',
              }}
              bigNumberUnitProps={{ fontSize: 14 }}
            />
          </Section.Row>
        </Section.Stack>
        <Section.Stack>
          {(address || recipient) && (
            <Section.Row style={[styles.credsWrapper, reason ? styles.toTextWrapper : undefined]}>
              <Section.Text color="gray80Percent" fontSize={14} style={styles.credsLabel}>
                To
              </Section.Text>
              {address && !recipient ? (
                <Section.Text fontFamily="Roboto Slab" fontSize={13} lineHeight={21} style={styles.toText}>
                  {address}
                </Section.Text>
              ) : (
                recipient && (
                  <Section.Text fontSize={24} fontWeight="medium" lineHeight={28} style={styles.toText}>
                    {recipient}
                  </Section.Text>
                )
              )}
            </Section.Row>
          )}
          {!!reason && (
            <Section.Row style={[styles.credsWrapper, styles.reasonWrapper]}>
              <Section.Text color="gray80Percent" fontSize={14} style={styles.credsLabel}>
                For
              </Section.Text>
              <Section.Text fontSize={normalize(14)} numberOfLines={2} ellipsizeMode="tail">
                {reason}
              </Section.Text>
            </Section.Row>
          )}
        </Section.Stack>
        {isSend && (
          <Section.Row justifyContent="center" style={styles.warnText}>
            <Section.Text color="gray80Percent">{'* the transaction may take\na few seconds to complete'}</Section.Text>
          </Section.Row>
        )}
        <Section.Row>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <CustomButton onPress={_onPress} loading={loading}>
              {address ? 'Confirm' : 'Confirm & Share'}
            </CustomButton>
          </Section.Stack>
        </Section.Row>
      </Section>
      <SurveySend handleCheckSurvey={setSurvey} />
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  section: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  sendIconWrapper: {
    height: getDesignRelativeHeight(75),
    width: getDesignRelativeHeight(75),
    position: 'relative',
    borderRadius: Platform.select({
      web: '50%',
      default: getDesignRelativeHeight(75) / 2,
    }),
    marginTop: getDesignRelativeHeight(15),
    marginBottom: getDesignRelativeHeight(24),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  redIcon: {
    backgroundColor: theme.colors.red,
  },
  greenIcon: {
    backgroundColor: theme.colors.green,
  },
  amountWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: getDesignRelativeHeight(10),
    marginBottom: getDesignRelativeHeight(27),
  },
  credsWrapper: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.gray50Percent,
    borderRadius: 25,
    minHeight: 42,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: getDesignRelativeHeight(4),
    paddingTop: getDesignRelativeHeight(8),
    paddingLeft: getDesignRelativeWidth(16),
    paddingRight: getDesignRelativeWidth(16),
    position: 'relative',
  },
  credsLabel: {
    position: 'absolute',
    top: -getDesignRelativeHeight(10),
    backgroundColor: theme.colors.white,
    paddingHorizontal: getDesignRelativeHeight(10),
    lineHeight: normalize(14),
  },
  toTextWrapper: {
    marginBottom: 24,
  },
  toText: {
    margin: 0,
    width: '100%',
  },
  reasonWrapper: {
    alignItems: 'center',
    paddingBottom: 0,
  },
  warnText: {
    marginVertical: getDesignRelativeHeight(24),
  },
  marginForNoCredsMobile: {
    marginBottom: getDesignRelativeHeight(60),
  },
  marginForNoCreds: {
    marginBottom: getDesignRelativeHeight(100),
  },
})

export default withStyles(getStylesFromProps)(SummaryGeneric)
