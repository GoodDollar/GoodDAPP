import React from 'react'
import { Image, View } from 'react-native'
import { withStyles } from '../../lib/styles'
import Text from '../common/view/Text'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import UpdateVersion from '../../assets/updateversion.svg'
Image.prefetch(UpdateVersion)

const dialogStyles = ({ theme }) => ({
  image: {
    textAlign: 'center',
    height: getDesignRelativeHeight(133),
    width: getDesignRelativeWidth(191),
    marginBottom: getDesignRelativeHeight(25),
  },
  imageContainer: {
    paddingTop: getDesignRelativeHeight(32),
    paddingHorizontal: getDesignRelativeWidth(5),
    display: 'flex',
    alignItems: ' center',
  },
  title: {
    width: '100%',
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingBottom: getDesignRelativeWidth(9),
    marginBottom: getDesignRelativeWidth(9),
  },
  description: {
    minHeight: getDesignRelativeWidth(100),
  },
})

export default withStyles(dialogStyles)(({ styles, theme }) => {
  return (
    <View>
      <View style={styles.imageContainer}>
        <Image source={UpdateVersion} style={styles.image} />
        <Text
          fontSize={22}
          lineHeight={26}
          textAlign="left"
          fontWeight="bold"
          color={theme.colors.darkGray}
          style={styles.title}
        >
          {`Hip hip hooray!\nWe have a new version :)`}
        </Text>
      </View>
      <View style={styles.description}>
        <Text fontSize={14} lineHeight={20} textAlign="left" color={theme.colors.darkGray}>
          Thanks to your awesome feedback we were able to improve our wallet. We hope now you’ll enjoy it even more.
        </Text>
      </View>
    </View>
  )
})
