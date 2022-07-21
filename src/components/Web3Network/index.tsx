import React from 'react'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useNetworkModalToggle } from '../../state/application/hooks'
import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import NetworkModal from '../NetworkModal'
import { ButtonOutlined } from '../gd/Button'

function Web3Network(): JSX.Element | null {
    const { chainId, error, active } = useActiveWeb3React()

    const toggleNetworkModal = useNetworkModalToggle()

    if (!chainId || error || !active) return null

    return (
      <>      
        <div
          className="flex items-center rounded p-0.5 whitespace-nowrap   cursor-pointer select-none pointer-events-auto"
          onClick={() => toggleNetworkModal()}
        >
          <ButtonOutlined style={{padding: "0"}}>
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
          <NetworkModal />
        </div>
      </>
    )
}

export default Web3Network
