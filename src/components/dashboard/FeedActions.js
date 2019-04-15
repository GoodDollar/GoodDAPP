import React from 'react'
import { StyleSheet } from 'react-native'
import { Alert, TouchableHighlight, Text, View } from 'react-native-web'

export default () => (
  <View style={styles.actionsContainer}>
    <TouchableHighlight
      style={[styles.actionButton, styles.actionButtonDestructive]}
      onPress={() => {
        Alert.alert('Tips', 'You could do something with this remove action!')
      }}
    >
      <Text style={styles.actionButtonText}>Delete</Text>
    </TouchableHighlight>
  </View>
)

const styles = StyleSheet.create({
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10
  },
  actionButton: {
    padding: 10,
    borderRadius: 6,
    width: 80,
    backgroundColor: '#808080',
    marginRight: 5,
    marginLeft: 5
  },
  actionButtonDestructive: {
    backgroundColor: '#ff4b21'
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center'
  }
})
