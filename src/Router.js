import React from 'react'
import {
  createNavigator,
  SwitchRouter,
  SwitchView
} from "@react-navigation/core";
import { createBrowserApp } from "@react-navigation/web";
import { Platform } from "react-native"
// import App from './src/App';
import Signup from "./components/signup/SignupState"

const About = () => <div>about</div>

const AppNavigator = createNavigator(
  SwitchView,
  SwitchRouter({
    About,
    Signup
  },{
    initialRouteName: "Signup"
  }
  ),
  {}
);
let WebRouter
if(Platform.OS === "web")
{
  WebRouter = createBrowserApp(AppNavigator);
}

export {WebRouter}

