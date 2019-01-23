import React from "react";
import {
  createNavigator,
  SwitchRouter,
  SwitchView
} from "@react-navigation/core";
import { createBrowserApp, Link } from "@react-navigation/web";
import { Platform } from "react-native";
// import App from './src/App';
import Signup from "./components/signup/SignupState";

const AppNavigation = () => (
  <React.Fragment>
    <div>
      <Link routeName="Buy">Buy</Link>{" - "}
      <Link routeName="Donate">Donate</Link>{" - "}
      <Link routeName="Dashboard">Dashboard</Link>
    </div>
    <div>AppNavigation</div>{" "}
  </React.Fragment>
);

const AppNavigator = createNavigator(
  SwitchView,
  SwitchRouter(
    {
      Signup,
      AppNavigation
    },
    {
      initialRouteName: "Signup"
    }
  ),
  {}
);
let WebRouter;
if (Platform.OS === "web") {
  WebRouter = createBrowserApp(AppNavigator);
}

export { WebRouter };
