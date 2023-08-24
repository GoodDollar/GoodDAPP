---
description: >-
  Common components meant to be used across the app, this components ensure
  consistency and helps to make changes and further development faster.
---

# Building Blocks

There are a[ list of several common](../docs/dapp/components/common.md) components being used across the app that should be considered before creating new components.

This components \(as all other component\) are [react-native-web](https://github.com/necolas/react-native-web) based. Specially components with interactions follow material guidelines and are based on [react-native-paper](https://reactnativepaper.com/)

This components includes components to visualize and input G\$, buttons, and profile related components as avatars components. [Check the full list in common](../docs/dapp/components/common.md)

# Common components

## How to use Icon component with your custom svg

Pre requirement:

A. has to be svg-icon, in 24x24 (can be bigger/smaller ofcourse, but works best with square format) 

B. it does not support all svg features and might not show correctly.. see: [importing svg to fontello](https://github.com/fontello/fontello/wiki/How-to-use-custom-images#importing-svg-images)

1. go to [fontello.com](https://fontello.com)
2. drag the [config.json](https://github.com/GoodDollar/GoodDAPP/tree/master/src/assets/fonts/config.json) to the custom icon field on fontello
3. drag your new svg icon to this field (Or select an existing one from the list below)
4. click on edit with the icon you just added
5. change the name to something short/simple (convience mostly)
6. top-right, download webfont and extract
7. go to extracted folder

   8A. in /fonts folder, change the names of the font files to gooddollar.X

   8B. in /css rename fontello.css > index.css

   8C. in index.css change font-family name to "gooddollar" (twice!)

   8D. in index.css change the paths of the fonts to ./gooddollar.<font>

   8E. in config.json change name to "gooddollar"

   8F. copy over the index.css + config.json + fonts to the fonts folder on gooddapp and replace existing files

Then all you have to is use our [Icon](https://github.com/GoodDollar/GoodDAPP/tree/master/src/components/common/view/Icon/)

```
import Icon from 'src/components/common/view/Icon/'

<Icon name=<icon name you used on step 5> size={size} color={color}>

```
