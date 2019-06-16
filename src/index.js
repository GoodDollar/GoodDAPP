import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { init } from './init'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'

// let Main = () => {
//   return (
//     <PaperProvider >
//       <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
//         <View style={{flex: 1,
//           width: '100%',
//           height: '100%',
//           margin: 0,
//           padding: 0,
//           position:'fixed',
//           maxWidth:'1024px',
//           left: '50%',
//           transform:[{ translateX: - Dimensions.get('window').width * 0.24 }]
//           }}>
//           <WebRouter/>
//         </View>
//       </SafeAreaView>
//     </PaperProvider>
//   )
// }

const fontStylesMaterialIcons = `@font-face { src: url(${fontMaterialIcons}); font-family: MaterialIcons; }`
const style = document.createElement('style')
style.type = 'text/css'
if (style.styleSheet) {
  style.styleSheet.cssText = fontStylesMaterialIcons
} else {
  style.appendChild(document.createTextNode(fontStylesMaterialIcons))
}
// Inject stylesheet
document.head.appendChild(style)

init().then(() => {
  ReactDOM.render(<App />, document.getElementById('root'))
})

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
