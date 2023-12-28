// @flow
import React from 'react'
import { Image, Platform, TouchableOpacity } from 'react-native'

import Icon from '../../../common/view/Icon'
import { withStyles } from '../../../../lib/styles'
import useOnPress from '../../../../lib/hooks/useOnPress'
import useActionLink from '../hooks/useActionLink'

type ActionButtonProps = {
  styles: any,
  action: string,
}

const ActionButton = ({ styles, action, size = 48, image, isSocial }: ActionButtonProps) => {
  const { actionIcon, trackClicked, goToExternal } = useActionLink(action, isSocial)

  const onPress = useOnPress(() => {
    trackClicked()
    goToExternal()
  }, [goToExternal, trackClicked])

  return (
    <TouchableOpacity onPress={onPress} style={image ? styles.actionImage : styles.actionIcon}>
      {image ? (
        <Image resizeMode="contain" source={image} style={styles.icons} />
      ) : (
        <Icon name={actionIcon} size={size} color="white" />
      )}
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => ({
  actionIcon: {
    marginLeft: 10,
    marginRight: 10,
  },
  actionImage: {
    display: 'flex',
    justifyContent: 'center',
    marginLeft: 0,
  },
  icons: {
    width: 24,
    height: 24,
    minWidth: '15%',
    ...Platform.select({
      web: {
        margin: 10,
      },
      android: {
        margin: 5,
      },
    }),
  },
})

export default withStyles(getStylesFromProps)(ActionButton)
