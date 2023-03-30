// @flow
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from '../view/Icon'
import { withStyles } from '../../../lib/styles'
import useOnPress from '../../../lib/hooks/useOnPress'

type ActionButtonProps = {
  src: string,
  styles: any,
  onPress: ((event: any) => Promise<any>) | undefined,
}

const ActionButton = (props: ActionButtonProps) => {
  const { src, styles, onPress } = props
  const _onPress = useOnPress(() => onPress(src), [src, onPress])

  return (
    <TouchableOpacity onPress={_onPress} style={styles.actionItem}>
      <Icon name={src} testID={src} size={48} color="white" />
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => ({
  actionItem: {
    marginLeft: 10,
    marginRight: 10,
  },
})

export default withStyles(getStylesFromProps)(ActionButton)
