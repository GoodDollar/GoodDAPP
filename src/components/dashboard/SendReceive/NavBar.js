import React, { useContext } from 'react'
import AppNavBar from '../../appNavigation/NavBar'
import { TokenContext } from '../../../lib/wallet/GoodWalletProvider'
import { NetworkName } from '../../appNavigation/TabsView'

const NavBar = ({ title, goBack }) => {
  const { token } = useContext(TokenContext)

  return (
    <AppNavBar goBack={goBack} title={`${title} ${token}`}>
      <NetworkName icon={false} />
    </AppNavBar>
  )
}

export default NavBar
