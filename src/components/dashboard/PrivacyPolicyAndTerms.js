// @flow

// libraries
import React, { useEffect, useMemo, useState } from 'react'
import { Platform, View } from 'react-native'

// components
import Section from '../common/layout/Section'
import CustomButton from '../common/buttons/CustomButton'
import { PrivacyPolicy, TermsOfUse } from '../webView/webViewInstances'
import { Wrapper } from '../common'

// utils
import { withStyles } from '../../lib/styles'
import normalizeText from '../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'

type Props = {
  styles: any,
  navigation: any,
}

const TERMS_OF_USE_TITLE = 'Terms of Use'
const TERMS_OF_USE_KEY = 'tou'

const PRIVACY_POLICY_TITLE = 'Privacy Policy'
const PRIVACY_POLICY_KEY = 'pp'

const scenesMap = [
  {
    key: TERMS_OF_USE_KEY,
    title: TERMS_OF_USE_TITLE,
    Component: TermsOfUse,
  },
  {
    key: PRIVACY_POLICY_KEY,
    title: PRIVACY_POLICY_TITLE,
    Component: PrivacyPolicy,
  },
]

const NavButton = ({ styles, title, isActive, onPress }) => {
  return (
    <CustomButton
      mode="text"
      style={[styles.navButton, isActive && styles.activeNavButton]}
      textStyle={[styles.navButtonText, isActive && styles.activeNavButtonText]}
      onPress={onPress}
      roundness={0}
    >
      {title}
    </CustomButton>
  )
}

const PrivacyPolicyAndTerms = ({ navigation, styles }: Props) => {
  const { setParams } = navigation
  const [active, setActive] = useState(TERMS_OF_USE_KEY)

  const { navButtons, scenes } = useMemo(() => {
    const navButtons = []
    const scenes = []

    scenesMap.forEach(scene => {
      const { key, title, Component } = scene
      const isActive = active === key

      navButtons.push(
        <NavButton key={key} title={title} styles={styles} isActive={isActive} onPress={() => setActive(key)} />,
      )
      scenes.push(
        <View key={key} style={[styles.sceneWrapper, isActive && styles.activeScene]}>
          <Component />
        </View>,
      )
    })

    return { navButtons, scenes }
  }, [active])

  useEffect(() => {
    const sceneDetails = scenesMap.find(scene => scene.key === active)

    setParams({ title: sceneDetails.title })
  }, [active])

  return (
    <Wrapper style={{ padding: 0 }}>
      <Section.Stack style={styles.wrapper}>
        <Section.Row>{navButtons}</Section.Row>
        <Section.Stack grow style={styles.scenesContainer}>
          {scenes}
        </Section.Stack>
      </Section.Stack>
    </Wrapper>
  )
}

const styles = ({ theme }) => ({
  wrapper: {
    flex: 1,
    flexBasis: 1,
    backgroundColor: 'white',
    padding: theme.sizes.defaultDouble,
    paddingVertical: theme.sizes.default,
  },
  navButton: {
    width: '50%',
  },
  navButtonText: {
    color: theme.colors.gray50Percent,
    fontSize: normalizeText(18),
    lineHeight: normalizeText(28),
    letterSpacing: 0.18,
    fontFamily: 'Roboto Slab',
    fontWeight: 'bold',
  },
  activeNavButton: {
    borderBottomWidth: 3,
    ...Platform.select({
      web: {
        borderBottomStyle: 'solid',
      },
    }),
    borderBottomColor: theme.colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  activeNavButtonText: {
    color: theme.colors.text,
  },
  scenesContainer: {
    flex: 1,
    marginTop: getDesignRelativeHeight(32),
  },
  sceneWrapper: {
    flex: 1,

    display: 'none',
  },
  activeScene: {
    zIndex: 1,
    display: 'flex',
  },
  ok: {
    marginTop: getDesignRelativeHeight(15),
    width: '100%',
  },
})

PrivacyPolicyAndTerms.navigationOptions = ({ navigation }) => ({
  title: navigation.getParam('title'),
})

export default withStyles(styles)(PrivacyPolicyAndTerms)
