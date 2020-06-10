// @flow

// libraries
import React from 'react'
import { View } from 'react-native'

// components
import Wrapper from '../common/layout/Wrapper'
import { CustomButton, Section } from '../common'
import NavBar from '../appNavigation/NavBar'

// hooks
import useOnPress from '../../lib/hooks/useOnPress'

// utils
import { withStyles } from '../../lib/styles'

// import logger from '../../lib/logger/pino-logger'

// const log = logger.child({ from: 'ExportWalletData' })

type BackupWalletProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const ExportWalletData = ({ navigation, styles }: BackupWalletProps) => {
  const { navigate } = navigation

  const handleGoBack = useOnPress(() => navigate('Home'), [navigate])

  return (
    <Wrapper style={styles.wrapper}>
      <NavBar title="EXPORT MY WALLET" goBack={handleGoBack} />
      <Section grow justifyContent="space-between">
        <View style={styles.borderedBox} />
        <View />
      </Section>
      <CustomButton onPress={() => {}}>Done</CustomButton>
    </Wrapper>
  )
}

const styles = ({ theme }) => ({
  wrapper: {
    backgroundImage: 'none',
    backgroundColor: 'none',
    padding: 0,
  },
  borderedBox: {},
})

export default withStyles(styles)(ExportWalletData)
