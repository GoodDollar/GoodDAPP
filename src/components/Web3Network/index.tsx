import React from 'react'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
// import { useActiveOnboard } from 'hooks/useActiveOnboard'
import { useNetworkModalToggle } from '../../state/application/hooks'
import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import NetworkModal from '../NetworkModal'
import { ButtonOutlined } from '../gd/Button'
import useMetaMask from 'hooks/useMetaMask'

function Web3Network(): JSX.Element | null {
    const { chainId } = useActiveWeb3React()

    const isMetaMask = useMetaMask()

    const toggleNetworkModal = useNetworkModalToggle()

    if (!chainId) return null

    return (
      <>      
        { isMetaMask && (
              <div
              className="flex items-center rounded p-0.5 whitespace-nowrap   cursor-pointer select-none pointer-events-auto"
              onClick={() => toggleNetworkModal()}
          >
              <ButtonOutlined>
                  <div className="grid items-center grid-flow-col px-3 py-2 rounded-lg pointer-events-auto auto-cols-max">
                      <img
                          src={NETWORK_ICON[chainId]}
                          alt="Switch Network"
                          className="mr-2 rounded-md"
                          style={{ width: 22, height: 22 }}
                      />
                      <div className="">{NETWORK_LABEL[chainId]}</div>
                  </div>
              </ButtonOutlined>
              {/* <div
                  className="bg-no-repeat bg-cover bg-chain-static hover:bg-chain-animated"
                  style={{ width: 22, height: 22 }}
              /> */}
                <NetworkModal />
          </div>
        )}
      </>
    )
}

export default Web3Network
