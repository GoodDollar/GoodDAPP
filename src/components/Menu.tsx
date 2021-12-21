/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { classNames } from '../functions/styling'
import { ExternalLink } from './Link'
import { ReactComponent as MenuIcon } from '../assets/images/menu.svg'
import { t } from '@lingui/macro'
import { I18n } from '@lingui/core'
import { useLingui } from '@lingui/react'
import { useTheme } from 'styled-components'
import styled from 'styled-components'

const items = (i18n: I18n) => [
    {
        name: i18n._(t`Docs`),
        description: i18n._(t`Documentation for users`),
        href: 'https://docs.gooddollar.org/'
    }
    // {
    //     name: i18n._(t`Dev`),
    //     description: i18n._(t`Documentation for developers`),
    //     href: '#'
    // },
    // {
    //     name: i18n._(t`Open Source`),
    //     description: i18n._(t`GoodDollar is a supporter of open source`),
    //     href: '#'
    // },
    // {
    //     name: i18n._(t`Tools`),
    //     description: i18n._(t`Tools to optimize workflow`),
    //     href: '#'
    // },
    // {
    //     name: i18n._(t`Discord`),
    //     description: i18n._(t`Join the community of discord`),
    //     href: '#'
    // }
]

const MenuLink = styled(ExternalLink)`
    .link-name {
        font-style: normal;
        font-weight: bold;
        font-size: 18px;
        line-height: 21px;
        color: ${({ theme }) => theme.color.text7};
    }

    .link-description {
        font-style: normal;
        font-weight: normal;
        font-size: 16px;
        line-height: 166%;
        letter-spacing: 0.35px;
        color: ${({ theme }) => theme.color.text5};
    }
`

const Panel = styled(Popover.Panel as any)`
    position: absolute;
    z-index: 10;
    right: 0;
    top: 100%;
    transform: translate(0, 35px);
    background-color: ${({ theme }) => theme.color.main};
    width: 384px;
    max-width: 95vw;

    @media ${({ theme }) => theme.media.md} {
        top: unset;
        right: -8px;
        bottom: 100%;
        transform: translate(0, -35px);
    }
`

export default function Menu() {
    const { i18n } = useLingui()
    const solutions = items(i18n)

    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button className={classNames(open ? '' : '', 'focus:outline-none')}>
                        <MenuIcon
                            title="More"
                            className={classNames(open ? '' : '', 'inline-flex items-center ml-2 h-5 w-5')}
                            aria-hidden="true"
                        />
                    </Popover.Button>

                    <Transition
                        show={open}
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Panel static className="rounded-lg">
                            <div className="rounded-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                                <div className="relative grid gap-6 px-4 py-4 sm:gap-8 sm:p-8">
                                    {solutions.map(item => (
                                        <MenuLink
                                            key={item.name}
                                            href={item.href}
                                            className="-m-3 p-2 block rounded-md transition ease-in-out duration-150"
                                        >
                                            <p className="link-name">{item.name}</p>
                                            <p className="link-description">{item.description}</p>
                                        </MenuLink>
                                    ))}
                                </div>
                            </div>
                        </Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}
