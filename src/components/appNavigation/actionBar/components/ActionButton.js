// @flow
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from '../../../common/view/Icon'
import { withStyles } from '../../../../lib/styles'
import useOnPress from '../../../../lib/hooks/useOnPress'
import useActionLink from '../hooks/useActionLink'

type ActionButtonProps = {
  styles: any,
  action: string,
}

const ActionButton = ({ styles, action }: ActionButtonProps) => {
  const { actionIcon, trackClicked, goToExternal } = useActionLink(action)

  const onPress = useOnPress(() => {
    trackClicked()
    goToExternal()
  }, [goToExternal, trackClicked])

  return (
    <TouchableOpacity onPress={onPress} style={styles.actionItem}>
      <Icon name={actionIcon} size={48} color="white" />
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
