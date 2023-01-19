import styled from 'styled-components'
import React, { ComponentType, HTMLAttributes, memo } from 'react'
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
        border-spacing: 0 6px;
        width: 100%;

        thead {
            th {
                padding: 0 6px 3px;
            }
        }

        tbody {
            tr:nth-child(odd) {
                td {
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

            td {
                padding: 15px 8px;
                background: ${({ theme }) => theme.color.main};
                font-weight: 500;
                font-size: 14px;
                line-height: 16px;
                color: ${({ theme }) => theme.color.text4};
            }
        }

        @media ${({ theme }) => theme.media.md} {
            border-spacing: 0 3px;

            thead,
            tbody {
                td {
                    font-size: 12px;
                    padding: 11px 14px;
                }
                th {
                    font-size: 10px;
                }

                tr:nth-child(odd) {
                    td {
                        padding-bottom: 0;
                        border-bottom: unset;
                        &:first-child {
                            border-bottom-left-radius: unset;
                        }

                        &:last-child {
                            border-bottom-right-radius: unset;
                        }
                    }
                }

                tr:nth-child(even) {
                    display: table-row;
                    transform: translateY(-3px);

                    td {
                        display: table-cell;
                        border-bottom: 1px solid ${({ theme }) => theme.color.border2};

                        &:first-child {
                            border-left: 1px solid ${({ theme }) => theme.color.border2};
                            border-bottom-left-radius: 12px;
                        }

                        &:last-child {
                            border-right: 1px solid ${({ theme }) => theme.color.border2};
                            border-bottom-right-radius: 12px;
                        }
                    }
                }
            }
        }
    }
`

const Table = memo(({ children, type = 'default', className, header, footer, ...rest }: TableProps) => {
    return (
        <TableSC className={cn(type, className)} {...rest}>
            {header && <thead>{header}</thead>}
            <tbody>{children}</tbody>
            {footer && <tfoot>{footer}</tfoot>}
        </TableSC>
    )
})

export default Table
