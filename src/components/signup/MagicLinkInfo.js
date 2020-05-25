// @flow
import React from 'react'
import { View } from 'react-native'
import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import { withStyles } from '../../lib/styles'
import MagicLinkSVG from '../../assets/Signup/maginLinkIllustration.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import CustomWrapper from './signUpWrapper'

const MagicLinkInfoComponent = props => {
  const { styles, screenProps = {} } = props
  const { doneCallback } = screenProps

  return (
    <CustomWrapper valid={true} handleSubmit={doneCallback} submitText="Cool, got it!">
      <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
        <View style={styles.headerContainer}>
          <Text
            fontWeight="bold"
            fontSize={28}
            fontFamily="Roboto Slab"
            color="primary"
            style={styles.headerText}
            lineHeight={28}
          >
            {'GOOD TO KNOW'}
          </Text>
        </View>
      </Section.Row>
      <View style={styles.illustration}>
        <MagicLinkSVG />
      </View>
      <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
        <View style={styles.bottomContainer}>
          <Text fontWeight="medium" fontSize={22} fontFamily="Roboto">
            <Text fontWeight="bold" fontSize={22} fontFamily="Roboto">
              {'Next time '}
            </Text>
            {'you can sign in '}
          </Text>
          <Text fontWeight="medium" fontSize={22} fontFamily="Roboto">
            {`from any device `}
          </Text>
          <Text fontWeight="medium" fontSize={22} fontFamily="Roboto">
            {`using your `}
            <Text fontWeight="bold" fontSize={22}>{`Magic Link`}</Text>
          </Text>
        </View>
      </Section.Row>
      <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
        <View style={styles.bottomContainer}>
          <Text fontSize={14} fontFamily="Roboto" lineHeight={20}>
            {'Just find the '}
            <Text fontSize={14} fontFamily="Roboto" lineHeight={20} fontWeight="bold">{`GoodDollar Magic Mail`}</Text>
          </Text>
          <Text fontSize={14} fontFamily="Roboto" lineHeight={20}>
            {'that we’ll soon send you '}
          </Text>
        </View>
      </Section.Row>
    </CustomWrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    headerText: {
      paddingBottom: getDesignRelativeHeight(5),
    },
    mainWrapper: {
      display: 'flex',
      paddingHorizontal: 0,
      justifyContent: 'space-evenly',
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      width: '100%',
      maxHeight: getDesignRelativeHeight(175),
      minHeight: getDesignRelativeHeight(95),
      alignSelf: 'center',
    },
    headerContainer: {
      borderBottomWidth: 2,
      borderBottomStyle: 'solid',
      borderBottomColor: theme.colors.primary,
    },
  }
}

const MagicLinkInfo = withStyles(getStylesFromProps)(MagicLinkInfoComponent)

MagicLinkInfo.navigationOptions = {
  title: 'Magic Link',
}

export default withStyles(getStylesFromProps)(MagicLinkInfo)
