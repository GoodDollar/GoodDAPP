import React from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import styled from 'styled-components'

const Wrapper = styled.div`
    font-style: normal;
    font-weight: 900;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0.1px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.color.text5};
    user-select: none;

    .sort svg {
        color: ${({ theme }) => theme.color.input};
    }

    @media ${({ theme }) => theme.media.md} {
        font-size: 10px;
        line-height: 1.2;
    }
`

function ListHeaderWithSort({
    className = '',
    sort,
    sortKey,
    direction = 'ascending',
    children
}: {
    className?: any
    sort: any
    sortKey: any
    direction?: any
    children: any
}) {
    return (
        <Wrapper
            className={`flex items-center cursor-pointer justify-start ${className}`}
            onClick={() => sort.requestSort(sortKey, direction)}
        >
            <div>{children}</div>
            <div
                className="sort"
                style={{ visibility: sort.sortConfig && sort.sortConfig.key === sortKey ? 'visible' : 'hidden' }}
            >
                {(sort.sortConfig.direction === 'ascending' && <ChevronUp size={14} className="ml-1" />) ||
                    (sort.sortConfig.direction === 'descending' && <ChevronDown size={14} className="ml-1" />)}
            </div>
        </Wrapper>
    )
}

export default ListHeaderWithSort
