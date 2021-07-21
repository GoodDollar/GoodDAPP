import React, { memo, useCallback, useState } from 'react'
import { ButtonDefault } from 'components/gd/Button'
import Withdraw from 'components/Withdraw'

interface PortfolioTableRowProps {}

function PortfolioTableRow({}: PortfolioTableRowProps) {
    const [isWithdrawOpen, setWithdrawOpen] = useState(false)
    const handleWithdrawOpen = useCallback(() => setWithdrawOpen(true), [])

    return (
        <>
            <Withdraw
                open={isWithdrawOpen}
                setOpen={setWithdrawOpen}
                token={'dai'}
                totalStake={20900}
                protocol={'compound'}
            />
            <tr>
                <td>UBI</td>
                <td>DAI</td>
                <td>COMPOUND</td>
                <td>
                    <span className="whitespace-nowrap">1,000 DAI</span> <br />
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
                    <ButtonDefault size="sm" width="99px" onClick={handleWithdrawOpen}>
                        Withdraw
                    </ButtonDefault>
                </td>
            </tr>
            <tr className="mobile">
                <td colSpan={8}>
                    <ButtonDefault size="sm" width="99px" onClick={handleWithdrawOpen}>
                        Withdraw
                    </ButtonDefault>
                </td>
            </tr>
        </>
    )
}

export default memo(PortfolioTableRow)
