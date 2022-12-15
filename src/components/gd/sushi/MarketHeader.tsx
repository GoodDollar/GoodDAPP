import React from 'react'
import styled from 'styled-components'

const Title = styled.div`
    font-style: normal;
    font-weight: bold;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.color.text4};
`

const Search = styled.div`
    background: ${({ theme }) => theme.color.main};
    border: 1px solid ${({ theme }) => theme.color.text5};
    box-sizing: border-box;
    border-radius: 6px;
    width: 288px;

    input {
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 24px;
        &,
        &::placeholder {
            color: ${({ theme }) => theme.color.text4};
        }
    }

    .icon {
        position: absolute;
        right: 9px;
        top: 50%;
        transform: translateY(-50%);
    }

    @media screen and (max-width: 768px) {
        width: 100%;
    }
`

function MarketHeader({ title, titleClass, lists, noSearch = false }: any) {
    if (lists.setTerm) {
        lists = [lists]
    }

    function onSearch(term: any) {
        lists.forEach((list: any) => {
            list.setTerm(term)
        })
    }

    return (
        <div className="flex flex-col justify-between w-full md:flex-row md:items-center md:mb-6">
            <div className="flex items-center w-1/2">
                <Title className={`md:pl-4 ${titleClass}`}>{title}</Title>
            </div>
            {!noSearch && (
                <div className="flex w-full py-4 md:justify-end md:py-0">
                    <Search className="relative w-full max-w-md" hidden={noSearch}>
                        <input
                            className={`py-2 pl-4 pr-10 rounded w-full focus:outline-none focus:ring focus:ring-blue`}
                            onChange={(e) => onSearch(e.target.value)}
                            value={lists[0].term}
                            placeholder="Search by symbol"
                        />
                        <div className="pointer-events-none icon">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
                                    fill="#00B0FF"
                                />
                            </svg>
                        </div>
                    </Search>
                </div>
            )}
        </div>
    )
}

export default MarketHeader
