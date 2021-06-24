import React, { useState } from 'react'
import { formattedNum, formattedPercent } from '../../../../utils'
import { DoubleLogo, Paper } from '../../components'
import { MasterChefV1Details } from '../Details'
import { getTokenIconUrl } from '../../../../kashi/functions'

const KashiLending = ({ farm }: any) => {
    const [expand, setExpand] = useState<boolean>(false)
    return (
        <>
            {farm.type === 'KMP' && (
                <Paper className="ark-800">
                    <div
                        className="grid grid-cols-3 md:grid-cols-4 px-4 py-2  cursor-pointer select-none rounded rounded-b-none"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="  ">{farm && farm.symbol}</div>
                        <div className="hidden md:block   ml-4  right">{'SUSHI'}</div>
                        <div className="   right">{formattedNum(farm.tvl, true)}</div>
                        <div className="   right">
                            {farm.roiPerYear > 100 ? '10000%+' : formattedPercent(farm.roiPerYear * 100)}
                        </div>
                    </div>
                    <div
                        className="grid grid-cols-3 md:grid-cols-4 py-4 px-4 cursor-pointer select-none rounded "
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="flex items-center">
                            <div className="mr-4">
                                <DoubleLogo
                                    a0={'kashiLogo'}
                                    a1={farm.liquidityPair.asset.id}
                                    size={40}
                                    margin={true}
                                    higherRadius={'0px'}
                                />
                            </div>
                            {/* <div className="hidden sm:block">{farm && farm.symbol}</div> */}
                        </div>
                        <div className="md:col-span-1 hidden md:flex flex-row space-x-2 justify-end items-center ml-4">
                            <div>
                                <div className=" right   ">{formattedNum(farm.sushiRewardPerDay)} SUSHI</div>
                                <div className=" right xs">per day</div>
                            </div>
                        </div>
                        <div className="md:col-span-1 flex justify-end items-center">
                            <div>
                                <div className=" right   ">{formattedNum(farm.totalAssetStaked, false)} KMP</div>
                                <div className=" right xs">Market Staked</div>
                            </div>
                        </div>
                        <div className="md:col-span-1 flex justify-end items-center">
                            <div>
                                <div className=" right   lg">
                                    {farm.roiPerYear > 100 ? '10000%+' : formattedPercent(farm.roiPerYear * 100)}
                                    {/* {formattedPercent(farm.roiPerMonth * 100)}{' '} */}
                                </div>
                                <div className=" right xs">annualized</div>
                                {/* <div className="text-gray-500 text-right text-xs">per month</div> */}
                            </div>
                        </div>
                    </div>
                    {expand && (
                        <MasterChefV1Details
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.liquidityPair.collateral.id}
                            token1Address={farm.liquidityPair.asset.id}
                            type={'KMP'}
                            assetSymbol={farm.liquidityPair.asset.symbol}
                            assetDecimals={farm.liquidityPair.asset.decimals}
                        />
                    )}
                </Paper>
            )}
        </>
    )
}

export default KashiLending
