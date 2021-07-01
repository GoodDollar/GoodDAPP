import styled from 'styled-components'
import React, { ComponentType, HTMLAttributes, memo, ReactElement } from 'react'
import cn from 'classnames'

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
    type?: 'default'
    as?: keyof JSX.IntrinsicElements | ComponentType<Partial<Omit<TableProps, 'as'>>>
    header?: JSX.IntrinsicElements['tr']
    footer?: JSX.IntrinsicElements['tr']
}

export const TableSC = styled.table`
    &.default {
        border-collapse: separate;
        border-spacing: 0 3px;
        width: 100%;

        thead {
            th {
                padding: 0 15px 3px;
            }
        }

        tbody {
            td {
                padding: 15px;
                background: ${({ theme }) => theme.color.main};
                font-weight: 500;
                font-size: 14px;
                line-height: 16px;
                color: ${({ theme }) => theme.color.text4};
                border-top: 1px solid ${({ theme }) => theme.color.border2};
                border-bottom: 1px solid ${({ theme }) => theme.color.border2};

                &:first-child {
                    border-left: 1px solid ${({ theme }) => theme.color.border2};
                    border-top-left-radius: 12px;
                    border-bottom-left-radius: 12px;
                }

                &:last-child {
                    border-right: 1px solid ${({ theme }) => theme.color.border2};
                    border-top-right-radius: 12px;
                    border-bottom-right-radius: 12px;
                }
            }
        }
    }
`

const Table = ({ children, type = 'default', className, header, footer, ...rest }: TableProps) => {
    return (
        <TableSC className={cn(type, className)} {...rest}>
            {header && <thead>{header}</thead>}
            <tbody>{children}</tbody>
            {footer && <tfoot>{footer}</tfoot>}
        </TableSC>
    )
}

export default memo(Table)
