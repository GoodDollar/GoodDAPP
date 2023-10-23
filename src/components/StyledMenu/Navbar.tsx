import React from 'react'
import { View } from 'native-base'
import { withTheme } from '@gooddollar/good-design'
import { ActionButton } from './ActionButton'

export const navbarTheme = {
    baseStyle: {
        display: 'flex',
        width: '100%',
        backgroundColor: 'primary',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        height: '56px',
        paddingLeft: 6,
        paddingRight: 6,
    },
}

export const NavBar = withTheme({ name: 'NavBar' })(({ ...props }: any) => (
    <View {...props}>
        <ActionButton action="claim" />
        <ActionButton action="swap" />
        <ActionButton isExternal action="dapplib" />
        <ActionButton isExternal action="donate" />
    </View>
))
