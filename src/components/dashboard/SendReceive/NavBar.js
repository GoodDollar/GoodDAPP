import React, { useCallback, useContext } from 'react'
import AppNavBar from '../../appNavigation/NavBar'
import { TokenContext } from '../../../lib/wallet/GoodWalletProvider'
import { NetworkName } from '../../appNavigation/TabsView'
import { withStyles } from '../../../lib/styles'

const NavBar = ({ title, screenProps }) => {
  const { token } = useContext(TokenContext)
  const goBack = useCallback(() => screenProps.pop(), [screenProps])

  return (
    <AppNavBar goBack={goBack} title={`${title} ${token}`}>
      <NetworkName />
    </AppNavBar>
  )
}

const getStylesFromProps = ({ theme }) => ({})

export default withStyles(getStylesFromProps)(NavBar)
