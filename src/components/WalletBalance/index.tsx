import React, {Fragment, useEffect, useState} from 'react'
import { ChainId, TokenAmount } from '@sushiswap/sdk'
import { AdditionalChainId } from '../../constants'
import { CustomLightSpinner } from 'theme'
import Circle from 'assets/images/blue-loader.svg'
import { LoadingPlaceHolder } from 'theme/components'

export interface Balances {
  G$: TokenAmount | undefined,
  GDX: TokenAmount | undefined,
  GDAO: TokenAmount | undefined
}

export type WalletBalanceProps = {
  balances: Balances,
  chainId: ChainId,
}

export default function WalletBalance(props: WalletBalanceProps): JSX.Element {
  const { balances, chainId } = props
  const [balance, setBalance] = useState<JSX.Element[]>()

  useEffect(() => {
    const newBalance = Object.entries(balances).map((balance) => {
      const token = balance[0]
      const amount = balance[1]
      if ((chainId as any) === AdditionalChainId.FUSE && token === 'GDX') return <div key={token}></div>
      const frag = (
        <Fragment key={token}>
          <span className="flex">
            {token} - {
              !amount ?
                <LoadingPlaceHolder /> :
                token === 'GDAO' ?
                  amount.toSignificant(6, {groupSeperator: ','}) :
                  amount.toExact({ groupSeperator: ','})
            }
          </span>
        </Fragment>
      )
      return frag
    })
    setBalance(newBalance)
  }, [chainId, balances])

  return (
      <div className="flex flex-col">
      { balance }
      </div>
    )
}