import React, { memo } from 'react'
import { Layout } from '../../kashi'
import { PortfolioAnalyticSC, PortfolioSC, PortfolioValueSC, PortfolioTitleSC } from './styled'
import Title from '../../components/gd/Title'
import Card from '../../components/gd/Card'
import { ButtonAction, ButtonDefault } from '../../components/gd/Button'
import Table from '../../components/gd/Table'

const Portfolio = () => {
    return (
        <Layout>
            <PortfolioSC>
                <Title className="mb-6 pl-4">Portfolio</Title>
                <Card className="mb-4">
                    <PortfolioAnalyticSC className="flex">
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">My Stake</Title>
                            <PortfolioValueSC>~$30,000</PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">
                                Total Rewards to Date <br /> (G$ & GDAO)
                            </Title>
                            <PortfolioValueSC>~1,000 G$</PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">G$ Rewards</Title>
                            <PortfolioValueSC>$100</PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">GDAO Rewards</Title>
                            <PortfolioValueSC>~1,000 GDAO</PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">Your social contribution from:</Title>
                        </div>
                    </PortfolioAnalyticSC>
                </Card>
                <Card className="mb-4">
                    <PortfolioAnalyticSC className="flex">
                        <div className="flex flex-col justify-center flex-grow">
                            <PortfolioTitleSC>
                                Claimable <br /> rewards
                            </PortfolioTitleSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">G$ Rewards</Title>
                            <PortfolioValueSC>~1,000 G$ / ~$100</PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">GDAO Rewards</Title>
                            <PortfolioValueSC>~1,000 GDAO</PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-center items-end flex-grow">
                            <ButtonDefault width={'156px'}>Withdraw rewards</ButtonDefault>
                        </div>
                    </PortfolioAnalyticSC>
                </Card>
                <PortfolioTitleSC className="mb-3 pl-2">Ethereum</PortfolioTitleSC>
                <Card contentWrapped={false}>
                    <Table
                        header={
                            <tr>
                                <th>
                                    <Title type={'category'}>TYPE</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>TOKEN</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>PROTOCOL</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>STAKE</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>G$ REWARDS</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>MULTIPLIER</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>GDAO REWARDS</Title>
                                </th>
                                <th></th>
                            </tr>
                        }
                    >
                        <tr>
                            <td>UBI</td>
                            <td>DAI</td>
                            <td>COMPOUND</td>
                            <td>
                                1,000 DAI <br />
                                1,000$
                            </td>
                            <td>
                                100 G$ <br />
                                ~10$
                            </td>
                            <td>
                                This month 0.5X <br />
                                Next month: 1.0X
                            </td>
                            <td>10 GDAO</td>
                            <td>
                                <ButtonDefault size="sm" width="99px">
                                    Withdraw
                                </ButtonDefault>
                            </td>
                        </tr>
                        <tr>
                            <td>UBI</td>
                            <td>DAI</td>
                            <td>COMPOUND</td>
                            <td>
                                1,000 DAI <br />
                                1,000$
                            </td>
                            <td>
                                100 G$ <br />
                                ~10$
                            </td>
                            <td>
                                This month 0.5X <br />
                                Next month: 1.0X
                            </td>
                            <td>10 GDAO</td>
                            <td>
                                <ButtonDefault size="sm" width="99px">
                                    Withdraw
                                </ButtonDefault>
                            </td>
                        </tr>
                    </Table>
                </Card>
            </PortfolioSC>
        </Layout>
    )
}

export default memo(Portfolio)
