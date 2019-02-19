import { AppRegistry } from 'react-native';
import App from './src/App';
import { init } from './src/init'

init().then( () => {
  AppRegistry.registerComponent('creaternwapp', () => App);
})
