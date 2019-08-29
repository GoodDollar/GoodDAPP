// @flow
import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import Text from '../view/Text'
import Icon from '../view/Icon'
import CustomButton from './CustomButton'

const NOT_SAVED = 'NOT_SAVED'
const SAVING = 'SAVING'
const DONE = 'DONE'
const TRANSITION_TIME = 1000

type SaveButtonProps = {
  children?: any,
  beforeSave?: () => boolean,
  onPress: () => void,
  onPressDone?: () => void,
  doneDelay?: number,
  styles: any,
  theme: any,
  style?: any,
  color?: string,
}

const SaveButton = ({ children, onPress, onPressDone, doneDelay, styles, theme, ...props }: SaveButtonProps) => {
  const [state, setState] = useState(NOT_SAVED)
  const pressAndNextState = async () => {
    setState(SAVING)

    const result = await onPress()

    if (result === false) {
      setState(NOT_SAVED)
    } else {
      setState(DONE)
      setTimeout(onPressDone, doneDelay)
    }
  }

  const backgroundColor = theme.colors.darkBlue

  return (
    <View style={styles.wrapper}>
      {state === DONE ? (
        <TouchableOpacity cursor="inherit" style={[styles.iconButton, { backgroundColor }]}>
          <Icon size={16} name="success" color={theme.colors.surface} />
        </TouchableOpacity>
      ) : (
        <CustomButton
          {...props}
          color={backgroundColor}
          loading={state === SAVING}
          compact={true}
          iconSize={16}
          style={[styles.saveButton, props.style]}
          onPress={pressAndNextState}
        >
          <Text
            color="surface"
            textTransform="uppercase"
            fontSize={14}
            fontWeight="medium"
            style={styles.customButtonText}
          >
            {children || 'Save'}
          </Text>
        </CustomButton>
      )}
    </View>
  )
}

SaveButton.defaultProps = {
  mode: 'contained',
  doneDelay: TRANSITION_TIME,
  onPressDone: () => {},
}

const getStylesFromProps = ({ theme }) => ({
  wrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginVertical: 0,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveButton: {
    minWidth: 86,
  },
  customButtonText: {
    paddingTop: 1,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 21,
    display: 'flex',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
})

export default withStyles(getStylesFromProps)(SaveButton)
