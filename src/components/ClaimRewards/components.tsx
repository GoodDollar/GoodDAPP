import Checkbox from 'components/Checkbox';
import React from 'react'

import styled from 'styled-components'

const RewardSC = styled.div<{ active: boolean }>`
    .name {
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 22px;
        color: #54698B;
    }

    .amount {
        font-style: normal;
        font-weight: 700;
        font-size: 14px;
        line-height: 22px;
        text-align: right;
        text-transform: uppercase;
        color: ${({ active }) => active ? '#04C899' : '#42454A'};;
        padding: 4px;
        background: ${({ active }) => active ? '#E6F9F5' : 'transparent'};
        border-radius: 4px;
    }
`;

export const Reward = ({name, amount, active}: {name: string; amount: string; active: boolean}) => (
    <RewardSC className='flex justify-between mb-1 items-center' active={active}>
        <div className='name'>{name}</div>
        <div className='amount'>{amount}</div>
    </RewardSC>
    );

export const ChekboxItem = ({label, onClick, name, checked}: { name: string; label: string; checked: boolean; onClick: () => void}) => (
    <div className='flex items-center mx-4 my-3'>
        <Checkbox name={name} set={onClick} checked={checked}/>
        <p className='ml-2 font-medium text-sm'>{label}</p>
    </div>
)
